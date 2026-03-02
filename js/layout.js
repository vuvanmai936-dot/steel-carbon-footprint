// js/layout.js
const { createApp, ref, reactive, computed } = Vue;

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
                    { id: '3-2', title: '委托任务', path: 'entrusted_task_list.html' }
                ]
            },
            { id: '4', title: '报告管理', icon: 'DocumentChecked', path: 'report_mgt.html' },
            { id: '5', title: '供应商管理', icon: 'OfficeBuilding', path: 'supplier_mgt.html' },
            { id: '6', title: '核查机构管理', icon: 'Stamp', path: 'certifier_mgt.html' },
            { id: '7', title: '模板中心', icon: 'Files', path: 'templates_mgt.html' },
            { id: '10', title: '碳数据资产', icon: 'Coin', path: 'assets_bridge.html' },
            { id: '8', title: '结算中心', icon: 'Wallet', path: 'settlement.html' },
            { id: '9', title: '系统管理', icon: 'Setting', path: 'system_mgt.html' }
        ];

        const currentUser = reactive({
            name: 'Admin_001',
            role: '中心运营管理员'
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

        const handleLogout = () => {
            window.location.href = '../index.html';
        };

        return {
            menuConfig,
            currentUser,
            handleLogout,
            openPage,
            sidebarCollapsed,
            toggleSidebar,
            activeMenuId
        };
    }
};

// 注册全局组件逻辑（若页面已加载 ElementPlusLocaleZhCn 则自动使用中文）
function initApp(app) {
    const localeOpt = typeof ElementPlusLocaleZhCn !== 'undefined' ? { locale: ElementPlusLocaleZhCn } : {};
    app.use(ElementPlus, localeOpt);
    if (typeof ElementPlusIconsVue !== 'undefined') {
        for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
            app.component(key, component);
        }
    }
    return app;
}

/** 运营端统一启动：创建 Vue 应用、注册 Element Plus 与图标、挂载 #app */
function runOperatorApp(component) {
    const app = createApp(component);
    initApp(app).mount('#app');
}
