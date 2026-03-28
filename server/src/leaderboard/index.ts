import { MatchState, PlayerStats } from "../types";

const STATS_COLLECTION = "player_stats";
const STATS_KEY = "stats";
const WINS_LEADERBOARD = "wins_alltime";
const STREAK_LEADERBOARD = "win_streak";

export function initLeaderboards(nk: nkruntime.Nakama, logger: nkruntime.Logger): void {
  try {
    nk.leaderboardCreate(WINS_LEADERBOARD, true, nkruntime.SortOrder.DESCENDING, nkruntime.Operator.INCREMENT, "", {}, true);
    nk.leaderboardCreate(STREAK_LEADERBOARD, true, nkruntime.SortOrder.DESCENDING, nkruntime.Operator.BEST, "", {}, true);
    logger.info("Leaderboards initialised.");
  } catch (e: any) {
    logger.error("Failed to create leaderboards: %s", e.message);
  }
}

function readPlayerStats(nk: nkruntime.Nakama, userId: string): PlayerStats {
  try {
    var results = nk.storageRead([{ collection: STATS_COLLECTION, key: STATS_KEY, userId: userId }]);
    if (results && results.length > 0) return results[0].value as PlayerStats;
  } catch (_) {}
  return { wins: 0, losses: 0, draws: 0, currentStreak: 0, bestStreak: 0 };
}

function writePlayerStats(nk: nkruntime.Nakama, userId: string, stats: PlayerStats): void {
  nk.storageWrite([{
    collection: STATS_COLLECTION,
    key: STATS_KEY,
    userId: userId,
    value: stats,
    permissionRead: 2,
    permissionWrite: 0,
  }]);
}

export function recordMatchResult(nk: nkruntime.Nakama, logger: nkruntime.Logger, state: MatchState): void {
  var playerIds = Object.keys(state.players);
  if (playerIds.length !== 2) return;

  var isDraw = state.winner === "draw";

  for (var i = 0; i < playerIds.length; i++) {
    var userId = playerIds[i];
    var player = state.players[userId];
    var didWin = !isDraw && state.winnerId === userId;
    var stats = readPlayerStats(nk, userId);

    if (isDraw) {
      stats.draws++;
      stats.currentStreak = 0;
    } else if (didWin) {
      stats.wins++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
    } else {
      stats.losses++;
      stats.currentStreak = 0;
    }

    try {
      writePlayerStats(nk, userId, stats);
      if (didWin) {
        nk.leaderboardRecordWrite(WINS_LEADERBOARD, userId, player.username, 1, 0, {});
        nk.leaderboardRecordWrite(STREAK_LEADERBOARD, userId, player.username, stats.bestStreak, 0, {});
      }
    } catch (e: any) {
      logger.error("Failed to write stats for %s: %s", userId, e.message);
    }
  }
}

export const rpcGetLeaderboard: nkruntime.RpcFunction = function (_ctx, logger, nk, _payload) {
  try {
    var result = nk.leaderboardRecordsList(WINS_LEADERBOARD, [], 20, undefined, 0);
    var records = result.records || [];
    var enriched = [];

    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      var stats = readPlayerStats(nk, record.ownerId);
      enriched.push({
        rank: record.rank,
        userId: record.ownerId,
        username: record.username,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        bestStreak: stats.bestStreak,
      });
    }

    return JSON.stringify({ records: enriched });
  } catch (e: any) {
    logger.error("rpcGetLeaderboard error: %s", e.message);
    return JSON.stringify({ records: [] });
  }
};
