/* eslint-disable */
(function () {
  var layoutApi = typeof SharedLayout !== 'undefined' && SharedLayout.setup ? SharedLayout.setup() : {};
  var menuConfig = layoutApi.menuConfig || [];
  var currentUser = layoutApi.currentUser || { name: 'Admin_001', role: '中心运营管理员' };
  var openPage = layoutApi.openPage || function () {};
  var sidebarCollapsed = layoutApi.sidebarCollapsed;
  var toggleSidebar = layoutApi.toggleSidebar || function () {};
  var activeMenuId = layoutApi.activeMenuId || '';
  var goPortal = layoutApi.goPortal || function () { window.location.href = '../pcf.html'; };
  var showPortalInHeader = layoutApi.showPortalInHeader !== undefined ? layoutApi.showPortalInHeader : false;

  // Mock 任务：taskId=TSK-2026-892，供应商沙钢集团，产品 HRB400E 螺纹钢，规格 Φ22mm，订单号 ORD-20260205-002
  var defaultTaskId = 'TSK-2026-892';
  var taskInfo = typeof getTaskInfoFromUrl === 'function'
    ? getTaskInfoFromUrl(defaultTaskId)
    : { taskId: 'TSK-2026-892', orderNo: 'ORD-20260205-002', supplier: '沙钢集团', productName: 'HRB400E螺纹钢', specs: 'Φ22mm' };
  var taskId = (typeof getTaskIdFromUrl === 'function' ? getTaskIdFromUrl() : '') || taskInfo.taskId || defaultTaskId;
  var currentStage = 'config';
  var currentRole = window.TaskDetailLayout ? window.TaskDetailLayout.getCurrentRole() : 'L3_OPERATOR';
  var stageSteps = window.TaskDetailLayout ? window.TaskDetailLayout.getStageSteps(taskId, currentStage, { basePath: 'operator' }) : [
    { key: 'config', label: '配置', href: '#' },
    { key: 'collect', label: '采集', href: '#' },
    { key: 'lca', label: '计算', href: '#' },
    { key: 'verify', label: '核查', href: '#' },
    { key: 'report', label: '报告', href: '#' }
  ];
  var taskRow = typeof getTaskByTaskId === 'function' ? getTaskByTaskId(taskId, 0) : null;

  // 与产品强关联：仅展示 HRB400E 螺纹钢匹配的模板（Mock 仅一条）
  var PRODUCT_TEMPLATES = [
    { code: 'TPL-HRB400E-V1', name: 'HRB400E螺纹钢碳核算模板', version: 'V1.0', standard: 'ISO 14067:2018', boundary: 'Cradle-to-Gate' }
  ];

  var taskDetailAppOpts = {
    data: function () {
      return {
        menuConfig: menuConfig,
        currentUser: currentUser,
        taskRow: taskRow,
        openPage: openPage,
        sidebarCollapsed: sidebarCollapsed,
        toggleSidebar: toggleSidebar,
        activeMenuId: activeMenuId,
        goPortal: goPortal,
        showPortalInHeader: showPortalInHeader,
        taskInfo: taskInfo,
        currentStage: currentStage,
        stageSteps: stageSteps,
        currentRole: currentRole,
        productTemplates: PRODUCT_TEMPLATES,
        selectedTemplateCode: '',
        selectedCertifier: '',
        accountingPeriod: '2026-01至2026-03',
        spread: null,
        // 是否已执行「确认配置并下发」，用于进度条「采集」阶段置为待激活
        configIssued: false,
        configLogs: [
          { time: '09:00', operator: '系统', action: '任务已创建，等待配置模板' },
          { time: '', operator: '', action: '' }
        ],
        ArrowLeftIcon: typeof ElementPlusIconsVue !== 'undefined' ? ElementPlusIconsVue.ArrowLeft : null
      };
    },
    computed: {
      currentTemplate: function () {
        var code = this.selectedTemplateCode;
        return this.productTemplates.find(function (t) { return t.code === code; }) || null;
      },
      statusText: function () {
        if (this.configIssued) return '模板已配置，待供应商填报';
        var base = (this.taskRow && typeof getStageStatusText === 'function')
          ? getStageStatusText(this.taskRow) : '';
        if (base) return base;
        if (this.currentRole === 'L3_OPERATOR') return '待配置模板';
        if (this.currentRole === 'L2_SUPPLIER') return '等待中心运营配置';
        return '等待前序阶段完成';
      }
    },
    methods: {
      goBack: function () {
        window.location.href = (typeof getFromParam !== 'undefined' && getFromParam() === 'order')
          ? 'order.html'
          : 'self_operated_task_list.html';
      },
      goToTaskList: function () {
        window.location.href = 'self_operated_task_list.html' + (taskId ? '?taskId=' + encodeURIComponent(taskId) : '');
      },
      goStage: function (step) {
        if (step && step.href && step.href !== '#') window.location.href = step.href;
      },
      // 保存草稿：仅追加协作日志，不触发状态流转
      saveDraft: function () {
        var now = new Date();
        var timeStr = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
        var operator = (this.currentUser && this.currentUser.name) ? this.currentUser.name : 'Admin_001';
        this.configLogs.push({ time: timeStr, operator: operator, action: '保存模板配置草稿' });
        ElementPlus.ElMessage.success('草稿已保存');
      },
      // 确认配置并下发：校验模板 → 更新日志 → 更新状态 → 采集阶段激活
      confirmIssue: function () {
        var self = this;
        if (!this.selectedTemplateCode) {
          ElementPlus.ElMessage.warning('请先选择与HRB400E螺纹钢匹配的核算模板');
          return;
        }
        if (!this.spread) {
          ElementPlus.ElMessage.warning('请等待模板预览加载完成');
          return;
        }
        ElementPlus.ElMessageBox.confirm(
          '确认后，模板配置将锁定，并下发到供应商的采集阶段。是否继续？',
          '确认配置并下发任务',
          { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' }
        ).then(function () {
          var now = new Date();
          var timeStr = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
          var operator = (self.currentUser && self.currentUser.name) ? self.currentUser.name : 'Admin_001';
          var supplierName = (self.taskInfo && self.taskInfo.supplier) ? self.taskInfo.supplier : '供应商';
          self.configLogs.push({
            time: timeStr,
            operator: operator,
            action: '配置模板并下发至' + supplierName + '，任务进入采集阶段'
          });
          self.configIssued = true;
          if (typeof saveTaskSnapshot === 'function') {
            var json = self.spread.toJSON();
            saveTaskSnapshot(taskId, { version: '1.0', templateId: self.selectedTemplateCode, sheetData: json });
          }
          ElementPlus.ElMessage.success('配置已锁定，任务已流转至采集阶段');
        }).catch(function () {});
      },
      initSpreadForTemplate: function () {
        var self = this;
        if (this.currentRole !== 'L3_OPERATOR') return;
        this.$nextTick(function () {
          var host = document.getElementById('ss');
          if (!host || !window.GC || !GC.Spread || !GC.Spread.Sheets) {
            ElementPlus.ElMessage.error('表格加载失败，请刷新页面或联系管理员');
            return;
          }
          if (self.spread && typeof self.spread.destroy === 'function') {
            self.spread.destroy();
            self.spread = null;
          }
          while (host.firstChild) host.removeChild(host.firstChild);
          var spread = SpreadUtils.createWorkbook(host);
          self.spread = spread;
          var sheet = spread.getActiveSheet();
          spread.options.tabStripVisible = false;
          spread.options.newTabVisible = false;
          // 只读：整表保护
          if (sheet.options) sheet.options.isProtected = true;
          if (typeof sheet.protect === 'function') sheet.protect();
          // 列头：加粗 + 浅灰背景
          var headerStyle = new GC.Spread.Sheets.Style();
          headerStyle.fontWeight = 'bold';
          headerStyle.backColor = '#f5f7fa';
          headerStyle.locked = true;
          var headers = ['类别', '名称', '单位', '数值'];
          for (var c = 0; c < headers.length; c++) {
            sheet.setValue(0, c, headers[c]);
            sheet.setStyle(0, c, headerStyle);
          }
          sheet.setValue(1, 0, '能源'); sheet.setValue(1, 1, '电力消耗'); sheet.setValue(1, 2, 'kWh');
          sheet.setValue(2, 0, '原材料'); sheet.setValue(2, 1, '针状焦投入'); sheet.setValue(2, 2, '吨');
          sheet.setColumnWidth(0, 90);
          sheet.setColumnWidth(1, 180);
          sheet.setColumnWidth(2, 80);
          sheet.setColumnWidth(3, 120);
          if (typeof sheet.setRowCount === 'function') sheet.setRowCount(20);
        });
      }
    },
    watch: {
      selectedTemplateCode: function () {
        if (this.currentRole === 'L3_OPERATOR') this.initSpreadForTemplate();
      }
    },
    mounted: function () {
      if (this.currentRole === 'L3_OPERATOR') this.initSpreadForTemplate();
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
