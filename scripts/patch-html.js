#!/usr/bin/env node
/**
 * 批量维护 HTML：
 * 1) 将 Vue/Element 依赖替换为 snippets/pcf-vendor-*.html（public/vendor 本地副本）
 * 2) SpreadJS CDN 标记块
 * 3) 在 layout 脚本前注入 sharedShell.js
 */
const { readFileSync, writeFileSync, readdirSync, statSync } = require('fs');
const { resolve, join, relative } = require('path');

const ROOT = resolve(__dirname, '..');
const SNIPPETS = resolve(ROOT, 'snippets');

function readSnippet(name) {
  return readFileSync(resolve(SNIPPETS, name), 'utf8').trim();
}

function vendorPrefix(rel) {
  if (rel.startsWith('prototype/')) return '../../';
  if (rel.includes('/')) return '../';
  return '';
}

function applyVendorSnippet(snippet, rel) {
  return snippet.replace(/\{\{PREFIX\}\}/g, vendorPrefix(rel));
}

const VENDOR_FULL_RAW = readSnippet('pcf-vendor-full.html');
const VENDOR_BASIC_RAW = readSnippet('pcf-vendor-basic.html');
const VENDOR_SPREAD = readSnippet('pcf-vendor-spread.html');

const VENDOR_MARKER_RE = /<!-- PCF_VENDOR_HEAD(?::\w+)? -->[\s\S]*?<!-- \/PCF_VENDOR_HEAD -->/;

const UNPKG_LINE_RE = /^\s*<(?:link|script)[^>]*unpkg\.com[^>]*>\s*<\/(?:link|script)>\s*$/gm;

const SPREAD_MARKER_RE = /<!-- PCF_VENDOR_SPREAD -->[\s\S]*?<!-- \/PCF_VENDOR_SPREAD -->/;
const LEGACY_SPREAD_RE =
  /<link[^>]*grapecity\.com\/spreadjs[^>]*>\s*<script[^>]*grapecity\.com\/spreadjs[^>]*><\/script>\s*/;

function collectHtmlFiles(dir, list) {
  list = list || [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (['node_modules', 'dist', '_archive', 'snippets'].includes(name)) continue;
      collectHtmlFiles(full, list);
    } else if (name.endsWith('.html')) {
      list.push(full);
    }
  }
  return list;
}

function injectSharedShell(html, relPath) {
  const depth = relPath.startsWith('prototype/')
    ? 2
    : relPath.includes('/')
      ? 1
      : 0;
  const prefix = depth === 0 ? 'js/' : depth === 1 ? '../js/' : '../../js/';
  const tag = `<script src="${prefix}sharedShell.js"></script>\n    `;
  if (html.includes('sharedShell.js')) return html;
  const patterns = [
    /<script src="[^"]*\/js\/layout\.js"><\/script>/,
    /<script src="[^"]*\/js\/supplierLayout\.js"><\/script>/,
    /<script src="[^"]*\/js\/certifierLayout\.js"><\/script>/,
  ];
  for (const re of patterns) {
    if (re.test(html)) return html.replace(re, (m) => tag + m);
  }
  return html;
}

function patchVendor(html, snippet) {
  const snip = snippet.trim() + '\n';
  html = html.replace(UNPKG_LINE_RE, '');
  if (VENDOR_MARKER_RE.test(html)) {
    return html.replace(VENDOR_MARKER_RE, snip);
  }
  if (html.includes('vendor/vue.global')) {
    return html;
  }
  return html.replace(/(<script src="[^"]*js\/)/, snip + '$1');
}

function patchSpread(html) {
  if (SPREAD_MARKER_RE.test(html)) {
    return html.replace(SPREAD_MARKER_RE, VENDOR_SPREAD.trim());
  }
  if (LEGACY_SPREAD_RE.test(html)) {
    return html.replace(LEGACY_SPREAD_RE, VENDOR_SPREAD.trim() + '\n');
  }
  return html;
}

function patchFile(filePath) {
  const rel = relative(ROOT, filePath);
  let html = readFileSync(filePath, 'utf8');
  const before = html;

  const useBasic =
    rel === 'index.html' ||
    (html.includes('vue@3') &&
      !html.includes('icons-vue') &&
      !html.includes('element-plus-icons'));
  const vendorSnippet = applyVendorSnippet(useBasic ? VENDOR_BASIC_RAW : VENDOR_FULL_RAW, rel);

  const needsVue =
    /PCF_VENDOR_HEAD|unpkg\.com\/vue@3|vendor\/vue\.global/.test(html) ||
    /\bVue\.createApp\b|\bcreateApp\s*\(/.test(html) ||
    (/\.\.\/js\/layout\.js/.test(html) && !html.includes('vendor/vue.global'));
  if (needsVue) {
    const portalVueOnly = rel === 'pcf.html';
    if (!VENDOR_MARKER_RE.test(html) && !html.includes('vendor/vue.global')) {
      if (portalVueOnly) {
        const vueTag =
          `    <script src="${vendorPrefix(rel)}vendor/vue.global.prod.js"></script>\n`;
        html = html.replace(
          /(<link rel="stylesheet" href="css\/common\.css">)/,
          '$1\n\n' + vueTag
        );
      } else {
        const snip = vendorSnippet.trim() + '\n\n';
        if (SPREAD_MARKER_RE.test(html)) {
          html = html.replace(SPREAD_MARKER_RE, (m) => m + '\n\n' + snip);
        } else {
          html = html.replace(
            /(<link rel="stylesheet" href="\.\.\/css\/common\.css">)/,
            '$1\n\n' + snip
          );
        }
      }
    } else if (!portalVueOnly) {
      html = patchVendor(html, vendorSnippet);
    }
  }
  if (/grapecity\.com\/spreadjs|PCF_VENDOR_SPREAD/.test(html)) {
    html = patchSpread(html);
  }
  html = injectSharedShell(html, rel);

  if (html !== before) {
    writeFileSync(filePath, html, 'utf8');
    console.log('[patch-html] updated', rel);
  }
}

for (const f of collectHtmlFiles(ROOT)) {
  patchFile(f);
}
console.log('[patch-html] done');
