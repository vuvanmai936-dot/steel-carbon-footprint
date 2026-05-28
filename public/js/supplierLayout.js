/**
 * 供应商工作台统一布局（依赖 sharedShell.js）
 */
(function (global) {
  const { createApp, ref, reactive, computed, watch } = Vue;
  const shell = typeof SharedShell !== 'undefined' ? SharedShell : null;

  const SupplierLayout = {
    setup() {
      const menuConfig = [
        { id: '1', title: '全局驾驶舱', icon: 'Odometer', path: 'dashboard.html' },
        { id: '2', title: '我的任务', icon: 'List', path: 'task_list.html' },
        { id: '3', title: '我的订单', icon: 'Tickets', path: 'order_list.html' },
        { id: '4', title: '我的碳报告', icon: 'DocumentChecked', path: 'reports.html' },
        { id: '5', title: '企业信息', icon: 'UserFilled', path: 'identity.html' },
        { id: '6', title: '绿色生态市场', icon: 'OfficeBuilding', path: 'market.html' },
        { id: '7', title: '知识库与帮助', icon: 'QuestionFilled', path: 'help.html' },
      ];

      const currentUser = reactive({
        name: '王经理',
        companyName: '江苏某某碳素科技',
        badge: '绿色供应链金牌供应商',
        sidebarCompany: 'XX石墨电极厂',
        sidebarMember: '企业认证会员',
        role: '供应商 (L2)',
        supplierName: '南通碳素有限公司',
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

      const SUPPLIER_PORTAL_PAGES = [
        'dashboard.html',
        'task_list.html',
        'order_list.html',
        'reports.html',
        'identity.html',
        'market.html',
        'help.html',
      ];
      const showPortalInHeader = shell
        ? shell.createPortalVisibility({ computed }, sidebar.path, SUPPLIER_PORTAL_PAGES)
        : computed(() => false);

      const goPortal = () => {
        global.location.href = '../pcf.html';
      };

      const message = shell
        ? shell.createMessageCenter(
            { ref, computed, watch },
            'supplier',
            () => currentUser.name || 'supplier'
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

  function initSupplierApp(app) {
    if (shell) return shell.initElementPlusApp(app);
    const localeOpt =
      typeof ElementPlusLocaleZhCn !== 'undefined' ? { locale: ElementPlusLocaleZhCn } : {};
    app.use(ElementPlus, localeOpt);
    return app;
  }

  function runSupplierApp(component) {
    const app = createApp(component);
    initSupplierApp(app).mount('#app');
  }

  global.SupplierLayout = SupplierLayout;
  global.runSupplierApp = runSupplierApp;
})(typeof window !== 'undefined' ? window : this);
