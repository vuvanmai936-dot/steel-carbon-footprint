/**
 * 供应商工作台统一布局：与 operator layout.js 技术栈一致，提供侧栏菜单、顶栏、返回门户与 runSupplierApp。
 * 依赖：Vue 3、Element Plus、@element-plus/icons-vue、element-plus/dist/locale/zh-cn.js
 */
(function (global) {
  const { createApp, ref, reactive, computed, watch } = Vue;

  function findActiveMenuId(menuConfig, path) {
    for (const item of menuConfig) {
      if (item.path && item.path === path) return item.id;
      if (item.children) {
        for (const c of item.children) {
          if (c.path === path) return c.id;
        }
      }
    }
    return '';
  }

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

      const sidebarCollapsed = ref(false);
      const toggleSidebar = () => {
        sidebarCollapsed.value = !sidebarCollapsed.value;
      };

      const path =
        typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '';
      const activeMenuId = ref(findActiveMenuId(menuConfig, path));

      /** 一级入口页（仅这些页顶栏展示「返回门户」） */
      const SUPPLIER_PORTAL_PAGES = [
        'dashboard.html', 'task_list.html', 'order_list.html', 'reports.html',
        'identity.html', 'market.html', 'help.html',
      ];
      const showPortalInHeader = computed(function () {
        var base = path && path.endsWith('.html') ? path : (path || '') + '.html';
        return SUPPLIER_PORTAL_PAGES.indexOf(base) !== -1 || SUPPLIER_PORTAL_PAGES.indexOf(path) !== -1;
      });

      const openPage = (pagePath) => {
        const current = window.location.pathname.split('/').pop();
        if (current !== pagePath) {
          window.location.href = pagePath;
        }
      };

      const goPortal = () => {
        window.location.href = '../pcf.html';
      };

      // 消息中心（与 layout.js 一致；依赖 mockMessages.js）
      const hasMessageAPI =
        typeof getMyMessages === 'function' && typeof getUnreadCount === 'function';
      const messageCenterVisible = ref(false);
      const messageList = ref([]);
      const messageUnreadCount = computed(function () {
        return hasMessageAPI ? getUnreadCount(currentUser.name || 'supplier', 'supplier') : 0;
      });
      const loadMessages = function () {
        messageList.value = hasMessageAPI
          ? getMyMessages(currentUser.name || 'supplier', {}, 'supplier')
          : [];
      };
      const goMessage = function (m) {
        if (m && m.jumpUrl) window.location.href = m.jumpUrl;
      };
      const formatMessageTime = function (iso) {
        if (!iso) return '';
        var d = new Date(iso);
        var now = new Date();
        var diff = (now - d) / 60000;
        if (diff < 1) return '刚刚';
        if (diff < 60) return Math.floor(diff) + '分钟前';
        if (diff < 1440) return Math.floor(diff / 60) + '小时前';
        if (diff < 43200) return Math.floor(diff / 1440) + '天前';
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      };
      watch(messageCenterVisible, function (v) {
        if (v) loadMessages();
      });

      return {
        menuConfig,
        currentUser,
        goPortal,
        showPortalInHeader,
        openPage,
        sidebarCollapsed,
        toggleSidebar,
        activeMenuId,
        messageCenterVisible,
        messageList,
        messageUnreadCount,
        loadMessages,
        goMessage,
        formatMessageTime,
      };
    },
  };

  function initSupplierApp(app) {
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

  /** 供应商端统一启动：创建 Vue 应用、注册 Element Plus 与图标、挂载 #app */
  function runSupplierApp(component) {
    const app = createApp(component);
    initSupplierApp(app).mount('#app');
  }

  global.SupplierLayout = SupplierLayout;
  global.runSupplierApp = runSupplierApp;
})(typeof window !== 'undefined' ? window : this);
