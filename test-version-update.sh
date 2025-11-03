#!/bin/bash

# 测试版本更新脚本
echo "🧪 测试版本更新脚本..."

# 模拟 GitHub Actions 工作流中的版本更新逻辑
TARGET_VERSION="${1:-0.1.1-beta.1}"

if [[ ! "$TARGET_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-(beta|rc)\.[0-9]+)?$ ]]; then
  echo "❌ 版本号格式无效: $TARGET_VERSION"
  exit 1
fi

echo "📦 手动更新版本号为: $TARGET_VERSION"

# 更新所有包的版本号
echo "🔄 更新 packages/bestmcp/package.json"
npm version "$TARGET_VERSION" --no-git-tag-version --prefix packages/bestmcp

echo "🔄 更新 packages/client/package.json"
npm version "$TARGET_VERSION" --no-git-tag-version --prefix packages/client

echo "🔄 更新 packages/server/package.json"
npm version "$TARGET_VERSION" --no-git-tag-version --prefix packages/server

echo "✅ 所有包版本已更新为: $TARGET_VERSION"

# 显示更新后的版本
echo ""
echo "📋 更新后的版本信息："
for pkg in packages/*/; do
  if [[ -d "$pkg" && -f "$pkg/package.json" ]]; then
    pkg_name=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg/package.json', 'utf8')).name)")
    pkg_version=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg/package.json', 'utf8')).version)")
    echo "  - $pkg_name: $pkg_version"
  fi
done

echo ""
echo "✅ 版本更新测试完成"