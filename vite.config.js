const { resolve } = require('path');
const { readdirSync } = require('fs');
const { defineConfig } = require('vite');

// 收集所有 HTML 作为多页面入口（根目录 + operator / supplier / certifier）
function collectHtmlInputs() {
  const root = resolve(__dirname);
  const input = {};
  const dirs = ['', 'operator', 'supplier', 'certifier'];
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

module.exports = defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: collectHtmlInputs(),
    },
  },
});
