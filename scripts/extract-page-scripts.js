#!/usr/bin/env node
/**
 * 将指定 HTML 内首个内联 <script>（非 src）外提到 js/pages/
 * 用法：node scripts/extract-page-scripts.js operator/order.html
 */
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { resolve, dirname, relative } = require('path');

const ROOT = resolve(__dirname, '..');
const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['operator/order.html'];

for (const rel of targets) {
  const htmlPath = resolve(ROOT, rel);
  let html = readFileSync(htmlPath, 'utf8');
  const matches = [...html.matchAll(/<script>\s*([\s\S]*?)<\/script>/g)];
  const m = matches.length ? [matches[matches.length - 1][0], matches[matches.length - 1][1]] : null;
  if (!m) {
    console.warn('[extract] skip (no inline script):', rel);
    continue;
  }
  const base = rel.replace(/\.html$/, '').replace(/\//g, '_');
  const outRel = `js/pages/${base}.js`;
  const outPath = resolve(ROOT, outRel);
  mkdirSync(dirname(outPath), { recursive: true });
  const body = m[1].trim();
  writeFileSync(
    outPath,
    '/* eslint-disable */\n' + (body.startsWith('(') ? body : '(function () {\n' + body + '\n})();') + '\n',
    'utf8'
  );
  const depth = rel.split('/').length - 1;
  const prefix = depth === 1 ? '../' : depth === 2 ? '../../' : '';
  const src = `${prefix}${outRel}`;
  html = html.replace(m[0], `<script src="${src}"></script>`);
  writeFileSync(htmlPath, html, 'utf8');
  console.log('[extract]', rel, '->', outRel);
}
