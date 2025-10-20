import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts"],
    environment: "node",
    alias: {
      "@bestmcp/core": "/Users/nemo/github/shenjingnan/bestmcp/packages/core/src",
    },
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath + snapExtension;
    },
  },
  resolve: {
    alias: {
      "@bestmcp/core": "/Users/nemo/github/shenjingnan/bestmcp/packages/core/src",
    },
  },
});
