/**
 * 核查机构端统一布局：与 supplierLayout 技术栈一致，提供侧栏菜单、顶栏、返回门户与 runCertifierApp。
 * 依赖：Vue 3、Element Plus、@element-plus/icons-vue、element-plus/dist/locale/zh-cn.js
 */
(function (global) {
  const { createApp, ref, reactive } = Vue;

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

      const openPage = (pagePath) => {
        const current = window.location.pathname.split('/').pop();
        if (current !== pagePath) {
          window.location.href = pagePath;
        }
      };

      const goPortal = () => {
        window.location.href = '../pcf.html';
      };

      return {
        menuConfig,
        currentUser,
        goPortal,
        openPage,
        sidebarCollapsed,
        toggleSidebar,
        activeMenuId,
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
