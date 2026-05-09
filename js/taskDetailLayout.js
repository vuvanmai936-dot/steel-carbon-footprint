/**
 * 任务详情页 - 统一布局与角色分发控制器
 * 三端（中心运营 / 供应商 / 核查机构）共用：读取当前角色、渲染 5 阶段进度条、初始化右侧协作日志面板。
 * 业务阶段：0 配置 → 1 采集(含审核) → 2 计算 → 3 核查 → 4 报告
 */
(function (global) {
  'use strict';

  var ROLE_L3_OPERATOR = 'L3_OPERATOR';
  var ROLE_L2_SUPPLIER = 'L2_SUPPLIER';
  var ROLE_L4_CERTIFIER = 'L4_CERTIFIER';

  /** 5 阶段配置：key、label、operator 端文件名、supplier/certifier 端路由由各端自行映射 */
  var STAGE_KEYS = ['config', 'collect', 'lca', 'verify', 'report'];
  var STAGE_LABELS = { config: '配置', collect: '采集', lca: '计算', verify: '核查', report: '报告' };

  /**
   * 获取当前访问者角色
   * 优先使用页面设置的 window.TASK_DETAIL_ROLE；否则根据当前 URL 路径推断（operator / supplier / certifier）
   * @returns {string} 'L3_OPERATOR' | 'L2_SUPPLIER' | 'L4_CERTIFIER'
   */
  function getCurrentRole() {
    if (typeof global.TASK_DETAIL_ROLE === 'string') {
      var r = global.TASK_DETAIL_ROLE.toUpperCase();
      if (r === 'L3_OPERATOR' || r === 'L2_SUPPLIER' || r === 'L4_CERTIFIER') return r;
    }
    var path = (typeof global.location !== 'undefined' && global.location.pathname) || '';
    if (/\/operator\//.test(path)) return ROLE_L3_OPERATOR;
    if (/\/supplier\//.test(path)) return ROLE_L2_SUPPLIER;
    if (/\/certifier\//.test(path)) return ROLE_L4_CERTIFIER;
    return ROLE_L3_OPERATOR;
  }

  /**
   * 获取 5 阶段进度条数据（按 key 去重；支持按角色过滤，如认证机构仅展示核查与报告）
   * @param {string} [taskId=''] 任务 ID，用于拼接阶段页链接
   * @param {string} [currentStage=''] 当前阶段 key，用于高亮
   * @param {Object} [options] basePath: 阶段页根路径（如 'operator/'）；fromOrder: 是否来自订单；stageKeys: 仅返回指定阶段；role: 为 L4_CERTIFIER 时仅返回 verify/report
   * @returns {Array<{key: string, label: string, href: string}>}
   */
  function getStageSteps(taskId, currentStage, options) {
    options = options || {};
    var basePath = (options.basePath != null ? options.basePath : '').replace(/\/?$/, '');
    var fromOrder = options.fromOrder === true;
    var q = (taskId ? '?taskId=' + encodeURIComponent(taskId) : '') + (fromOrder ? '&from=order' : '');

    var operatorFiles = {
      config: 'task_detail_config.html',
      collect: 'task_detail_collect.html',
      lca: 'task_detail_lca.html',
      verify: 'task_detail_verify.html',
      report: 'task_detail_certify.html'
    };

    var keys = STAGE_KEYS;
    if (options.stageKeys && Array.isArray(options.stageKeys) && options.stageKeys.length > 0) {
      keys = options.stageKeys.filter(function (k) { return STAGE_KEYS.indexOf(k) !== -1; });
    } else if (options.role === ROLE_L4_CERTIFIER) {
      keys = ['verify', 'report'];
    }

    var list = keys.map(function (key) {
      var file = operatorFiles[key] || (key + '.html');
      var href = basePath ? basePath + '/' + file + q : file + q;
      return { key: key, label: STAGE_LABELS[key] || key, href: href };
    });

    // 按 key 去重，保留首次出现
    var seen = {};
    return list.filter(function (item) {
      if (seen[item.key]) return false;
      seen[item.key] = true;
      return true;
    });
  }

  /**
   * 初始化右侧协作日志与澄清面板容器
   * 仅负责在目标容器内挂载占位结构；具体澄清列表、输入框由各页或 clarifyUtils 初始化
   * @param {string|HTMLElement} containerIdOrEl 容器 id 或 DOM 元素
   * @param {Object} [options] taskId, role, onReady 等
   */
  function initRightPanel(containerIdOrEl, options) {
    options = options || {};
    var el = typeof containerIdOrEl === 'string'
      ? global.document.getElementById(containerIdOrEl)
      : containerIdOrEl;
    if (!el) return;
    el.setAttribute('data-task-detail-right-panel', 'ready');
    if (typeof options.onReady === 'function') options.onReady(el);
  }

  /**
   * 根据阶段 key 与角色，返回该阶段中央区应渲染的“视图类型”（供各页业务脚本消费）
   * @param {string} stageKey 阶段 key：config | collect | lca | verify | report
   * @param {string} [role] 角色，默认 getCurrentRole()
   * @returns {{ viewType: string, role: string }}
   */
  function getStageViewConfig(stageKey, role) {
    var r = role || getCurrentRole();
    return { viewType: stageKey + '_' + r, role: r };
  }

  var api = {
    ROLE_L3_OPERATOR: ROLE_L3_OPERATOR,
    ROLE_L2_SUPPLIER: ROLE_L2_SUPPLIER,
    ROLE_L4_CERTIFIER: ROLE_L4_CERTIFIER,
    STAGE_KEYS: STAGE_KEYS,
    STAGE_LABELS: STAGE_LABELS,
    getCurrentRole: getCurrentRole,
    getStageSteps: getStageSteps,
    initRightPanel: initRightPanel,
    getStageViewConfig: getStageViewConfig
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.TaskDetailLayout = api;
  }
})(typeof window !== 'undefined' ? window : this);
