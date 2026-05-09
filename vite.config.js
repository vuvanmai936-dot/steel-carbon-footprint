const { resolve } = require('path');
const { readdirSync } = require('fs');
const { defineConfig } = require('vite');
const { syncOnce } = require('./scripts/sync-public-js');

// 收集所有 HTML 作为多页面入口（根目录 + operator / supplier / certifier + prototype/flows 黄金动线）
function collectHtmlInputs() {
  const root = resolve(__dirname);
  const input = {};
  const dirs = ['', 'operator', 'supplier', 'certifier', 'prototype/flows'];
  for (const dir of dirs) {
    const fullDir = resolve(root, dir);
    let entries;
    try {
      entries = readdirSync(fullDir);
    } catch (_) {
      continue;
    }
    for (const name of entries) {
      if (!name.endsWith('.html')) continue;
      const key = dir ? `${dir}/${name.slice(0, -5)}` : name.slice(0, -5);
      input[key] = resolve(fullDir, name);
    }
  }
  return input;
}

/**
 * 自动把 js/layout.js 等同步到 public/js/，根除"双份手动维护"。
 * 单向同步：以 js/ 为权威源；详见 scripts/sync-public-js.js。
 */
function viteSyncPublicJsPlugin() {
  return {
    name: 'vite-sync-public-js',
    configResolved() {
      syncOnce(false);
    },
    buildStart() {
      syncOnce(false);
    },
  };
}

module.exports = defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  plugins: [viteSyncPublicJsPlugin()],
  build: {
    rollupOptions: {
      input: collectHtmlInputs(),
    },
  },
});
