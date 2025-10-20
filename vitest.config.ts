import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts"],
    environment: "node",
    alias: {
      "@core": path.resolve(__dirname, "packages/core/src"),
      "@bestmcp/core": path.resolve(__dirname, "packages/core/src"),
    },
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath + snapExtension;
    },
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "packages/core/src"),
      "@bestmcp/core": path.resolve(__dirname, "packages/core/src"),
    },
  },
});
