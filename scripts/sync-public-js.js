#!/usr/bin/env node
/**
 * 把 js/layout.js（与未来的其它"运营端通用脚本"）同步到 public/js/。
 *
 * 背景：本仓库为 Vite 多页静态站点，运行入口（HTML）使用 `<script src="../js/layout.js">` 直接引用，
 * 而 Vite 构建时只会把 publicDir（public/）原样复制到 dist/。开发期与构建期分别从两条路径加载，
 * 因此必须保持两份一致。本脚本以 js/ 为唯一权威源，单向同步到 public/js/，根除手动同步漂移。
 *
 * 触发时机：
 *   - npm run sync:public   手动触发
 *   - vite.config.js 的 viteSyncPublicJsPlugin 在 dev 启动与 build 开始时自动调用
 */
const { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } = require('fs');
const { resolve, dirname } = require('path');

const ROOT = resolve(__dirname, '..');

/** 需要同步到 public/ 的"运营端通用脚本"清单。新增条目时统一在此声明。 */
const SYNC_PAIRS = [{ from: 'js/layout.js', to: 'public/js/layout.js' }];

function syncOnce(verbose = false) {
  let copied = 0;
  let skipped = 0;
  for (const pair of SYNC_PAIRS) {
    const srcAbs = resolve(ROOT, pair.from);
    const dstAbs = resolve(ROOT, pair.to);
    if (!existsSync(srcAbs)) {
      if (verbose) console.warn(`[sync-public-js] 跳过：源不存在 ${pair.from}`);
      skipped += 1;
      continue;
    }
    const srcBuf = readFileSync(srcAbs);
    if (existsSync(dstAbs)) {
      const dstBuf = readFileSync(dstAbs);
      if (srcBuf.equals(dstBuf)) {
        skipped += 1;
        continue;
      }
    }
    mkdirSync(dirname(dstAbs), { recursive: true });
    writeFileSync(dstAbs, srcBuf);
    copied += 1;
    if (verbose) console.log(`[sync-public-js] ${pair.from} -> ${pair.to}`);
  }
  return { copied, skipped };
}

if (require.main === module) {
  const { copied, skipped } = syncOnce(true);
  console.log(`[sync-public-js] 同步完成：copied=${copied} skipped=${skipped}`);
}

module.exports = { syncOnce, SYNC_PAIRS };
