// js/layout.js
const { createApp, ref, reactive, computed } = Vue;

const SharedLayout = {
    setup() {
        const menuConfig = [
            { id: '1', title: '运营驾驶舱', icon: 'Odometer', path: 'dashboard.html' },
            { id: '2', title: '订单管理', icon: 'Tickets', path: 'order.html' },
            { id: '3', title: '任务管理', icon: 'List', path: 'task_list.html' },
            { id: '4', title: '报告管理', icon: 'DocumentChecked', path: 'report_mgt.html' },
            { id: '5', title: '供应商管理', icon: 'OfficeBuilding', path: 'supplier_mgt.html' },
            { id: '6', title: '核查机构管理', icon: 'Stamp', path: 'certifier_mgt.html' },
            { id: '7', title: '模板中心', icon: 'Files', path: 'templates_mgt.html' },
            
            // === 新增模块：碳数据资产 ===
            // 建议放在结算中心之前，作为资产准备环节
            { id: '10', title: '碳数据资产', icon: 'Coin', path: 'assets_bridge.html' },
            
            { id: '8', title: '结算中心', icon: 'Wallet', path: 'settlement.html' },
            { id: '9', title: '系统管理', icon: 'Setting', path: 'system_mgt.html' }
        ];

        // 模拟当前用户信息
        const currentUser = reactive({
            name: 'Admin_001',
            role: '中心运营管理员'
        });

        // 通用跳转函数 (补全此方法以支持新页面的侧边栏点击)
        const openPage = (path) => {
            const current = window.location.pathname.split('/').pop();
            if (current !== path) {
                window.location.href = path;
            }
        };

        const handleLogout = () => {
            window.location.href = '../index.html';
        };

        return { menuConfig, currentUser, handleLogout, openPage };
    }
};

// 注册全局组件逻辑
function initApp(app) {
    app.use(ElementPlus);
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component);
    }
    return app;
}