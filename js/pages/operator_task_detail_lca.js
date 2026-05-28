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
  var currentStage = 'lca';
  var currentRole = window.TaskDetailLayout ? window.TaskDetailLayout.getCurrentRole() : 'L3_OPERATOR';
  var stageSteps = window.TaskDetailLayout ? window.TaskDetailLayout.getStageSteps(taskId, currentStage, { basePath: 'operator' }) : [];
  var taskRow = typeof getTaskByTaskId === 'function' ? getTaskByTaskId(taskId, 2) : null;

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
        lcaFiles: [],
        lcaLogs: [
          { time: '09:30', content: '采集数据已审核通过，进入 LCA 计算阶段' },
          { time: '10:00', content: '等待上传核算底稿或对接计算引擎' }
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
        if (this.currentRole === 'L3_OPERATOR') return 'LCA 计算中';
        return '等待核算结果';
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
      onLcaFileChange: function (file, fileList) {
        this.lcaFiles = fileList;
      },
      completeLcaFlow: function () {
        var self = this;
        ElementPlus.ElMessageBox.confirm(
          '确认完成 LCA 计算后，任务将流转至三方核查阶段，是否继续？',
          '完成 LCA 计算，流转至三方核查',
          { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
        ).then(function () {
          var loading = ElementPlus.ElLoading.service({ text: '正在流转至核查阶段...', fullscreen: true });
          ElementPlus.ElMessage.success('LCA 计算已完成，已流转至核查阶段');
          setTimeout(function () {
            loading.close();
            window.location.href = 'task_detail_verify.html?taskId=' + encodeURIComponent(taskId);
          }, 1200);
        }).catch(function () {});
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
