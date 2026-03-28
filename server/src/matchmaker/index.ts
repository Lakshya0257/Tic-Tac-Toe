export const matchmakerMatched: nkruntime.MatchmakerMatchedFunction = function (_ctx, logger, nk, matches) {
  if (!matches || matches.length === 0) {
    logger.error("matchmakerMatched called with empty matches array");
    return;
  }

  var firstMatch = matches[0];
  var gameMode = "classic";
  if (firstMatch.users && firstMatch.users.length > 0 && firstMatch.users[0].stringProperties) {
    gameMode = firstMatch.users[0].stringProperties["game_mode"] || "classic";
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
