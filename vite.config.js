const { resolve } = require('path');
const { readdirSync, readFileSync } = require('fs');
const { defineConfig } = require('vite');
const { syncOnce } = require('./scripts/sync-public-js');

const VENDOR_FULL_SNIPPET = readFileSync(
  resolve(__dirname, 'snippets/pcf-vendor-full.html'),
  'utf8'
).trim();
const VENDOR_BASIC_SNIPPET = readFileSync(
  resolve(__dirname, 'snippets/pcf-vendor-basic.html'),
  'utf8'
).trim();

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

/** 开发/构建时确保 HTML 含 PCF_VENDOR_HEAD 标记块（与 scripts/patch-html.js 一致） */
function viteVendorHeadPlugin() {
  return {
    name: 'vite-vendor-head',
    transformIndexHtml(html) {
      if (html.includes('PCF_VENDOR_HEAD')) return html;
      if (!html.includes('unpkg.com/vue@3')) return html;
      const snippet = html.includes('@element-plus/icons-vue')
        ? VENDOR_FULL_SNIPPET
        : VENDOR_BASIC_SNIPPET;
      return html.replace(
        /<link[^>]*unpkg\.com\/element-plus\/dist\/index\.css[^>]*>/i,
        snippet
      );
    },
  };
}

module.exports = defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
  plugins: [viteSyncPublicJsPlugin(), viteVendorHeadPlugin()],
  build: {
    rollupOptions: {
      input: collectHtmlInputs(),
    },
  },
});
