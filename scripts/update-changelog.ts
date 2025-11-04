#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

/**
 * 合并各个包的 CHANGELOG 到文档目录
 * 保持与现有文档格式一致的样式
 */

interface Package {
  name: string;
  path: string;
}

interface VersionEntry {
  version: string;
  content: string;
}

interface VersionData {
  mainPackage: { name: string; content: string } | null;
  dependencies: { name: string; content: string }[];
}

const PACKAGES: Package[] = [
  { name: "bestmcp", path: "packages/bestmcp" },
  { name: "@bestmcp/server", path: "packages/server" },
  { name: "@bestmcp/client", path: "packages/client" },
];

const DOCS_CHANGELOG_PATH = "docs/content/CHANGELOG.md";

function readPackageChangelog(packagePath: string): VersionEntry[] | null {
  const changelogPath = path.join(packagePath, "CHANGELOG.md");
  if (!fs.existsSync(changelogPath)) {
    return null;
  }

  const content = fs.readFileSync(changelogPath, "utf8");

  // 提取版本信息（跳过标题）
  const lines = content.split("\n");
  const versionEntries: VersionEntry[] = [];
  let currentVersion: string | null = null;
  let currentContent: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    // 跳过第一行标题
    const line = lines[i];

    if (line.startsWith("## ")) {
      // 保存上一个版本
      if (currentVersion && currentContent.length > 0) {
        versionEntries.push({
          version: currentVersion,
          content: currentContent.join("\n").trim(),
        });
      }
      // 开始新版本
      currentVersion = line.replace("## ", "");
      currentContent = [];
    } else if (currentVersion) {
      currentContent.push(line);
    }
  }

  // 保存最后一个版本
  if (currentVersion && currentContent.length > 0) {
    versionEntries.push({
      version: currentVersion,
      content: currentContent.join("\n").trim(),
    });
  }

  return versionEntries;
}

function readDocsChangelog(): string {
  if (!fs.existsSync(DOCS_CHANGELOG_PATH)) {
    return "# Changelog\n\n";
  }

  return fs.readFileSync(DOCS_CHANGELOG_PATH, "utf8");
}

function formatVersionEntry(
  _packageName: string,
  version: string,
  content: string,
  isMainPackage: boolean = false,
): string {
  // 对于主包，直接使用版本号；对于依赖包，简化显示
  if (isMainPackage) {
    return `## ${version}\n\n${content}`;
  } else {
    // 对于依赖包，只显示重要的变更
    const importantContent = content
      .split("\n")
      .filter((line) => line.includes("### ") || line.includes("*") || line.includes("-") || line.trim() === "")
      .join("\n");

    return importantContent;
  }
}

function updateDocsChangelog(): void {
  console.log("🔄 开始更新文档 CHANGELOG...");

  // 读取现有的文档 changelog
  const existingContent = readDocsChangelog();

  // 收集所有包的版本信息
  const allVersions = new Map<string, VersionData>();

  for (const pkg of PACKAGES) {
    const versions = readPackageChangelog(pkg.path);
    if (!versions) continue;

    for (const versionEntry of versions) {
      const key = versionEntry.version;
      if (!allVersions.has(key)) {
        allVersions.set(key, {
          mainPackage: null,
          dependencies: [],
        });
      }

      const versionData = allVersions.get(key)!;
      if (pkg.name === "bestmcp") {
        versionData.mainPackage = {
          name: pkg.name,
          content: versionEntry.content,
        };
      } else {
        versionData.dependencies.push({
          name: pkg.name,
          content: versionEntry.content,
        });
      }
    }
  }

  // 生成新的 changelog 内容
  let newContent = "# Changelog\n\n";

  // 按版本号排序（最新的在前）
  const sortedVersions = Array.from(allVersions.keys()).sort((a, b) => {
    // 简单的版本排序，处理 beta 版本
    const aIsBeta = a.includes("beta");
    const bIsBeta = b.includes("beta");

    if (aIsBeta && !bIsBeta) return 1;
    if (!aIsBeta && bIsBeta) return -1;

    return b.localeCompare(a);
  });

  for (const version of sortedVersions) {
    const versionData = allVersions.get(version)!;

    if (versionData.mainPackage) {
      // 主包内容
      newContent += formatVersionEntry(versionData.mainPackage.name, version, versionData.mainPackage.content, true);
      newContent += "\n\n";

      // 依赖包内容（简化版）- 只保留有意义的变更
      const meaningfulDeps = versionData.dependencies.filter((dep) => {
        const content = dep.content.trim();
        // 跳过只包含 "test" 的简单内容
        return content && !content.includes("- test\n") && content.length > 10;
      });

      if (meaningfulDeps.length > 0) {
        const depsContent = meaningfulDeps
          .map((dep) => formatVersionEntry(dep.name, version, dep.content, false))
          .filter((content) => content.trim())
          .join("\n\n");

        if (depsContent.trim()) {
          newContent += depsContent;
          newContent += "\n\n";
        }
      }
    }
  }

  // 添加旧版本内容（如果有的话）
  const existingLines = existingContent.split("\n");
  const existingVersions: VersionEntry[] = [];
  let currentVersion: string | null = null;
  let currentLines: string[] = [];

  for (let i = 0; i < existingLines.length; i++) {
    const line = existingLines[i];

    if (line.startsWith("## ")) {
      if (currentVersion) {
        existingVersions.push({
          version: currentVersion,
          content: currentLines.join("\n"),
        });
      }
      currentVersion = line.replace("## ", "");
      currentLines = [line];
    } else if (currentVersion) {
      currentLines.push(line);
    }
  }

  if (currentVersion) {
    existingVersions.push({
      version: currentVersion,
      content: currentLines.join("\n"),
    });
  }

  // 添加未包含在新生成内容中的旧版本
  const newVersions = new Set(sortedVersions);
  for (const existingVersion of existingVersions) {
    if (!newVersions.has(existingVersion.version)) {
      newContent += existingVersion.content;
      newContent += "\n\n";
    }
  }

  // 写入文件
  fs.writeFileSync(DOCS_CHANGELOG_PATH, `${newContent.trim()}\n`);

  console.log("✅ 文档 CHANGELOG 已更新");
  console.log(`📍 文件路径: ${DOCS_CHANGELOG_PATH}`);
  console.log(`📦 处理了 ${sortedVersions.length} 个版本`);
}

// 执行更新
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    updateDocsChangelog();
  } catch (error) {
    console.error("❌ 更新 CHANGELOG 时出错:", error);
    process.exit(1);
  }
}

export { updateDocsChangelog };
