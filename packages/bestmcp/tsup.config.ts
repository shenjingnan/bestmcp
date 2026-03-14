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
  external: ["@modelcontextprotocol/sdk", "reflect-metadata", "zod", "@bestmcp/server", "@bestmcp/client"],
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
        decorators: true,
      },
      transform: {
        decoratorMetadata: true,
        legacyDecorator: true,
      },
      loose: false,
      externalHelpers: false,
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
  onSuccess: 'echo "✅ bestmcp 包构建完成"',
});
