# TypeScript Error Fix Skill

专门用于修复 TypeScript 类型错误的技能。适用于处理编译错误和类型检查问题。

## 常见错误类型及修复策略

### 1. 方法未定义错误 (TS2339)
```
Property 'xxx' does not exist on type 'YYY'
```

**修复步骤**:
1. 检查方法是否在类中正确声明
2. 确认方法名称拼写正确
3. 验证访问修饰符（public/private/protected）
4. 如果是私有方法调用，确保在正确的作用域内

**示例修复**:
```typescript
class BestMCP {
  constructor(config: BestMCPConfig) {
    this.initializeMCPServer(config); // 错误：方法未定义
  }

  // 修复：添加缺失的私有方法
  private initializeMCPServer(config: BestMCPConfig): void {
    this.server = new Server(
      { name: this.name, version: this.version },
      { capabilities: config.capabilities || { tools: {} } }
    );
  }
}
```

### 2. 导入路径错误 (TS2307)
```
Cannot find module 'xxx' or its corresponding type declarations
```

**修复步骤**:
1. 检查导入路径是否正确
2. 确认目标模块是否已导出
3. 运行 `pnpm install` 更新依赖
4. 检查文件扩展名（如果需要）

### 3. 类型不兼容错误 (TS2322)
```
Type 'X' is not assignable to type 'Y'
```

**修复步骤**:
1. 检查类型定义是否匹配
2. 使用类型断言或类型守卫
3. 确认可选属性的处理方式

**示例修复**:
```typescript
// 错误：Type 'undefined' is not assignable to type 'string'
const options = {
  instructions: config.instructions, // 可能是 undefined
};

// 修复：条件性添加属性
const options: any = {
  capabilities: config.capabilities || { tools: {} },
};
if (config.instructions) {
  options.instructions = config.instructions;
}
```

### 4. 精确可选属性类型错误 (TS2379)
```
Type 'X' is not assignable to parameter of type 'Y' with 'exactOptionalPropertyTypes: true'
```

**修复步骤**:
1. 检查可选属性的处理
2. 使用条件性赋值避免 undefined 值
3. 或者使用类型断言绕过严格检查

## 修复流程

1. **运行类型检查**: `nr type:check`
2. **定位错误**: 根据错误信息和行号定位问题
3. **分析原因**: 确定是定义问题、导入问题还是使用问题
4. **选择修复策略**: 根据错误类型选择合适的修复方法
5. **实施修复**: 修改代码
6. **验证修复**: 重新运行类型检查确保问题解决

## 特殊处理

### 项目特定模式
- **Import 规范**: 类型导入使用 `import type`，值导入使用普通 `import`
- **装饰器支持**: 确保 `experimentalDecorators` 和 `emitDecoratorMetadata` 启用
- **严格模式**: 项目启用 `strict: true` 和 `verbatimModuleSyntax: true`

### 工厂函数模式
对于需要配置的对象创建，使用工厂函数模式：
```typescript
private registerBuiltinTransports(): void {
  this.registerTransport(TransportType.STDIO, () => new StdioTransport());
  this.registerTransport(TransportType.HTTP, () => new HTTPTransport({
    type: TransportType.HTTP,
    options: { /* 默认配置 */ }
  }));
}
```

## 验证清单
- [ ] 所有 TypeScript 错误已修复
- [ ] 导入语句符合项目规范
- [ ] 类型定义正确无误
- [ ] `nr type:check` 通过
- [ ] 相关测试仍然通过