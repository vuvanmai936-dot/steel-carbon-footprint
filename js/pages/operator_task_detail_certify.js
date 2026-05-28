/* eslint-disable */
(function () {
  var layoutApi = SharedLayout.setup();
  var menuConfig = layoutApi.menuConfig;
  var currentUser = layoutApi.currentUser;
  var openPage = layoutApi.openPage;
  var sidebarCollapsed = layoutApi.sidebarCollapsed;
  var toggleSidebar = layoutApi.toggleSidebar;
  var activeMenuId = layoutApi.activeMenuId;
  var goPortal = layoutApi.goPortal;
  var showPortalInHeader = layoutApi.showPortalInHeader;

  var taskInfo = typeof getTaskInfoFromUrl === 'function'
    ? getTaskInfoFromUrl('TSK-2026-889')
    : { taskId: 'TSK-2026-889', orderNo: 'ORD-20260203-001', supplier: '示例供应商', productName: '热轧卷板', specs: 'Q235B' };
  var taskId = (typeof getTaskIdFromUrl === 'function' ? getTaskIdFromUrl() : '') || taskInfo.taskId || '';
  var currentStage = 'report';
  var currentRole = window.TaskDetailLayout ? window.TaskDetailLayout.getCurrentRole() : 'L3_OPERATOR';
  var stageSteps = window.TaskDetailLayout ? window.TaskDetailLayout.getStageSteps(taskId, currentStage, { basePath: 'operator' }) : [];
  var taskRow = typeof getTaskByTaskId === 'function' ? getTaskByTaskId(taskId, 4) : null;

  var taskDetailAppOpts = {
    data: function () {
      return {
        menuConfig: menuConfig,
        currentUser: currentUser,
        openPage: openPage,
        sidebarCollapsed: sidebarCollapsed,
        toggleSidebar: toggleSidebar,
        activeMenuId: activeMenuId,
        goPortal: goPortal,
        showPortalInHeader: showPortalInHeader,
        taskInfo: taskInfo,
        taskRow: taskRow,
        currentStage: currentStage,
        stageSteps: stageSteps,
        currentRole: currentRole,
        verifyFiles: [
          { name: 'SGS 核查报告.pdf', url: '#' },
          { name: '核查声明与符合性证书.pdf', url: '#' }
        ],
        certifyLogs: [
          { time: '09:00', content: '配置下发，模板已选定' },
          { time: '10:15', content: '供应商提交填报数据' },
          { time: '11:30', content: 'LCA 计算完成，进入核查' },
          { time: '14:00', content: '核查机构完成核查，提交报告与声明' },
          { time: '14:05', content: '核查已完成，任务处理结束' }
        ]
      };
    },
    computed: {
      activeStepIndex: function () {
        var idx = this.stageSteps.findIndex(function (s) { return s.key === this.currentStage; }.bind(this));
        return idx >= 0 ? idx : 0;
      },
      statusText: function () {
        var base = (this.taskRow && typeof getStageStatusText === 'function')
          ? getStageStatusText(this.taskRow) : '';
        if (base) return base;
        if (this.currentRole === 'L3_OPERATOR') return '任务已结束';
        if (this.currentRole === 'L2_SUPPLIER') return '等待报告下发';
        return '核查已结束';
      }
    },
    methods: {
      goBack: function () {
        window.location.href = (typeof getFromParam !== 'undefined' && getFromParam() === 'order')
          ? 'order.html'
          : 'self_operated_task_list.html';
      },
      goStage: function (step) {
        if (step && step.key !== this.currentStage && step.href) {
          window.location.href = step.href;
        }
      },
      viewOrder: function () {
        ElementPlus.ElMessage('跳转到订单详情');
      },
      viewSupplier: function () {
        ElementPlus.ElMessage('跳转到供应商详情');
      },
      goReportMgt: function () {
        var url = taskId ? 'report_mgt.html?taskId=' + encodeURIComponent(taskId) : 'report_mgt.html';
        window.location.href = url;
      },
      downloadFile: function (f) {
        ElementPlus.ElMessage.info('下载：' + f.name + '（Mock）');
      }
    },
    mounted: function () {
      if (window.TaskDetailLayout && typeof window.TaskDetailLayout.initRightPanel === 'function') {
        window.TaskDetailLayout.initRightPanel('task-detail-right-panel', { taskId: taskId, role: this.currentRole });
      }
    }
  };
  if (window.TaskDetailLayout && TaskDetailLayout.applyTaskDetailSlaOptions) {
    taskDetailAppOpts = TaskDetailLayout.applyTaskDetailSlaOptions(taskDetailAppOpts);
  }
  var app = Vue.createApp(taskDetailAppOpts);

  var localeOpt = typeof ElementPlusLocaleZhCn !== 'undefined' ? { locale: ElementPlusLocaleZhCn } : {};
  app.use(ElementPlus, localeOpt);
  if (typeof ElementPlusIconsVue !== 'undefined') {
    for (var k in ElementPlusIconsVue) {
      app.component(k, ElementPlusIconsVue[k]);
    }
  }
  app.mount('#app');
})();
