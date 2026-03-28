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

// Re-export so rollup IIFE exposes them as lila.* for the global-scope footer wrappers
export { matchInit, matchJoin, matchJoinAttempt, matchLeave, matchLoop, matchSignal, matchTerminate };
export { matchmakerMatched };
export { initLeaderboards, rpcGetLeaderboard };

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
