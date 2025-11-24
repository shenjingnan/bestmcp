# Development Workflow Skill

BestMCP 项目的标准开发工作流程，确保代码质量和开发效率。

## 新功能开发流程

### 1. 功能规划和设计
- 明确功能需求和范围
- 设计 API 接口和数据结构
- 确定测试策略

### 2. 实现代码
- 遵循项目代码规范
- 添加必要的类型定义
- 实现核心逻辑

### 3. 质量检查
```bash
# 按顺序执行
nr check:fix      # 代码格式化
nr type:check     # 类型检查
nr test:silent    # 运行测试
nr spell:check    # 拼写检查
```

### 4. 测试验证
- 单元测试覆盖
- 集成测试验证
- 手动功能测试

## Bug 修复流程

### 1. 问题定位
- 运行 `nr type:check` 检查类型错误
- 运行 `nr test:silent` 检查测试失败
- 分析错误日志和堆栈跟踪

### 2. 修复实施
- 修复核心问题
- 添加或更新测试用例
- 确保修复不影响其他功能

### 3. 验证检查
- 所有测试通过
- 类型检查通过
- 代码符合规范

## 构建和测试命令

### 开发模式
```bash
# 启动开发模式（推荐）
pnpm dev                # 所有 packages/* 开发模式
pnpm dev:packages       # 仅 packages 开发模式
pnpm dev:examples       # 仅 examples 开发模式
pnpm dev:all            # 全量开发模式
```

### 构建
```bash
# 快速构建（推荐）
pnpm build              # 所有 packages/*
pnpm build:packages     # 仅 packages
pnpm build:examples     # 仅 examples
pnpm build:all          # 全量构建
```

### 测试
```bash
# 测试执行
pnpm test              # 运行所有测试
pnpm test:silent       # 静默模式
pnpm test:coverage     # 生成覆盖率报告
pnpm test:watch        # 监听模式
```

### 代码质量
```bash
# 质量检查（必须按顺序执行）
nr check:fix           # 格式化和修复
nr type:check          # 类型检查
nr test:silent         # 测试
nr spell:check         # 拼写检查
```

## 项目结构规范

### 文件组织
- `packages/server/` - MCP 服务器核心
- `packages/client/` - MCP 客户端库
- `packages/bestmcp/` - 统一发布包
- `examples/` - 示例项目
- `config/` - 共享配置文件

### 命名约定
- **类名**: PascalCase (如 `BestMCP`, `TransportManager`)
- **方法名**: camelCase (如 `registerTransport`, `createTransport`)
- **文件名**: kebab-case (如 `transport-manager.ts`, `http-transport.ts`)
- **常量**: UPPER_SNAKE_CASE (如 `TransportType`, `TOOL_METADATA`)

### Import 规范
```typescript
// ✅ 正确：类型导入和值导入分离
import type { Server, Transport } from "@server/internal/mcp-sdk";
import type { BaseTransport, HTTPTransportConfig } from "@server/transports";
import { HTTPTransport, TransportType } from "@server/transports";
import { z } from "zod";

// ❌ 错误：混合导入
import { Server, type Transport, BaseTransport } from "@server/internal/mcp-sdk";
```

## 常见任务指南

### 添加新工具
1. 在服务类中使用 `@Tool` 装饰器
2. 使用 `@Param` 定义参数验证
3. 编写测试用例
4. 运行质量检查

### 添加新传输层
1. 继承 `BaseTransport` 类
2. 实现必要的抽象方法
3. 在 `TransportManager` 中注册
4. 添加测试用例

### 修改 API
1. 更新类型定义
2. 修改实现代码
3. 更新相关测试
4. 更新文档

## 故障排查

### 类型检查失败
1. 检查错误信息和行号
2. 验证导入路径和类型定义
3. 确认方法名称和参数
4. 运行 `nr check:fix` 自动修复

### 测试失败
1. 检查测试输出和错误信息
2. 分析失败的测试用例
3. 确认是代码问题还是测试问题
4. 修复相关代码或更新测试

### 构建失败
1. 检查依赖是否正确安装
2. 验证配置文件
3. 清理构建缓存：`pnpm clean`
4. 重新构建

## 最佳实践

### 代码提交前检查
- 所有质量检查通过
- 功能测试验证
- 代码审查完成
- 文档更新

### 性能优化
- 使用并行构建命令
- 避免不必要的依赖
- 优化导入和导出

### 安全考虑
- 验证用户输入
- 避免代码注入
- 使用 HTTPS 传输
- 定期更新依赖