import { describe, expect, it } from "vitest";
import "reflect-metadata";
import {
  extractParameters,
  getParamNames,
  inferTypeSchema,
  isZodSchemaOptional,
  zodSchemaToJsonSchema,
} from "@server/validation";
import { z } from "zod";

/**
 * 创建用于测试的 mock Zod schema 对象
 * 使用双重断言确保类型安全，避免 mock 对象需要完整实现 ZodType 接口
 */
function createMockZodType<T extends string>(
  typeName: T,
  additionalProps?: Record<string, unknown>,
): z.ZodType<unknown> {
  return {
    _def: { typeName },
    ...additionalProps,
  } as unknown as z.ZodType<unknown>;
}

describe("获取参数名称", () => {
  it("应该从简单函数中提取参数名称", () => {
    function testFunc(a: string, b: number) {
      return a + b;
    }

    const paramNames = getParamNames(testFunc);
    expect(paramNames).toEqual(["a", "b"]);
  });

  it("应该处理没有参数的函数", () => {
    function testFunc() {
      return "test";
    }

    const paramNames = getParamNames(testFunc);
    expect(paramNames).toEqual([]);
  });

  it("应该处理带有默认参数的函数", () => {
    function testFunc(a: string, b: number = 10) {
      return a + b;
    }

    const paramNames = getParamNames(testFunc);
    expect(paramNames).toEqual(["a", "b"]);
  });

  it("应该处理箭头函数", () => {
    const arrowFunc = (a: string, b: number) => a + b;
    const paramNames = getParamNames(arrowFunc);
    expect(paramNames).toEqual(["a", "b"]);
  });

  it("应该处理带有默认参数的箭头函数", () => {
    const arrowFunc = (a: string, b: number = 10) => a + b;
    const paramNames = getParamNames(arrowFunc);
    expect(paramNames).toEqual(["a", "b"]);
  });

  it("应该为无效的函数字符串返回空数组", () => {
    const invalidFunc = new Function("return function() { }")();
    const paramNames = getParamNames(invalidFunc);
    expect(paramNames).toEqual([]);
  });
});

describe("isZodSchemaOptional", () => {
  it("应该为 ZodOptional 模式返回 true", () => {
    const optionalSchema = z.string().optional();
    expect(isZodSchemaOptional(optionalSchema)).toBe(true);
  });

  it("应该为必需模式返回 false", () => {
    const requiredSchema = z.string();
    expect(isZodSchemaOptional(requiredSchema)).toBe(false);
  });

  it("应该为可空模式返回 false", () => {
    const nullableSchema = z.string().nullable();
    expect(isZodSchemaOptional(nullableSchema)).toBe(false);
  });

  it("应该为复杂模式返回 false", () => {
    const complexSchema = z.object({
      name: z.string(),
      age: z.number(),
    });
    expect(isZodSchemaOptional(complexSchema)).toBe(false);
  });

  it("应该优雅地处理错误", () => {
    const schema = z.string();
    // Mock the schema to throw an error
    const mockSchema = {
      ...schema,
      isOptional: () => {
        throw new Error("Test error");
      },
    };
    expect(isZodSchemaOptional(mockSchema as unknown as z.ZodTypeAny)).toBe(false);
  });
});

describe("zodSchemaToJsonSchema", () => {
  describe("基本类型", () => {
    it("应该将 ZodString 转换为 JSON Schema", () => {
      const schema = z.string();
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({ type: "string" });
    });

    it("应该将 ZodNumber 转换为 JSON Schema", () => {
      const schema = z.number();
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({ type: "number" });
    });

    it("应该将 ZodBoolean 转换为 JSON Schema", () => {
      const schema = z.boolean();
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({ type: "boolean" });
    });
  });

  describe("字符串约束", () => {
    it("应该处理 minLength 约束", () => {
      const schema = z.string().min(5);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
        minLength: 5,
      });
    });

    it("应该处理 maxLength 约束", () => {
      const schema = z.string().max(10);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
        maxLength: 10,
      });
    });

    it("应该处理正则表达式约束", () => {
      const schema = z.string().regex(/^[a-zA-Z]+$/);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
        pattern: "^[a-zA-Z]+$",
      });
    });

    it("应该处理多个字符串约束", () => {
      const schema = z
        .string()
        .min(3)
        .max(10)
        .regex(/^[a-z]+$/);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
        minLength: 3,
        maxLength: 10,
        pattern: "^[a-z]+$",
      });
    });
  });

  describe("数字约束", () => {
    it("应该处理最小值约束", () => {
      const schema = z.number().min(0);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "number",
        minimum: 0,
      });
    });

    it("应该处理最大值约束", () => {
      const schema = z.number().max(100);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "number",
        maximum: 100,
      });
    });

    it("应该处理多个数字约束", () => {
      const schema = z.number().min(0).max(100);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "number",
        minimum: 0,
        maximum: 100,
      });
    });
  });

  describe("数组类型", () => {
    it("应该将 ZodArray 转换为 JSON Schema", () => {
      const schema = z.array(z.string());
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "array",
        items: { type: "string" },
      });
    });

    it("应该处理复杂类型的数组", () => {
      const schema = z.array(
        z.object({
          name: z.string(),
          age: z.number(),
        }),
      );
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name", "age"],
        },
      });
    });
  });

  describe("对象类型", () => {
    it("应该将 ZodObject 转换为 JSON Schema", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name", "age"],
      });
    });

    it("应该处理可选字段", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional(),
      });
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" }, // 可选数字应该保持数字类型
        },
        required: ["name"],
      });
    });

    it("应该从 Zod 字段中提取描述", () => {
      const schema = z.object({
        name: z.string().describe("User's full name"),
        age: z.number().describe("User's age in years"),
      });
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "object",
        properties: {
          name: { type: "string", description: "User's full name" },
          age: { type: "number", description: "User's age in years" },
        },
        required: ["name", "age"],
      });
    });
  });

  describe("可选类型处理", () => {
    it("应该正确处理可选字符串类型", () => {
      const schema = z.string().optional();
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
      });
    });

    it("应该正确处理可选布尔类型", () => {
      const schema = z.boolean().optional();
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "boolean",
      });
    });

    it("应该正确处理可选数组类型", () => {
      const schema = z.array(z.string()).optional();
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "array",
        items: { type: "string" },
      });
    });

    it("应该正确处理复杂可选类型", () => {
      const schema = z.object({
        id: z.number().optional(),
        name: z.string().optional(),
        active: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      });
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          active: { type: "boolean" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: [],
      });
    });
  });

  describe("多实例兼容性", () => {
    it("应该正确处理来自不同 Zod 实例的类型", () => {
      // 模拟不同 Zod 实例的场景（通过手动创建具有 _def 结构的对象）
      const mockStringSchema = createMockZodType("ZodString");

      const mockNumberSchema = createMockZodType("ZodNumber");

      const mockBooleanSchema = createMockZodType("ZodBoolean");

      const mockOptionalStringSchema = createMockZodType("ZodOptional", {
        innerType: { _def: { typeName: "ZodString" } },
        isOptional: () => true,
      });

      // 测试字符串类型
      const stringResult = zodSchemaToJsonSchema(mockStringSchema);
      expect(stringResult).toEqual({ type: "string" });

      // 测试数字类型
      const numberResult = zodSchemaToJsonSchema(mockNumberSchema);
      expect(numberResult).toEqual({ type: "number" });

      // 测试布尔类型
      const booleanResult = zodSchemaToJsonSchema(mockBooleanSchema);
      expect(booleanResult).toEqual({ type: "boolean" });

      // 测试可选字符串类型
      const optionalStringResult = zodSchemaToJsonSchema(mockOptionalStringSchema);
      expect(optionalStringResult).toEqual({ type: "string" });
    });

    it("应该正确处理 _def 属性缺失的情况", () => {
      // 测试没有 _def 属性的异常情况
      const mockSchemaWithoutDef = {} as z.ZodType<unknown>;

      const result = zodSchemaToJsonSchema(mockSchemaWithoutDef);
      expect(result).toEqual({ type: "string" }); // 默认回退类型
    });

    it("应该正确处理未知 typeName 的情况", () => {
      // 测试未知的 typeName
      const mockUnknownSchema = createMockZodType("ZodUnknownType");

      const result = zodSchemaToJsonSchema(mockUnknownSchema);
      expect(result).toEqual({ type: "string" }); // 默认回退类型
    });

    it("应该正确识别不同实例的可选类型", () => {
      // 模拟不同实例的可选类型
      const mockOptionalSchema1 = createMockZodType("ZodOptional");
      // 没有 isOptional 方法，应该根据 _def.typeName 判断

      const mockOptionalSchema2 = createMockZodType("ZodString");
      // 没有 isOptional 方法，也不是 ZodOptional

      const mockOptionalSchema3 = createMockZodType("ZodString", {
        isOptional: () => true, // 有 isOptional 方法且返回 true
      });

      const mockOptionalSchema4 = createMockZodType("ZodString", {
        isOptional: () => false, // 有 isOptional 方法但返回 false
      });

      // ZodOptional 类型应该被识别为可选
      expect(isZodSchemaOptional(mockOptionalSchema1)).toBe(true);

      // 不是 ZodOptional 类型且没有 isOptional 方法，应该返回 false
      expect(isZodSchemaOptional(mockOptionalSchema2)).toBe(false);

      // 有 isOptional 方法且返回 true，应该返回 true
      expect(isZodSchemaOptional(mockOptionalSchema3)).toBe(true);

      // 有 isOptional 方法但返回 false，应该返回 false
      expect(isZodSchemaOptional(mockOptionalSchema4)).toBe(false);
    });
  });

  describe("枚举类型", () => {
    it("应该将 ZodEnum 转换为 JSON Schema", () => {
      const schema = z.enum(["red", "green", "blue"]);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
        enum: ["red", "green", "blue"],
      });
    });

    it("应该优雅地处理单值枚举", () => {
      const schema = z.enum(["red"]);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
        enum: ["red"],
      });
    });
  });

  describe("联合类型", () => {
    it("应该通过使用第一个选项来处理 ZodUnion", () => {
      const schema = z.union([z.string(), z.number()]);
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
      });
    });
  });

  describe("可选类型", () => {
    it("应该展开 ZodOptional", () => {
      const schema = z.string().optional();
      const jsonSchema = zodSchemaToJsonSchema(schema);
      expect(jsonSchema).toEqual({
        type: "string",
      });
    });
  });

  describe("回退处理", () => {
    it("应该为未知模式返回字符串类型", () => {
      const unknownSchema = {} as unknown as z.ZodTypeAny;
      const jsonSchema = zodSchemaToJsonSchema(unknownSchema);
      expect(jsonSchema).toEqual({
        type: "string",
      });
    });
  });
});

describe("推断类型模式", () => {
  it("应该推断字符串类型", () => {
    expect(inferTypeSchema(String)).toEqual({ type: "string" });
    expect(inferTypeSchema("string")).toEqual({ type: "string" });
  });

  it("应该推断数字类型", () => {
    expect(inferTypeSchema(Number)).toEqual({ type: "number" });
  });

  it("应该推断布尔类型", () => {
    expect(inferTypeSchema(Boolean)).toEqual({ type: "boolean" });
  });

  it("应该推断对象类型", () => {
    expect(inferTypeSchema(Object)).toEqual({ type: "object" });
  });

  it("应该推断数组类型", () => {
    expect(inferTypeSchema(Array)).toEqual({
      type: "array",
      items: { type: "string" },
    });
  });

  it("应该处理 null/undefined 输入", () => {
    expect(inferTypeSchema(null)).toEqual({ type: "string" });
    expect(inferTypeSchema(undefined)).toEqual({ type: "string" });
  });

  it("应该处理函数构造器", () => {
    function CustomType() {}
    expect(inferTypeSchema(CustomType)).toEqual({ type: "string" });
  });

  it("应该返回字符串类型作为回退", () => {
    expect(inferTypeSchema({})).toEqual({ type: "string" });
    expect(inferTypeSchema(new Date())).toEqual({ type: "string" });
  });
});

describe("提取参数", () => {
  it("应该为缺失的输入返回空结果", () => {
    const result = extractParameters();
    expect(result).toEqual({
      properties: {},
      required: [],
    });
  });

  it("应该为部分输入返回空结果", () => {
    const result = extractParameters({}, "testMethod");
    expect(result).toEqual({
      properties: {},
      required: [],
    });
  });

  it("应该优雅地处理空元数据", () => {
    // Mock empty metadata - in a real scenario this would be handled by reflect-metadata
    const result = extractParameters({}, "testMethod", [String, Number]);
    expect(result).toEqual({
      properties: {},
      required: [],
    });
  });
});
