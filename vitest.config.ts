import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts"],
    environment: "node",
    alias: {
      "@server": path.resolve(__dirname, "packages/server/src"),
      "@bestmcp/server": path.resolve(__dirname, "packages/server/src"),
      bestmcp: path.resolve(__dirname, "src"),
    },
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath + snapExtension;
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "**/*.config.ts", "coverage/"],
    },
  },
  resolve: {
    alias: {
      "@server": path.resolve(__dirname, "packages/server/src"),
      "@bestmcp/server": path.resolve(__dirname, "packages/server/src"),
      bestmcp: path.resolve(__dirname, "src"),
    },
  },
});
