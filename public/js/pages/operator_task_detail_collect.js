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
  var currentStage = 'collect';
  var currentRole = window.TaskDetailLayout.getCurrentRole();
  var stageSteps = window.TaskDetailLayout.getStageSteps(taskId, currentStage, {
    basePath: 'operator',
    fromOrder: (typeof getFromParam === 'function' && getFromParam() === 'order')
  });
  var taskRow = typeof getTaskByTaskId === 'function' ? getTaskByTaskId(taskId, 1) : null;

  // 初始台账数据（用于初始化 SpreadJS）
  var initialRows = [
    { category: '能源', item: '电力消耗', unit: 'kWh', guide: '请提供电费单', value: '27200.32', remark: '' },
    { category: '原材料', item: '针状焦投入', unit: '吨', guide: '', value: '500.00', remark: '' },
    { category: '能源', item: '天然气', unit: 'm³', guide: '', value: '6046.00', remark: '' }
  ];

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
        spread: null,
        evidenceFileList: [],
        rightPanelLogs: [
          { time: '09:30', content: '配置下发' },
          { time: '10:00', content: '待供应商填报' }
        ],
        rejectDialogVisible: false,
        rejectForm: { targetType: 'data', desc: '' },
        submitLoading: false,
        auditLoading: false,
        rejectLoading: false
      };
    },
    computed: {
      activeStepIndex: function () {
        var idx = this.stageSteps.findIndex(function (s) { return s.key === this.currentStage; }.bind(this));
        return idx >= 0 ? idx : 0;
      },
      stageStatusText: function () {
        var base = (this.taskRow && typeof getStageStatusText === 'function')
          ? getStageStatusText(this.taskRow) : '';
        if (base) return base;
        if (this.currentRole === 'L3_OPERATOR') return '审核中';
        if (this.currentRole === 'L2_SUPPLIER') return '待提交';
        return '只读查看';
      }
    },
    methods: {
      goBack: function () {
        window.location.href =
          (typeof getFromParam !== 'undefined' && getFromParam() === 'order')
            ? 'order.html'
            : 'self_operated_task_list.html';
      },
      goStage: function (step) {
        if (step && step.key !== this.currentStage && step.href) {
          window.location.href = step.href;
        }
      },
      viewOrder: function () { window.location.href = 'order.html'; },
      viewSupplier: function () { window.location.href = 'supplier_mgt_detail.html'; },

      openRejectDialog: function () { this.rejectDialogVisible = true; },
      submitReject: function () {
        var self = this;
        this.rejectLoading = true;
        setTimeout(function () {
          self.rejectDialogVisible = false;
          self.rightPanelLogs.push({
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            content: '已驳回要求整改：' + (self.rejectForm.desc || '(无)' )
          });
          ElementPlus.ElMessage.success('已驳回，已通知供应商');
          self.rejectLoading = false;
        }, 300);
      },
      passAudit: function () {
        var self = this;
        ElementPlus.ElMessageBox.confirm('确认数据无误？').then(function () {
          self.auditLoading = true;
          ElementPlus.ElMessage.success('审核通过，可进入 LCA 计算');
          window.location.href =
            'task_detail_lca.html?taskId=' +
            encodeURIComponent(taskId) +
            (typeof getFromParam === 'function' && getFromParam() === 'order' ? '&from=order' : '');
        }).catch(function () {}).finally(function () {
          self.auditLoading = false;
        });
      },

      onEvidenceChange: function (file, list) {
        this.evidenceFileList = list || [];
      },

      saveDraft: function () {
        ElementPlus.ElMessage.success('草稿已保存');
      },

      submitData: function () {
        if (!this.spread || !window.GC || !GC.Spread || !GC.Spread.Sheets) {
          ElementPlus.ElMessage.error('表格尚未初始化，无法提交');
          return;
        }
        var self = this;
        self.submitLoading = true;
        var loading = ElementPlus.ElLoading.service({ text: '正在提交数据...', fullscreen: true });
        var json = this.spread.toJSON();
        var evidences = (this.evidenceFileList || []).map(function (f) {
          return { name: f.name, url: f.url || '' };
        });
        var payload = {
          taskId: taskId,
          workbook: json,
          evidences: evidences
        };
        console.log('SUBMIT_PAYLOAD', payload);
        setTimeout(function () {
          loading.close();
          ElementPlus.ElMessage.success('已触发数据提交与真实性声明数字合约');
          self.rightPanelLogs.push({
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            content: '供应商已提交数据（含表格与凭证绑定）'
          });
          self.submitLoading = false;
        }, 600);
      },

      downloadExcel: function () {
        if (!this.spread) {
          ElementPlus.ElMessage.error('表格尚未初始化');
          return;
        }
        var json = this.spread.toJSON();
        console.log('DOWNLOAD_EXCEL_JSON', json);
        ElementPlus.ElMessage.info('模拟下载填报数据 (Excel)');
      },

      downloadOriginal: function () {
        ElementPlus.ElMessage.info('模拟下载原始填报数据（仅在受控环境中可用）');
      },

      initSpread: function () {
        var self = this;
        this.$nextTick(function () {
          var host = document.getElementById('ss');
          if (!host || !window.GC || !GC.Spread || !GC.Spread.Sheets) {
            ElementPlus.ElMessage.error('表格加载失败，请刷新页面或联系管理员');
            console.warn('SpreadJS 未加载或容器不存在');
            return;
          }
          var spread = SpreadUtils.createWorkbook(host);
          self.spread = spread;
          var sheet = spread.getActiveSheet();
          spread.options.tabStripVisible = false;
          spread.options.newTabVisible = false;

          var headers = ['类别', '名称', '单位', '填报指引', '数值', '备注'];
          for (var c = 0; c < headers.length; c++) {
            sheet.setValue(0, c, headers[c]);
          }
          var rows = initialRows || [];
          for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            sheet.setValue(r + 1, 0, row.category || '');
            sheet.setValue(r + 1, 1, row.item || '');
            sheet.setValue(r + 1, 2, row.unit || '');
            sheet.setValue(r + 1, 3, row.guide || '');
            sheet.setValue(r + 1, 4, row.value || '');
            sheet.setValue(r + 1, 5, row.remark || '');
          }
          sheet.setColumnWidth(0, 90);
          sheet.setColumnWidth(1, 140);
          sheet.setColumnWidth(2, 70);
          sheet.setColumnWidth(3, 180);
          sheet.setColumnWidth(4, 100);
          sheet.setColumnWidth(5, 120);

          if (self.currentRole === 'L3_OPERATOR' || self.currentRole === 'L4_CERTIFIER') {
            if (sheet.options) sheet.options.isProtected = true;
            if (typeof sheet.protect === 'function') sheet.protect();
          } else if (self.currentRole === 'L2_SUPPLIER') {
            if (sheet.options) sheet.options.isProtected = false;
            if (typeof sheet.unprotect === 'function') sheet.unprotect();
          }
        });
      }
    },
    mounted: function () {
      if (window.TaskDetailLayout && typeof window.TaskDetailLayout.initRightPanel === 'function') {
        window.TaskDetailLayout.initRightPanel('task-detail-right-panel', { taskId: taskId, role: this.currentRole });
      }
      this.initSpread();
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
