/**
 * 供应商工作台统一布局：与 operator layout.js 技术栈一致，提供侧栏菜单、顶栏、返回门户与 runSupplierApp。
 * 依赖：Vue 3、Element Plus、@element-plus/icons-vue、element-plus/dist/locale/zh-cn.js
 */
(function (global) {
  const { createApp, ref, reactive } = Vue;

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
