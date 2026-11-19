#!/usr/bin/env node
"use strict";

// 从 CHANGELOG.md 中抽出版本对应的段落，输出 GitHub Release 正文。
// 约定：# <版本号> 开头的一节，到下一个 # 标题或文件结尾为止。
// 用法：node scripts/release-notes.cjs [版本号]
// 不传版本号时读取 manifest.json 的 version。

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const version = process.argv[2] || require(path.join(root, "manifest.json")).version;
const file = path.join(root, "CHANGELOG.md");

let text;
try {
  text = fs.readFileSync(file, "utf8");
} catch {
  console.error(`未找到 CHANGELOG.md，无法生成 ${version} 的更新说明`);
  process.exit(1);
}

const lines = text.split(/\r?\n/);
const start = lines.findIndex((line) => line.trim() === `# ${version}`);
if (start === -1) {
  console.error(`CHANGELOG.md 中没有 # ${version} 段落，请先补写更新说明再打 tag`);
  process.exit(1);
}

let end = lines.length;
for (let i = start + 1; i < lines.length; i += 1) {
  if (/^#\s/.test(lines[i])) { end = i; break; }
}

const body = lines.slice(start + 1, end).join("\n").trim();
if (!body) {
  console.error(`CHANGELOG.md 中 # ${version} 段落为空`);
  process.exit(1);
}

const repo = process.env.GITHUB_REPOSITORY || "Frank998-dpf/plugin-zh-notes";
const compare = process.env.PREVIOUS_TAG
  ? `\n\n**完整对比**：https://github.com/${repo}/compare/${process.env.PREVIOUS_TAG}...${version}`
  : "";

process.stdout.write(`${body}${compare}\n`);
