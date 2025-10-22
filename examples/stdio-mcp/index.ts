import { BestMCP, Param, Tool } from "bestmcp";
import { z } from "zod";

class CalculatorService {
  @Tool("计算两个数字的和")
  add(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number
  ): number {
    return a + b;
  }

  @Tool("计算两个数字的差")
  subtract(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number
  ): number {
    return a - b;
  }

  @Tool("计算两个数字的积")
  multiply(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number
  ): number {
    return a * b;
  }

  @Tool("计算两个数字的商")
  divide(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number
  ): number {
    return a / b;
  }
}

const mcp = new BestMCP({
  name: "calculator-stdio-mcp",
  version: "1.0.0",
});

mcp.register(CalculatorService);

mcp.run();
