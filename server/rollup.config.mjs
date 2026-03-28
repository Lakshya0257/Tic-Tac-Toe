import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/main.ts",
  output: {
    file: "build/index.js",
    format: "iife",
    name: "lila",
    // Expose InitModule on global scope so Nakama can find it after script eval
    footer: "var InitModule = lila.InitModule;",
    sourcemap: false,
  },
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
  ],
};
