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

  var taskId = new URLSearchParams(window.location.search).get('taskId') || 'TSK-2026-889';
  var taskInfo = typeof getTaskInfoFromUrl === 'function'
    ? getTaskInfoFromUrl('TSK-2026-889')
    : { taskId: taskId, orderNo: 'ORD-20260203-001', supplier: '示例供应商', productName: '热轧卷板', specs: 'Q235B' };
  if (taskId && !taskInfo.taskId) taskInfo.taskId = taskId;
  var currentStage = 'verify';

  var currentRole = window.TaskDetailLayout ? window.TaskDetailLayout.getCurrentRole() : 'L4_CERTIFIER';
  var stageSteps = window.TaskDetailLayout ? window.TaskDetailLayout.getStageSteps(taskId, currentStage, { basePath: 'operator' }) : [];
  var taskRow = typeof getTaskByTaskId === 'function' ? getTaskByTaskId(taskId, 3) : null;

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
        verifyFiles: [],
        rfiLogs: [
          { time: '10:00', content: '进入核查阶段，已向 SGS 下发数据底稿' },
          { time: '11:20', content: '核查员已查看电力消耗凭证' }
        ],
        // 模拟未脱敏的底层台账数据（给 L4 看的）
        fullLedgerRows: [
          { category: '能源', item: '电力消耗', unit: 'kWh', value: '27200.32', remark: '含凭证附件' },
          { category: '原材料', item: '针状焦投入', unit: '吨', value: '500.00', remark: '' },
          { category: '能源', item: '天然气', unit: 'm³', value: '6046.00', remark: '' }
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
        if (this.currentRole === 'L4_CERTIFIER') return '核查处理中';
        if (this.currentRole === 'L3_OPERATOR') return '等待三方';
        return '核查中';
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
      goPortal: function () { window.location.href = '../index.html'; },
      viewOrder: function () { ElementPlus.ElMessage('跳转到订单详情'); },
      viewSupplier: function () { ElementPlus.ElMessage('跳转到供应商详情'); },
      
      onVerifyFileChange: function(file, fileList) {
        this.verifyFiles = fileList;
      },
      startClarification: function() {
        ElementPlus.ElMessage('已触发澄清请求（后续将唤起右侧面板聊天窗口）');
        this.rfiLogs.push({
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          content: '核查机构发起了一条澄清请求'
        });
      },
      finishVerify: function() {
        if (this.verifyFiles.length === 0) {
          ElementPlus.ElMessage.warning('请先上传核查报告或声明证书！');
          return;
        }
        ElementPlus.ElMessageBox.confirm('结束核查后任务将进入“报告”阶段，是否确认？', '完成核查提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        }).then(function () {
          var loading = ElementPlus.ElLoading.service({ text: '正在流转至报告阶段...', fullscreen: true });
          ElementPlus.ElMessage.success('核查任务已结束，数据已流转！');
          setTimeout(function () {
            loading.close();
            window.location.href = 'report_mgt.html';
          }, 1500);
        }).catch(function () {});
      }
    },
    mounted: function () {
      if (window.TaskDetailLayout && window.TaskDetailLayout.initRightPanel) {
        window.TaskDetailLayout.initRightPanel('task-detail-right-panel', { taskId: taskId, role: this.currentRole });
      }
    }
  };
  if (window.TaskDetailLayout && TaskDetailLayout.applyTaskDetailSlaOptions) {
    taskDetailAppOpts = TaskDetailLayout.applyTaskDetailSlaOptions(taskDetailAppOpts);
  }
  var app = Vue.createApp(taskDetailAppOpts);

  // 挂载 Element Plus 与 Icons
  var localeOpt = typeof ElementPlusLocaleZhCn !== 'undefined' ? { locale: ElementPlusLocaleZhCn } : {};
  app.use(ElementPlus, localeOpt);
  if (typeof ElementPlusIconsVue !== 'undefined') {
    for (var k in ElementPlusIconsVue) app.component(k, ElementPlusIconsVue[k]);
  }
  
  app.mount('#app');
})();
