export const matchmakerMatched: nkruntime.MatchmakerMatchedFunction = function (_ctx, logger, nk, matches) {
  if (!matches || matches.length === 0) {
    logger.error("matchmakerMatched called with empty matches array");
    return;
  }

  var gameMode = "classic";
  var first = matches[0];
  if (first && first.properties && first.properties["game_mode"]) {
    gameMode = first.properties["game_mode"];
  }

  try {
    var matchId = nk.matchCreate("tictactoe", {
      timed: gameMode === "timed" ? "true" : "false",
      turnDuration: "30",
    });
    logger.info("Created match %s (mode: %s)", matchId, gameMode);
    return matchId;
  } catch (e: any) {
    logger.error("Failed to create match: %s", e.message);
    return;
  }
};
