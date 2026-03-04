#!/usr/bin/env node
/**
 * 从各端「帮助与知识库内容规划.md」同步生成对应 help.html 的正文区块。
 * 支持三端：供应商端、中心端、核查端；同一套逻辑，视角与文案在各端文档中区分。
 * 用法：
 *   node scripts/sync-help-from-doc.js           # 同步三端
 *   node scripts/sync-help-from-doc.js supplier  # 仅供应商端
 *   node scripts/sync-help-from-doc.js operator # 仅中心端
 *   node scripts/sync-help-from-doc.js certifier# 仅核查端
 *   npm run sync-help                            # 同步三端
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const START_MARKER = '<!-- HELP-CONTENT-START -->';
const END_MARKER = '<!-- HELP-CONTENT-END -->';

const ROLES = [
  { role: 'supplier', doc: 'docs/02_功能与对接/供应商端帮助与知识库内容规划.md', html: 'supplier/help.html', label: '供应商端' },
  { role: 'operator', doc: 'docs/02_功能与对接/中心端帮助与知识库内容规划.md', html: 'operator/help.html', label: '中心端' },
  { role: 'certifier', doc: 'docs/02_功能与对接/核查端帮助与知识库内容规划.md', html: 'certifier/help.html', label: '核查端' }
];

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function md(s) {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function parseTable(text) {
  const rows = [];
  const lines = text.split('\n').filter((l) => /^\|/.test(l) && !/^\|[\s\-:]+\|/.test(l.trim()));
  for (const line of lines) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length >= 2) rows.push(cells);
  }
  return rows;
}

function getBlock(content, h3Title) {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  const escaped = h3Title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('###\\s*' + escaped + '\\s*\\n+([\\s\\S]*?)(?=\\n\\s*###|\\n\\s*##|---|$)', 'i');
  const m = normalized.match(re);
  return m ? m[1].trim() : '';
}

function section1(content) {
  const p1 = getBlock(content, '1.1 系统是什么');
  const p2 = getBlock(content, '1.2 您在本系统中的角色');
  const stepsBlock = getBlock(content, '1.3 典型操作路径（三步）');
  const tipBlock = getBlock(content, '1.4 入口与返回');
  const stepLines = stepsBlock.split('\n').filter((l) => /^\d\.\s+/.test(l.trim()));
  let html = '<h2>快速开始</h2>\n';
  html += '<p>' + md(p1) + '</p>\n';
  html += '<h3>您在本系统中的角色</h3>\n<p>' + md(p2) + '</p>\n';
  html += '<h3>典型操作路径（三步）</h3>\n<ul class="step-list">\n';
  stepLines.forEach((line, i) => {
    const text = line.replace(/^\d\.\s*/, '').trim();
    html += '<li><span class="step-num">' + (i + 1) + '</span><span>' + md(text) + '</span></li>\n';
  });
  html += '</ul>\n<div class="tip-box">' + md(tipBlock) + '</div>';
  return html;
}

function parseSection2Blocks(content) {
  const blocks = [];
  const re = /###\s*2\.\d+\s*(.+?)\s*\n+([\s\S]*?)(?=\n\s*###\s*2\.|\n##\s|---|$)/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    blocks.push({ title: m[1].trim(), body: m[2].trim() });
  }
  return blocks;
}

function section2(content) {
  const blocks = parseSection2Blocks(content);
  let html = '<h2>业务与背景</h2>\n';
  blocks.forEach((b) => {
    html += '<h3>' + escapeHtml(b.title) + '</h3>\n';
    if (/^\s*-\s+/m.test(b.body)) {
      html += '<ul>\n';
      b.body.split('\n').forEach((line) => {
        const m = line.match(/^-\s+(.+)/);
        if (m) html += '<li>' + md(m[1]) + '</li>\n';
      });
      html += '</ul>\n';
    } else html += '<p>' + md(b.body) + '</p>\n';
  });
  return html;
}

function section3(content) {
  const rows = parseTable(content);
  let html = '<h2>功能使用指南</h2>\n<table>\n<thead>\n<tr><th>模块</th><th>说明</th></tr>\n</thead>\n<tbody>\n';
  const dataRows = rows[0] && rows[0][0] === '模块' ? rows.slice(1) : rows;
  dataRows.forEach((row) => {
    html += '<tr><td>' + md(row[0]) + '</td><td>' + md(row[1]) + '</td></tr>\n';
  });
  html += '</tbody>\n</table>';
  return html;
}

function parseSection4Blocks(content) {
  const blocks = [];
  const re = /###\s*4\.\d+\s*(.+?)\s*\n+([\s\S]*?)(?=\n\s*###\s*4\.|\n##\s|---|$)/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    blocks.push({ title: m[1].trim(), body: m[2].trim() });
  }
  return blocks;
}

function section4(content) {
  const blocks = parseSection4Blocks(content);
  const elSteps = `<el-steps :active="4" align-center finish-status="success" simple style="margin: 16px 0;">
                                <el-step title="配置" />
                                <el-step title="采集" />
                                <el-step title="计算" />
                                <el-step title="核查" />
                                <el-step title="报告" />
                            </el-steps>`;
  let html = '<h2>流程与状态</h2>\n';
  blocks.forEach((b) => {
    html += '<h3>' + escapeHtml(b.title) + '</h3>\n';
    if (/^\s*-\s+/m.test(b.body)) {
      html += '<ul>\n';
      b.body.split('\n').forEach((line) => {
        const m = line.match(/^-\s+(.+)/);
        if (m) html += '<li>' + md(m[1]) + '</li>\n';
      });
      html += '</ul>\n';
    } else html += '<p>' + md(b.body) + '</p>\n';
    if (b.title.indexOf('任务五阶段') !== -1) html += elSteps + '\n';
  });
  return html;
}

function parseSection5Blocks(content) {
  const blocks = [];
  const re = /###\s*5\.\d+\s*(.+?)\s*\n+([\s\S]*?)(?=\n\s*###\s*5\.|\n##\s|---|$)/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    blocks.push({ title: m[1].trim(), body: m[2].trim() });
  }
  return blocks;
}

function section5(content) {
  const blocks = parseSection5Blocks(content);
  let html = '<h2>安全与合规</h2>\n';
  blocks.forEach((b) => {
    html += '<h3>' + escapeHtml(b.title) + '</h3>\n<p>' + md(b.body) + '</p>\n';
  });
  return html;
}

function section6(content) {
  const rows = parseTable(content);
  const dataRows = rows[0] && rows[0][0] === '问题' ? rows.slice(1) : rows;
  let html = '<h2>常见问题 (FAQ)</h2>\n<el-collapse v-model="activeFaq" class="faq-collapse">\n';
  dataRows.forEach((row, i) => {
    const name = String(i + 1);
    html += '<el-collapse-item name="' + name + '">\n';
    html += '<template #title><span style="font-weight: 500;">' + md(row[0]) + '</span></template>\n';
    html += '<div>' + md(row[1]) + '</div>\n</el-collapse-item>\n';
  });
  html += '</el-collapse>';
  return html;
}

function section7(content) {
  const p = content.replace(/#+\s*/g, '').trim();
  return '<h2>联系与支持</h2>\n<p>' + md(p) + '</p>';
}

function syncOne(roleConfig) {
  const DOC_PATH = path.join(ROOT, roleConfig.doc);
  const HELP_HTML_PATH = path.join(ROOT, roleConfig.html);
  if (!fs.existsSync(DOC_PATH)) {
    console.error('未找到文档: ' + DOC_PATH);
    return false;
  }
  const raw = fs.readFileSync(DOC_PATH, 'utf8');
  const parts = raw.split(/\n##\s+/);
  const getPart = (key) => {
    const p = parts.find((x) => x.trimStart().startsWith(key));
    if (!p) return '';
    return p.replace(/^[^\n]+\n/, '').replace(/\n---[\s\S]*$/, '').replace(/\r\n/g, '\n').trim();
  };

  const s1 = section1(getPart('一、快速开始'));
  const s2 = section2(getPart('二、业务与背景'));
  const s3 = section3(getPart('三、功能使用指南'));
  const s4 = section4(getPart('四、流程与状态'));
  const s5 = section5(getPart('五、安全与合规'));
  const s6 = section6(getPart('六、常见问题 FAQ'));
  const s7 = section7(getPart('七、联系与支持'));

  const sections = [
    { id: 'section-quickstart', body: s1 },
    { id: 'section-background', body: s2 },
    { id: 'section-guide', body: s3 },
    { id: 'section-flow', body: s4 },
    { id: 'section-security', body: s5 },
    { id: 'section-faq', body: s6 },
    { id: 'section-contact', body: s7 },
  ];

  const indent = '                        ';
  const generated = sections
    .map((s) => indent + '<!-- ' + s.id + ' -->\n' + indent + '<section id="' + s.id + '" class="help-section">\n' + s.body.split('\n').map((l) => indent + l).join('\n') + '\n' + indent + '</section>')
    .join('\n\n');

  if (!fs.existsSync(HELP_HTML_PATH)) {
    console.error('未找到: ' + HELP_HTML_PATH);
    return false;
  }
  let html = fs.readFileSync(HELP_HTML_PATH, 'utf8');

  if (!html.includes(START_MARKER) || !html.includes(END_MARKER)) {
    console.error(roleConfig.html + ' 中缺少 ' + START_MARKER + ' 或 ' + END_MARKER + '，请先添加占位注释。');
    return false;
  }

  const re = new RegExp(START_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + END_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  html = html.replace(re, START_MARKER + '\n' + generated + '\n                        ' + END_MARKER);

  fs.writeFileSync(HELP_HTML_PATH, html, 'utf8');
  console.log('已根据 ' + path.basename(roleConfig.doc) + ' 更新 ' + roleConfig.html);
  return true;
}

function main() {
  const arg = (process.argv[2] || '').toLowerCase();
  const toSync = arg ? ROLES.filter((r) => r.role === arg) : ROLES;
  if (toSync.length === 0) {
    console.error('用法: node scripts/sync-help-from-doc.js [supplier|operator|certifier]');
    console.error('  不传参数则同步三端。');
    process.exit(1);
  }
  toSync.forEach((r) => syncOne(r));
}

main();
