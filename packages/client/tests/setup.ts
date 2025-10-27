import { vi } from "vitest";

// Mock Node.js globals
global.console = {
  ...console,
  // 在测试中静默某些日志
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
