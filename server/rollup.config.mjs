import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/main.ts",
  output: {
    file: "build/index.js",
    format: "iife",
    name: "lila",
    // Nakama 3.37 requires match handler functions to be globally declared by name.
    // The global InitModule bypasses lila.InitModule and registers the global wrappers directly.
    footer: [
      "function matchInit() { return lila.matchInit.apply(this, arguments); }",
      "function matchJoinAttempt() { return lila.matchJoinAttempt.apply(this, arguments); }",
      "function matchJoin() { return lila.matchJoin.apply(this, arguments); }",
      "function matchLeave() { return lila.matchLeave.apply(this, arguments); }",
      "function matchLoop() { return lila.matchLoop.apply(this, arguments); }",
      "function matchTerminate() { return lila.matchTerminate.apply(this, arguments); }",
      "function matchSignal() { return lila.matchSignal.apply(this, arguments); }",
      "function matchmakerMatched() { return lila.matchmakerMatched.apply(this, arguments); }",
      "function rpcGetLeaderboard() { return lila.rpcGetLeaderboard.apply(this, arguments); }",
      "function rpcHealthcheck(_c, _l, _n, _p) { return JSON.stringify({ ok: true }); }",
      "function InitModule(ctx, logger, nk, initializer) {",
      "  initializer.registerMatch('tictactoe', { matchInit: matchInit, matchJoinAttempt: matchJoinAttempt, matchJoin: matchJoin, matchLeave: matchLeave, matchLoop: matchLoop, matchTerminate: matchTerminate, matchSignal: matchSignal });",
      "  initializer.registerMatchmakerMatched(matchmakerMatched);",
      "  initializer.registerRpc('get_leaderboard', rpcGetLeaderboard);",
      "  initializer.registerRpc('healthcheck', rpcHealthcheck);",
      "  lila.initLeaderboards(nk, logger);",
      "  logger.info('Lila module loaded.');",
      "}",
    ].join("\n"),
    sourcemap: false,
  },
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
  ],
};
