import { BestMCP, Param, Tool } from "bestmcp";
import { z } from "zod";

class CalculatorService {
  @Tool("计算两个数字的和")
  add(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number,
  ): number {
    return a + b;
  }

  @Tool("计算两个数字的差")
  subtract(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number,
  ): number {
    return a - b;
  }

  @Tool("计算两个数字的积")
  multiply(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number,
  ): number {
    return a * b;
  }

  @Tool("计算两个数字的商")
  divide(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number,
  ): number {
    return a / b;
  }

  @Tool("测试 optional number 是否正确")
  public async testOptionalNumberParam(
    @Param(z.string().describe("测试参数1字符串类型"))
    param1: string,
    @Param(z.number().optional().describe("测试参数2数字类型"), "测试参数2数字类型")
    param2?: number,
  ) {
    console.log({
      param1,
      param2,
    });
  }
}

const mcp = new BestMCP({
  name: "calculator-stdio-mcp",
  version: "1.0.0",
});

mcp.register(CalculatorService);

mcp.run();
