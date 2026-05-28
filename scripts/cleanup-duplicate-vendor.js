#!/usr/bin/env node
/** 移除 PCF_VENDOR_HEAD 标记块之外重复的 unpkg Vue/Element 引用 */
const { readFileSync, writeFileSync, readdirSync, statSync } = require('fs');
const { resolve, join, relative } = require('path');

const ROOT = resolve(__dirname, '..');
const VENDOR_LINE_RE =
  /^\s*<(?:link[^>]*(?:unpkg\.com\/element-plus|href="[^"]*vendor\/element-plus)|script[^>]*(?:unpkg\.com\/(?:vue@3|element-plus|@element-plus)|vendor\/(?:vue|element-plus)))[^>]*>\s*$/gim;

function collectHtmlFiles(dir, list) {
  list = list || [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (['node_modules', 'dist', '_archive', 'snippets'].includes(name)) continue;
      collectHtmlFiles(full, list);
    } else if (name.endsWith('.html')) list.push(full);
  }
  return list;
}

function cleanup(html) {
  if (!html.includes('PCF_VENDOR_HEAD')) return html;
  const start = html.indexOf('<!-- PCF_VENDOR_HEAD');
  const end = html.indexOf('<!-- /PCF_VENDOR_HEAD -->');
  if (start < 0 || end < 0) return html;
  const endPos = end + '<!-- /PCF_VENDOR_HEAD -->'.length;
  const before = html.slice(0, start).replace(VENDOR_LINE_RE, '');
  const block = html.slice(start, endPos);
  const after = html.slice(endPos).replace(VENDOR_LINE_RE, '');
  return before + block + after;
}

let n = 0;
for (const f of collectHtmlFiles(ROOT)) {
  const orig = readFileSync(f, 'utf8');
  const next = cleanup(orig);
  if (next !== orig) {
    writeFileSync(f, next, 'utf8');
    console.log('[cleanup-vendor]', relative(ROOT, f));
    n += 1;
  }
}
console.log('[cleanup-vendor] done', n);
