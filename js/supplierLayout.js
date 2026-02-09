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
                { id: '1', title: '工作台', icon: 'Odometer', path: 'dashboard.html' },
                { id: '2', title: '待办任务', icon: 'List', path: 'task_list.html' },
                { id: '3', title: '我的报告', icon: 'DocumentChecked', path: 'reports.html' },
                { id: '4', title: '身份认证', icon: 'User', path: 'identity.html' },
                { id: '5', title: '市场', icon: 'Goods', path: 'market.html' }
            ];

            const currentUser = reactive({
                name: '供应商账号',
                role: '供应商 (L2)'
            });

            const sidebarCollapsed = ref(false);
            const toggleSidebar = () => {
                sidebarCollapsed.value = !sidebarCollapsed.value;
            };

            const path = typeof window !== 'undefined' ? (window.location.pathname.split('/').pop() || '') : '';
            const activeMenuId = ref(findActiveMenuId(menuConfig, path));

            const openPage = (pagePath) => {
                const current = window.location.pathname.split('/').pop();
                if (current !== pagePath) {
                    window.location.href = pagePath;
                }
            };

            const goPortal = () => {
                window.location.href = '../index.html';
            };

            return {
                menuConfig,
                currentUser,
                goPortal,
                openPage,
                sidebarCollapsed,
                toggleSidebar,
                activeMenuId
            };
        }
    };

    function initSupplierApp(app) {
        const localeOpt = typeof ElementPlusLocaleZhCn !== 'undefined' ? { locale: ElementPlusLocaleZhCn } : {};
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
