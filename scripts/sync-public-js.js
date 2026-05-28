#!/usr/bin/env node
/**
 * 把 js/ 下页面脚本同步到 public/js/，供 Vite build 时原样进入 dist/js/。
 *
 * 背景：HTML 使用 `<script src="../js/...">`；Vite 仅拷贝 publicDir。
 * 开发期 Vite 直接服务仓库根目录的 js/；构建期依赖 public/js/ 与 public/js/pages/。
 *
 * 触发：npm run sync:public | predev | prebuild（viteSyncPublicJsPlugin）
 */
const {
  copyFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} = require('fs');
const { resolve, dirname, relative, join } = require('path');

const ROOT = resolve(__dirname, '..');

/** 单文件同步（保留 layout 等显式条目，便于文档引用） */
const SYNC_FILES = [{ from: 'js/layout.js', to: 'public/js/layout.js' }];

function syncDir(relFrom, relTo, verbose) {
  const srcDir = resolve(ROOT, relFrom);
  if (!existsSync(srcDir)) return { copied: 0, skipped: 0 };
  let copied = 0;
  let skipped = 0;

  function walk(current, destBase) {
    for (const name of readdirSync(current)) {
      const srcPath = join(current, name);
      const st = statSync(srcPath);
      if (st.isDirectory()) {
        walk(srcPath, join(destBase, name));
        continue;
      }
      if (!name.endsWith('.js')) continue;
      const rel = relative(srcDir, srcPath);
      const dstPath = resolve(ROOT, relTo, rel);
      mkdirSync(dirname(dstPath), { recursive: true });
      const srcBuf = readFileSync(srcPath);
      if (existsSync(dstPath) && readFileSync(dstPath).equals(srcBuf)) {
        skipped += 1;
        continue;
      }
      writeFileSync(dstPath, srcBuf);
      copied += 1;
      if (verbose) console.log(`[sync-public-js] ${join(relFrom, rel)} -> ${join(relTo, rel)}`);
    }
  }

  walk(srcDir, resolve(ROOT, relTo));
  return { copied, skipped };
}

function syncFile(pair, verbose) {
  const srcAbs = resolve(ROOT, pair.from);
  const dstAbs = resolve(ROOT, pair.to);
  if (!existsSync(srcAbs)) {
    if (verbose) console.warn(`[sync-public-js] 跳过：源不存在 ${pair.from}`);
    return { copied: 0, skipped: 1 };
  }
  const srcBuf = readFileSync(srcAbs);
  if (existsSync(dstAbs) && readFileSync(dstAbs).equals(srcBuf)) {
    return { copied: 0, skipped: 1 };
  }
  mkdirSync(dirname(dstAbs), { recursive: true });
  writeFileSync(dstAbs, srcBuf);
  if (verbose) console.log(`[sync-public-js] ${pair.from} -> ${pair.to}`);
  return { copied: 1, skipped: 0 };
}

function syncOnce(verbose = false) {
  let copied = 0;
  let skipped = 0;
  for (const pair of SYNC_FILES) {
    const r = syncFile(pair, verbose);
    copied += r.copied;
    skipped += r.skipped;
  }
  const rJs = syncDir('js', 'public/js', verbose);
  copied += rJs.copied;
  skipped += rJs.skipped;
  return { copied, skipped };
}

if (require.main === module) {
  const { copied, skipped } = syncOnce(true);
  console.log(`[sync-public-js] 同步完成：copied=${copied} skipped=${skipped}`);
}

module.exports = { syncOnce, SYNC_FILES };
