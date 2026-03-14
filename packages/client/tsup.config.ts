import { defineConfig } from "tsup";

const isProduction = process.env["NODE_ENV"] === "production";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["cjs", "esm"],
  dts: false,
  clean: false,
  sourcemap: true,
  external: [],
  treeshake: true,
  minify: isProduction,
  target: "node18",
  outDir: "dist",
  splitting: false,
  esbuildOptions(options) {
    if (isProduction) {
      options.drop = ["console", "debugger"];
    }
  },
  swc: {
    minify: false,
    jsc: {
      target: "es2022",
      parser: {
        syntax: "typescript",
      },
      transform: {},
      loose: false,
      externalHelpers: true,
    },
    logger: {
      setName: () => {},
      success: () => {},
      info: () => {},
      error: () => {},
      warn: () => {},
      log: () => {},
    },
  },
  onSuccess: 'echo "✅ packages/client 构建完成"',
});
