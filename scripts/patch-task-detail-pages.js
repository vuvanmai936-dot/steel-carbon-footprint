#!/usr/bin/env node
/**
 * 运营端五段任务详情：注入 taskDetailDashboard / spreadWrapper、TDS 说明条、统一面包屑第三级。
 */
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const ROOT = resolve(__dirname, '..');
const TDS_HTML =
  '<div class="task-info-dashboard__tds">可信数据空间：本任务数据仅限授权范围内使用，禁止未授权下载、截图与传播；数据安全与隐私受数字合约保护。</div>\n';

const FILES = [
  { path: 'operator/task_detail_config.html', stage: 'config', breadcrumb: '配置规则' },
  { path: 'operator/task_detail_collect.html', stage: 'collect', breadcrumb: '数据采集' },
  { path: 'operator/task_detail_lca.html', stage: 'lca', breadcrumb: 'LCA 计算' },
  { path: 'operator/task_detail_verify.html', stage: 'verify', breadcrumb: '核查验收' },
  { path: 'operator/task_detail_certify.html', stage: 'certify', breadcrumb: '报告' },
];

function injectScripts(html) {
  if (!html.includes('taskDetailDashboard.js')) {
    html = html.replace(
      /<script src="\.\.\/js\/taskDetailLayout\.js"><\/script>/,
      '<script src="../js/taskDetailLayout.js"></script>\n  <script src="../js/taskDetailDashboard.js"></script>'
    );
  }
  if (html.includes('spreadUtils.js') && !html.includes('spreadWrapper.js')) {
    html = html.replace(
      /<script src="\.\.\/js\/spreadUtils\.js"><\/script>/,
      '<script src="../js/spreadUtils.js"></script>\n  <script src="../js/spreadWrapper.js"></script>'
    );
  }
  return html;
}

function injectTds(html) {
  if (html.includes('task-info-dashboard__tds')) return html;
  return html.replace(
    /(<header class="task-detail-unified__top">[\s\S]*?<\/header>)/,
    '$1\n              ' + TDS_HTML.trim()
  );
}

function fixBreadcrumb(html, label) {
  const re = /<el-breadcrumb-item>[^<]*(?:模板配置|数据采集|LCA|核查|报告)[^<]*<\/el-breadcrumb-item>/;
  if (re.test(html)) {
    return html.replace(re, `<el-breadcrumb-item>${label}</el-breadcrumb-item>`);
  }
  return html;
}

function injectPageScript(html, stage) {
  const outPath = resolve(ROOT, `js/pages/operator/task_detail_${stage}.js`);
  const marker = `js/pages/operator/task_detail_${stage}.js`;
  if (html.includes(marker)) return html;

  const m = html.match(/<script>\s*(\(function\s*\(\)\s*\{[\s\S]*?)\)\(\);\s*<\/script>\s*<\/body>/);
  if (!m) return html;

  const body = m[1];
  const wrapped =
    '/* eslint-disable */\n(function () {\n' +
    body +
    '\n})();\n';
  writeFileSync(outPath, wrapped, 'utf8');
  console.log('[patch-task-detail] extracted', marker);

  return html.replace(m[0], `<script src="../${marker}"></script>\n</body>`);
}

for (const f of FILES) {
  const abs = resolve(ROOT, f.path);
  let html = readFileSync(abs, 'utf8');
  const before = html;
  html = injectScripts(html);
  html = fixBreadcrumb(html, f.breadcrumb);
  html = injectTds(html);
  html = injectPageScript(html, f.stage);
  if (html !== before) {
    writeFileSync(abs, html, 'utf8');
    console.log('[patch-task-detail] updated', f.path);
  }
}

// supplier / certifier 试点：注入 dashboard 脚本
for (const rel of ['supplier/task_fill.html', 'certifier/task_detail.html']) {
  const abs = resolve(ROOT, rel);
  if (!require('fs').existsSync(abs)) continue;
  let html = readFileSync(abs, 'utf8');
  const before = html;
  if (!html.includes('taskDetailDashboard.js') && html.includes('taskDetailLayout.js')) {
    html = html.replace(
      /<script src="\.\.\/js\/taskDetailLayout\.js"><\/script>/,
      '<script src="../js/taskDetailLayout.js"></script>\n    <script src="../js/taskDetailDashboard.js"></script>'
    );
  }
  if (html !== before) {
    writeFileSync(abs, html, 'utf8');
    console.log('[patch-task-detail] updated', rel);
  }
}

console.log('[patch-task-detail] done');
