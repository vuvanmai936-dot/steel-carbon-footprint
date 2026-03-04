/**
 * 核查机构端统一布局：与 supplierLayout 技术栈一致，提供侧栏菜单、顶栏、返回门户与 runCertifierApp。
 * 依赖：Vue 3、Element Plus、@element-plus/icons-vue、element-plus/dist/locale/zh-cn.js
 */
(function (global) {
  const { createApp, ref, reactive, computed, watch } = Vue;

  function findActiveMenuId(menuConfig, path) {
    for (const item of menuConfig) {
      if (item.path && item.path === path) return item.id;
      if (item.match && item.match.indexOf(path) !== -1) return item.id;
      if (item.children) {
        for (const c of item.children) {
          if (c.path === path) return c.id;
          if (c.match && c.match.indexOf(path) !== -1) return c.id;
        }
      }
    }
    return '';
  }

  const CertifierLayout = {
    setup() {
      const menuConfig = [
        { id: '1', title: '核查仪表盘', icon: 'DataAnalysis', path: 'dashboard.html' },
        {
          id: '2',
          title: '核查任务列表',
          icon: 'List',
          path: 'task_list.html',
          match: ['task_detail.html'],
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

      const sidebarCollapsed = ref(false);
      const toggleSidebar = () => {
        sidebarCollapsed.value = !sidebarCollapsed.value;
      };

      const path =
        typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '';
      const activeMenuId = ref(findActiveMenuId(menuConfig, path));

      /** 一级入口页（仅这些页顶栏展示「返回门户」） */
      const CERTIFIER_PORTAL_PAGES = [
        'dashboard.html', 'task_list.html', 'certificates.html', 'settlement.html',
        'admin.html', 'help.html',
      ];
      const showPortalInHeader = computed(function () {
        var base = path && path.endsWith('.html') ? path : (path || '') + '.html';
        return CERTIFIER_PORTAL_PAGES.indexOf(base) !== -1 || CERTIFIER_PORTAL_PAGES.indexOf(path) !== -1;
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
        return hasMessageAPI ? getUnreadCount(currentUser.name || 'certifier', 'certifier') : 0;
      });
      const loadMessages = function () {
        messageList.value = hasMessageAPI
          ? getMyMessages(currentUser.name || 'certifier', {}, 'certifier')
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

  function initCertifierApp(app) {
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

  /** 核查机构端统一启动：创建 Vue 应用、注册 Element Plus 与图标、挂载 #app */
  function runCertifierApp(component) {
    const app = createApp(component);
    initCertifierApp(app).mount('#app');
  }

  global.CertifierLayout = CertifierLayout;
  global.runCertifierApp = runCertifierApp;
})(typeof window !== 'undefined' ? window : this);
