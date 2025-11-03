#!/bin/bash

# 测试完整的发布流程
echo "🧪 测试完整的发布流程..."

TARGET_VERSION="${1:-0.1.1-beta.1}"
DRY_RUN="${2:-true}"

echo "📦 目标版本: $TARGET_VERSION"
echo "🔍 预演模式: $DRY_RUN"

# 验证版本号格式
if [[ ! "$TARGET_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-(beta|rc)\.[0-9]+)?$ ]]; then
  echo "❌ 版本号格式无效: $TARGET_VERSION"
  exit 1
fi

# 构建所有包
echo "🔨 构建所有包..."
pnpm build:packages
if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi

# 确定发布标签
if [[ "$TARGET_VERSION" =~ -(beta|rc)\.[0-9]+$ ]]; then
  PUBLISH_TAG="beta"
  echo "📋 检测到预发布版本，使用标签: $PUBLISH_TAG"
else
  PUBLISH_TAG="latest"
  echo "📋 检测到正式版本，使用标签: $PUBLISH_TAG"
fi

# 验证将要发布的包
echo "🔍 验证将要发布的包..."
for pkg in packages/*/; do
  if [[ -d "$pkg" && -f "$pkg/package.json" ]]; then
    pkg_name=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg/package.json', 'utf8')).name)")
    pkg_version=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg/package.json', 'utf8')).version)")

    echo "  📦 $pkg_name@$pkg_version"

    # 验证版本是否匹配
    if [[ "$pkg_version" != "$TARGET_VERSION" ]]; then
      echo "❌ 版本不匹配: $pkg_name@$pkg_version (期望: $TARGET_VERSION)"
      exit 1
    fi

    # 验证构建产物是否存在
    if [[ ! -f "$pkg/dist/index.js" ]]; then
      echo "❌ 构建产物不存在: $pkg/dist/index.js"
      exit 1
    fi

    echo "  ✅ $pkg_name 验证通过"
  fi
done

echo ""
echo "📋 发布流程摘要:"
echo "  - 目标版本: $TARGET_VERSION"
echo "  - 发布标签: $PUBLISH_TAG"
echo "  - 预演模式: $DRY_RUN"
echo "  - 包数量: 3 (bestmcp, @bestmcp/client, @bestmcp/server)"

if [[ "$DRY_RUN" == "true" ]]; then
  echo ""
  echo "🔍 预演模式：检查将要发布的包..."
  # 这里可以添加 dry-run 发布命令的模拟
  echo "  📦 bestmcp@$TARGET_VERSION (tag: $PUBLISH_TAG)"
  echo "  📦 @bestmcp/client@$TARGET_VERSION (tag: $PUBLISH_TAG)"
  echo "  📦 @bestmcp/server@$TARGET_VERSION (tag: $PUBLISH_TAG)"
else
  echo ""
  echo "⚠️  实际发布模式被跳过（测试环境）"
fi

echo ""
echo "✅ 发布流程测试完成"