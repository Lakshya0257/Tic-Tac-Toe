import {
  matchInit,
  matchJoin,
  matchJoinAttempt,
  matchLeave,
  matchLoop,
  matchSignal,
  matchTerminate,
} from "./match-handler/index";
import { matchmakerMatched } from "./matchmaker/index";
import { initLeaderboards, rpcGetLeaderboard } from "./leaderboard/index";

export function InitModule(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  initializer: nkruntime.Initializer
): void {
  initializer.registerMatch("tictactoe", {
    matchInit,
    matchJoinAttempt,
    matchJoin,
    matchLeave,
    matchLoop,
    matchTerminate,
    matchSignal,
  });

  initializer.registerMatchmakerMatched(matchmakerMatched);
  initializer.registerRpc("get_leaderboard", rpcGetLeaderboard);
  initializer.registerRpc("healthcheck", function (_ctx, _logger, _nk, _payload) {
    return JSON.stringify({ ok: true });
  });

  initLeaderboards(nk, logger);
  logger.info("Lila module loaded.");
}
