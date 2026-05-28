#!/usr/bin/env node
/** 运营端五段任务详情：统一 SLA 顶栏 + applyTaskDetailSlaOptions */
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const ROOT = resolve(__dirname, '..');
const FILES = [
  'operator/task_detail_config.html',
  'operator/task_detail_collect.html',
  'operator/task_detail_lca.html',
  'operator/task_detail_verify.html',
  'operator/task_detail_certify.html',
];

const SLA_BLOCK = `          <el-tooltip content="SLA 剩余时间" placement="bottom">
            <div class="sla-capsule"><el-icon><Timer /></el-icon> {{ formatSla(slaRemaining) }}</div>
          </el-tooltip>
`;

const AVATAR_RE =
          /(<div style="display: flex; align-items: center;">\s*)(<el-avatar)/;

const CREATE_APP_RE = /var app = Vue\.createApp\(\{/;

const BREADCRUMB_CONFIG_RE = /<el-breadcrumb-item>模板配置<\/el-breadcrumb-item>/;

for (const rel of FILES) {
  const path = resolve(ROOT, rel);
  let html = readFileSync(path, 'utf8');
  let changed = false;

  if (!html.includes('sla-capsule') && AVATAR_RE.test(html)) {
    html = html.replace(AVATAR_RE, '$1' + SLA_BLOCK + '          $2');
    changed = true;
  }

  if (CREATE_APP_RE.test(html) && !html.includes('applyTaskDetailSlaOptions')) {
    html = html.replace(
      CREATE_APP_RE,
      'var _taskDetailAppOpts = {'
    );
    html = html.replace(
      /(\n\s*var app = Vue\.createApp\(_taskDetailAppOpts\);|\n\s*initApp\(app\)\.mount|mount\('#app'\))/,
      function (m, idx, full) {
        return m;
      }
    );
    // Insert after closing }); of createApp options - find last `});` before initApp/mount
    const marker = 'var _taskDetailAppOpts = {';
    if (html.includes(marker) && !html.includes('applyTaskDetailSlaOptions(_taskDetailAppOpts)')) {
      html = html.replace(
        /var _taskDetailAppOpts = \{[\s\S]*?\n  \}\);\n\n  (?:initApp\(app\)|var app = Vue\.createApp)/,
        function (block) {
          if (block.includes('applyTaskDetailSlaOptions')) return block;
          return block.replace(
            /\n  \}\);\n\n  (initApp\(app\)|var app = Vue\.createApp)/,
            '\n  });\n  if (window.TaskDetailLayout && TaskDetailLayout.applyTaskDetailSlaOptions) {\n    _taskDetailAppOpts = TaskDetailLayout.applyTaskDetailSlaOptions(_taskDetailAppOpts);\n  }\n  var app = Vue.createApp(_taskDetailAppOpts);\n\n  $1'
          );
        }
      );
      // Fallback simpler: replace `});` followed by initApp(app)
      if (!html.includes('applyTaskDetailSlaOptions')) {
        html = html.replace(
          /\n  \}\);\n\n  initApp\(app\)\.mount\('#app'\);/,
          '\n  });\n  if (window.TaskDetailLayout && TaskDetailLayout.applyTaskDetailSlaOptions) {\n    _taskDetailAppOpts = TaskDetailLayout.applyTaskDetailSlaOptions(_taskDetailAppOpts);\n  }\n  var app = Vue.createApp(_taskDetailAppOpts);\n  initApp(app).mount(\'#app\');'
        );
      }
      if (!html.includes('applyTaskDetailSlaOptions')) {
        html = html.replace(
          /\n  \}\);\n\n  var app = Vue\.createApp\(/,
          '\n  });\n  if (window.TaskDetailLayout && TaskDetailLayout.applyTaskDetailSlaOptions) {\n    _taskDetailAppOpts = TaskDetailLayout.applyTaskDetailSlaOptions(_taskDetailAppOpts);\n  }\n  var app = Vue.createApp('
        );
      }
      changed = true;
    }
  }

  if (rel.includes('task_detail_config') && BREADCRUMB_CONFIG_RE.test(html)) {
    html = html.replace(BREADCRUMB_CONFIG_RE, '<el-breadcrumb-item>配置规则</el-breadcrumb-item>');
    changed = true;
  }

  if (changed) {
    writeFileSync(path, html, 'utf8');
    console.log('[patch-sla]', rel);
  }
}
