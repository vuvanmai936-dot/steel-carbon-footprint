/**
 * 核查机构端统一布局（依赖 sharedShell.js）
 */
(function (global) {
  const { createApp, ref, reactive, computed, watch } = Vue;
  const shell = typeof SharedShell !== 'undefined' ? SharedShell : null;

  const CertifierLayout = {
    setup() {
      const menuConfig = [
        { id: '1', title: '核查仪表盘', icon: 'DataAnalysis', path: 'dashboard.html' },
        {
          id: '2',
          title: '核查任务列表',
          icon: 'List',
          path: 'task_list.html',
          match: ['task_detail.html', 'task_detail_verify.html', 'task_detail_certify.html'],
        },
        { id: '3', title: '证书颁发管理', icon: 'Medal', path: 'certificates.html' },
        { id: '4', title: '结算中心', icon: 'Money', path: 'settlement.html' },
        { id: '5', title: '机构管理', icon: 'Setting', path: 'admin.html' },
        { id: '6', title: '知识库与帮助', icon: 'QuestionFilled', path: 'help.html' },
      ];

      const currentUser = reactive({
        name: '张核查',
        role: 'SGS 高级审核员',
      });

      const sidebar = shell
        ? shell.createSidebarState({ ref }, menuConfig)
        : {
            path: '',
            activeMenuId: ref(''),
            sidebarCollapsed: ref(false),
            toggleSidebar: () => {},
            openPage: () => {},
          };

      const CERTIFIER_PORTAL_PAGES = [
        'dashboard.html',
        'task_list.html',
        'certificates.html',
        'settlement.html',
        'admin.html',
        'help.html',
      ];
      const showPortalInHeader = shell
        ? shell.createPortalVisibility({ computed }, sidebar.path, CERTIFIER_PORTAL_PAGES)
        : computed(() => false);

      const goPortal = () => {
        global.location.href = '../pcf.html';
      };

      const message = shell
        ? shell.createMessageCenter(
            { ref, computed, watch },
            'certifier',
            () => currentUser.name || 'certifier'
          )
        : {
            messageCenterVisible: ref(false),
            messageList: ref([]),
            messageUnreadCount: computed(() => 0),
            loadMessages: () => {},
            goMessage: () => {},
            formatMessageTime: () => '',
          };

      return {
        menuConfig,
        currentUser,
        goPortal,
        showPortalInHeader,
        openPage: sidebar.openPage,
        sidebarCollapsed: sidebar.sidebarCollapsed,
        toggleSidebar: sidebar.toggleSidebar,
        activeMenuId: sidebar.activeMenuId,
        messageCenterVisible: message.messageCenterVisible,
        messageList: message.messageList,
        messageUnreadCount: message.messageUnreadCount,
        loadMessages: message.loadMessages,
        goMessage: message.goMessage,
        formatMessageTime: message.formatMessageTime,
      };
    },
  };

  function initCertifierApp(app) {
    if (shell) return shell.initElementPlusApp(app);
    const localeOpt =
      typeof ElementPlusLocaleZhCn !== 'undefined' ? { locale: ElementPlusLocaleZhCn } : {};
    app.use(ElementPlus, localeOpt);
    return app;
  }

  function runCertifierApp(component) {
    const app = createApp(component);
    initCertifierApp(app).mount('#app');
  }

  global.CertifierLayout = CertifierLayout;
  global.runCertifierApp = runCertifierApp;
})(typeof window !== 'undefined' ? window : this);
