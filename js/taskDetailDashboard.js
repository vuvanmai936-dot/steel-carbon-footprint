/**
 * 任务详情页 — 统一信息条与状态标题（docs/03_任务详情/12）
 * 各 HTML 页在 template 中复用下列标题常量；viewOrder / viewSupplier 须在 methods 中注册。
 */
(function (global) {
  'use strict';

  var STATUS_TITLE_BY_STAGE = {
    config: '配置状态',
    collect: '采集状态',
    lca: '计算状态',
    verify: '核查状态',
    report: '报告状态',
    certify: '报告状态',
  };

  var BREADCRUMB_STAGE = {
    config: '配置规则',
    collect: '数据采集',
    lca: 'LCA 计算',
    verify: '核查验收',
    certify: '报告',
  };

  function getStatusTitle(stageKey) {
    return STATUS_TITLE_BY_STAGE[stageKey] || '任务状态';
  }

  function getBreadcrumbStage(stageKey) {
    return BREADCRUMB_STAGE[stageKey] || stageKey;
  }

  /** 注册文档约定的跳转方法（若页面未实现） */
  function bindDefaultViewHandlers(vm) {
    if (!vm || !vm.methods) return;
    if (!vm.methods.viewOrder) {
      vm.methods.viewOrder = function () {
        global.location.href = 'order.html';
      };
    }
    if (!vm.methods.viewSupplier) {
      vm.methods.viewSupplier = function () {
        global.location.href = 'supplier_mgt_detail.html';
      };
    }
  }

  global.TaskDetailDashboard = {
    STATUS_TITLE_BY_STAGE: STATUS_TITLE_BY_STAGE,
    BREADCRUMB_STAGE: BREADCRUMB_STAGE,
    getStatusTitle: getStatusTitle,
    getBreadcrumbStage: getBreadcrumbStage,
    bindDefaultViewHandlers: bindDefaultViewHandlers,
  };
})(typeof window !== 'undefined' ? window : this);
