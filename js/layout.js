// js/layout.js — 运营端布局（依赖 sharedShell.js）
const { createApp, ref, reactive, computed, watch } = Vue;
const shell = typeof SharedShell !== 'undefined' ? SharedShell : null;

const SharedLayout = {
  setup() {
    const menuConfig = [
      { id: '1', title: '运营驾驶舱', icon: 'Odometer', path: 'dashboard.html' },
      { id: '2', title: '订单管理', icon: 'Tickets', path: 'order.html' },
      {
        id: '3',
        title: '任务管理',
        icon: 'List',
        children: [
          { id: '3-1', title: '自营任务', path: 'self_operated_task_list.html' },
          { id: '3-2', title: '委托任务', path: 'entrusted_task_list.html' },
        ],
      },
      { id: '4', title: '报告管理', icon: 'DocumentChecked', path: 'report_mgt.html' },
      { id: '5', title: '供应商管理', icon: 'OfficeBuilding', path: 'supplier_mgt.html' },
      { id: '6', title: '核查机构管理', icon: 'Stamp', path: 'certifier_mgt.html' },
      { id: '7', title: '模板中心', icon: 'Files', path: 'templates_mgt.html' },
      { id: '10', title: '碳数据资产', icon: 'Coin', path: 'assets_bridge.html' },
      { id: '8', title: '结算中心', icon: 'Wallet', path: 'settlement.html' },
      { id: '9', title: '系统管理', icon: 'Setting', path: 'system_mgt.html' },
      { id: '11', title: '知识库与帮助', icon: 'QuestionFilled', path: 'help.html' },
    ];

    const currentUser = reactive({
      name: 'Admin_001',
      role: '中心运营管理员',
    });

    const sidebar = shell
      ? shell.createSidebarState({ ref }, menuConfig)
      : {
          path: window.location.pathname.split('/').pop() || '',
          activeMenuId: ref(''),
          sidebarCollapsed: ref(false),
          toggleSidebar: () => {},
          openPage: () => {},
        };

    const OPERATOR_PORTAL_PAGES = [
      'dashboard.html',
      'order.html',
      'self_operated_task_list.html',
      'entrusted_task_list.html',
      'report_mgt.html',
      'supplier_mgt.html',
      'certifier_mgt.html',
      'templates_mgt.html',
      'assets_bridge.html',
      'settlement.html',
      'system_mgt.html',
      'help.html',
    ];
    const showPortalInHeader = shell
      ? shell.createPortalVisibility({ computed }, sidebar.path, OPERATOR_PORTAL_PAGES)
      : computed(() => false);

    const handleLogout = () => {
      window.location.href = '../index.html';
    };

    const goPortal = () => {
      window.location.href = '../pcf.html';
    };

    const message = shell
      ? shell.createMessageCenter(
          { ref, computed, watch },
          'operator',
          () => currentUser.name || 'operator'
        )
      : {
          messageCenterVisible: ref(false),
          messageList: ref([]),
          messageUnreadCount: computed(() => 0),
          loadMessages: () => {},
          goMessage: () => {},
          formatMessageTime: shell ? shell.formatMessageTime : () => '',
        };

    return {
      menuConfig,
      currentUser,
      handleLogout,
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

function initApp(app) {
  if (shell) return shell.initElementPlusApp(app);
  const localeOpt =
    typeof ElementPlusLocaleZhCn !== 'undefined' ? { locale: ElementPlusLocaleZhCn } : {};
  app.use(ElementPlus, localeOpt);
  if (typeof ElementPlusIconsVue !== 'undefined') {
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component);
    }
  }
  return app;
}

function runOperatorApp(component) {
  const app = createApp(component);
  initApp(app).mount('#app');
}

if (typeof window !== 'undefined') {
  window.SharedLayout = SharedLayout;
  window.runOperatorApp = runOperatorApp;
}
