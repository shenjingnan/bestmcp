import { BestMCP, Tool } from "bestmcp";

class CalculatorService {
  @Tool("计算两个数字的和")
  add(a: number, b: number): number {
    return a + b;
  }

  @Tool("计算两个数字的差")
  subtract(a: number, b: number): number {
    return a - b;
  }

  @Tool("计算两个数字的积")
  multiply(a: number, b: number): number {
    return a * b;
  }

  @Tool("计算两个数字的商")
  divide(a: number, b: number): number {
    return a / b;
  }
}

const mcp = new BestMCP({
  name: "calculator-mcp",
  version: "1.0.0"
});

mcp.register(CalculatorService);

mcp.run();
