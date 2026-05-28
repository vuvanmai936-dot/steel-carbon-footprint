#!/usr/bin/env node
/**
 * 将 node_modules 中的 Vue / Element Plus 复制到 public/vendor/，供离线/内网构建使用。
 * 运行：npm install 后执行 npm run sync:vendor
 */
const { copyFileSync, mkdirSync, existsSync } = require('fs');
const { resolve } = require('path');

const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'public/vendor');

const PAIRS = [
  ['node_modules/vue/dist/vue.global.prod.js', 'vue.global.prod.js'],
  ['node_modules/element-plus/dist/index.css', 'element-plus.css'],
  ['node_modules/element-plus/dist/index.full.min.js', 'element-plus.full.min.js'],
  ['node_modules/@element-plus/icons-vue/dist/index.iife.min.js', 'element-plus-icons.iife.min.js'],
  ['node_modules/element-plus/dist/locale/zh-cn.js', 'element-plus-locale-zh-cn.js'],
];

function main() {
  mkdirSync(OUT, { recursive: true });
  let copied = 0;
  for (const [fromRel, toName] of PAIRS) {
    const src = resolve(ROOT, fromRel);
    const dst = resolve(OUT, toName);
    if (!existsSync(src)) {
      console.error('[sync-vendor] 缺少源文件，请先 npm install:', fromRel);
      process.exit(1);
    }
    copyFileSync(src, dst);
    copied += 1;
    console.log('[sync-vendor]', toName);
  }
  console.log('[sync-vendor] 完成，共', copied, '个文件 -> public/vendor/');
}

main();
