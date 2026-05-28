/* eslint-disable */
(function () {
const { menuConfig, currentUser, openPage, sidebarCollapsed, toggleSidebar, activeMenuId, goPortal, showPortalInHeader, messageCenterVisible, messageList, messageUnreadCount, goMessage, formatMessageTime } = SharedLayout.setup();

    runOperatorApp({
        setup() {
            const query = Vue.reactive({ orderNo: '', company: '', orderStatus: '' });
            const drawerVisible = Vue.ref(false);
            const currentOrder = Vue.ref(null);
            const assignDialogVisible = Vue.ref(false);
            const assignForm = Vue.reactive({ taskType: 'self', entrustedParty: '' });
            const currentAssignOrder = Vue.ref(null);

            // Mock Data (5条)，协议统一为 3 个
            const defaultContracts = (signDate) => [
                { name: 'XX公司--保密协议.docx', signDate },
                { name: 'XX公司--《廉洁合作协议》.docx', signDate },
                { name: 'XX公司--上游两方合作协议.docx', signDate }
            ];
            const rawOrderList = [
                {
                    orderNo: 'ORD-20260203-001',
                    certifier: 'SGS通标标准技术服务',
                    basic: { serviceName: '钢铁产品碳足迹核算服务(L3)', createTime: '2026-02-03 09:30:00' },
                    products: [
                        { name: '超高功率石墨电极', specs: 'Φ600mm', quantity: '2000吨', skuId: 'SKU_1001' },
                        { name: '普通功率石墨电极', specs: 'Φ400mm', quantity: '500吨', skuId: 'SKU_1002' },
                        { name: '超高功率石墨电极接头', specs: 'T4L', quantity: '1000个', skuId: 'SKU_1003' }
                    ],
                    subTasks: [
                        { taskId: 'TSK-2026-888', productName: '超高功率石墨电极', status: '核查认证', progress: 80, stageIndex: 3 },
                        { taskId: 'TSK-2026-889', productName: '普通功率石墨电极', status: '数据采集', progress: 10, stageIndex: 1 },
                        { taskId: 'TSK-2026-890', productName: '超高功率石墨电极接头', status: '待配置', progress: 0, stageIndex: 0 }
                    ],
                    buyer: { company: 'XX 耐火材料有限公司', name: '张总监', phone: '13800001111' },
                    bizContact: { name: '李工 (生产部)', phone: '13912345678', email: 'ligong@nangang.com' },
                    payment: { amount: '50,000.00', status: '已支付', ratio: '100%', payTime: '2026-02-03 10:15:22', payDate: '2026-02-03' },
                    invoice: { fileName: '电子发票_002931.pdf', file: '#' },
                    contracts: defaultContracts('2026-02-03'),
                    orderStatus: 'CONFIRMED'
                },
                {
                    orderNo: 'ORD-20250315-099',
                    certifier: 'TUV莱茵',
                    basic: { serviceName: '钢铁产品碳足迹核算服务(L3)', createTime: '2025-03-15 14:00:00' },
                    products: [ { name: '热轧卷板', specs: 'Q235B 5.0mm', quantity: '5000吨', skuId: 'SKU_2005' } ],
                    subTasks: [ { taskId: 'TSK-2025-101', productName: '热轧卷板', status: '完成', progress: 100, stageIndex: 4, reportSubStatus: 'to_archive' } ],
                    buyer: { company: '南京钢铁集团', name: '王部长', phone: '13900002222' },
                    bizContact: { name: '赵工', phone: '15912345678', email: 'zhao@nangang.com' },
                    payment: { amount: '30,000.00', status: '已支付', ratio: '100%', payTime: '2025-03-15 14:20:00', payDate: '2025-03-15' },
                    invoice: { fileName: '电子发票_001122.pdf' },
                    contracts: defaultContracts('2025-03-15'),
                    orderStatus: 'COMPLETED'
                },
                {
                    orderNo: 'ORD-20260205-002',
                    certifier: 'CQC中国质量认证中心',
                    basic: { serviceName: '钢铁产品碳足迹核算服务(L3)', createTime: '2026-02-05 11:30:00' },
                    products: [ { name: 'HRB400E 螺纹钢', specs: 'Φ22mm', quantity: '10000吨', skuId: 'SKU_3001' } ],
                    subTasks: [ { taskId: 'TSK-2026-892', productName: 'HRB400E 螺纹钢', status: '待配置', progress: 0, stageIndex: 0 } ],
                    buyer: { company: '沙钢集团', name: '刘经理', phone: '13700001234' },
                    bizContact: { name: '钱工', phone: '13900005678', email: 'qian@shagang.com' },
                    payment: { amount: '80,000.00', status: '已支付', ratio: '100%', payTime: '2026-02-05 11:45:00', payDate: '2026-02-05' },
                    invoice: { fileName: '电子发票_003344.pdf' },
                    contracts: defaultContracts('2026-02-05'),
                    orderStatus: 'PAID'
                },
                {
                    orderNo: 'ORD-20260110-008',
                    certifier: 'SGS通标标准技术服务',
                    basic: { serviceName: '钢铁产品碳足迹核算服务(L3)', createTime: '2026-01-10 09:00:00' },
                    products: [ { name: '中厚板', specs: 'Q345B 20mm', quantity: '3000吨', skuId: 'SKU_4002' } ],
                    subTasks: [ { taskId: 'TSK-2026-870', productName: '中厚板', status: 'LCA计算', progress: 45, stageIndex: 2 } ],
                    buyer: { company: '宝钢股份', name: '陈主任', phone: '13600009876' },
                    bizContact: { name: '孙工', phone: '13800004321', email: 'sun@baosteel.com' },
                    payment: { amount: '45,000.00', status: '已支付', ratio: '100%', payTime: '2026-01-10 09:30:00', payDate: '2026-01-10' },
                    invoice: { fileName: '电子发票_005566.pdf' },
                    contracts: defaultContracts('2026-01-10'),
                    orderStatus: 'CONFIRMED'
                },
                {
                    orderNo: 'ORD-20251212-015',
                    certifier: 'TUV莱茵',
                    basic: { serviceName: '钢铁产品碳足迹核算服务(L3)', createTime: '2025-12-12 10:00:00' },
                    products: [ { name: '汽车结构钢', specs: 'SAPH440', quantity: '2000吨', skuId: 'SKU_5005' } ],
                    subTasks: [ { taskId: 'TSK-2025-999', productName: '汽车结构钢', status: '核查认证', progress: 80, stageIndex: 3 } ],
                    buyer: { company: '马钢股份', name: '周经理', phone: '13500001122' },
                    bizContact: { name: '吴工', phone: '13700003344', email: 'wu@magang.com' },
                    payment: { amount: '60,000.00', status: '已支付', ratio: '100%', payTime: '2025-12-12 10:30:00', payDate: '2025-12-12' },
                    invoice: { fileName: '电子发票_007788.pdf' },
                    contracts: defaultContracts('2025-12-12'),
                    orderStatus: 'CONFIRMED'
                },
                {
                    orderNo: 'ORD-20251101-088',
                    certifier: 'SGS通标',
                    basic: { serviceName: '钢铁产品碳足迹核算服务(L3)', createTime: '2025-11-01 08:00:00' },
                    products: [ { name: '冷轧板卷', specs: 'SPCC 1.0mm', quantity: '1500吨', skuId: 'SKU_6001' } ],
                    subTasks: [ { taskId: 'TSK-2025-777', productName: '冷轧板卷', status: '完成', progress: 100, stageIndex: 4, reportSubStatus: 'revoked' } ],
                    buyer: { company: '某钢材贸易公司', name: '郑经理', phone: '13400005555' },
                    bizContact: { name: '林工', phone: '13600006666', email: 'lin@example.com' },
                    payment: { amount: '22,000.00', status: '已支付', ratio: '100%', payTime: '2025-11-01 09:00:00', payDate: '2025-11-01' },
                    invoice: { fileName: '电子发票_008899.pdf' },
                    contracts: defaultContracts('2025-11-01'),
                    orderStatus: 'REVOKED'
                }
            ];

            // 核心计算逻辑：加工字段 + 按订单状态筛选
            const processedOrderList = Vue.computed(() => {
                let list = rawOrderList.map(order => {
                    const payDate = dayjs(order.payment.payDate);
                    const deadline = payDate.add(1, 'year');
                    const isExpiring = deadline.diff(dayjs(), 'day') < 30;

                    const totalProgress = order.subTasks.reduce((acc, t) => acc + t.progress, 0);
                    const avgProgress = order.subTasks.length ? Math.floor(totalProgress / order.subTasks.length) : 0;
                    const completedTasks = order.subTasks.filter(t => t.progress === 100).length;

                    return {
                        ...order,
                        orderStatus: order.orderStatus || 'CONFIRMED',
                        serviceStart: payDate.format('YYYY-MM-DD'),
                        serviceDeadline: deadline.format('YYYY-MM-DD'),
                        isExpiring,
                        avgProgress,
                        completedTasks
                    };
                });
                if (query.orderStatus) {
                    list = list.filter(o => o.orderStatus === query.orderStatus);
                }
                if (query.orderNo) {
                    list = list.filter(o => (o.orderNo || '').toLowerCase().includes((query.orderNo || '').toLowerCase()));
                }
                if (query.company) {
                    list = list.filter(o => (o.buyer?.company || '').toLowerCase().includes((query.company || '').toLowerCase()));
                }
                return list;
            });

            const getOrderStatusType = (status) => ({ UNPAID: 'info', PAID: 'warning', CONFIRMED: 'primary', COMPLETED: 'success', REVOKED: 'danger' }[status] || 'info');
            const getOrderStatusLabel = (status) => ({ UNPAID: '待支付', PAID: '已支付', CONFIRMED: '已确认', COMPLETED: '已完成', REVOKED: '已作废' }[status] || status);

            // 阶段 4 子状态展示：待处理/已下发待确认/待归档/已归档/已作废
            const getTaskDisplayLabel = (task) => {
                if (task.stageIndex === 4 && task.reportSubStatus) {
                    const s = task.reportSubStatus;
                    if (s === 'released') return '已下发待确认';
                    if (s === 'to_archive') return '待归档';
                    if (s === 'archived') return '已归档';
                    if (s === 'revoked') return '已作废';
                    return '待处理';
                }
                return task.status || '待配置';
            };

            const getTaskStatusType = (status) => {
                const map = { 
                    '待配置': 'info', 
                    '数据采集': 'primary', 
                    'LCA计算': 'primary', 
                    '核查认证': 'warning', 
                    '完成': 'success',
                    '待处理': 'info',
                    '已下发待确认': 'warning',
                    '待归档': 'primary',
                    '已归档': 'success',
                    '已作废': 'danger'
                };
                return map[status] || 'info';
            };

            const goToTaskWorkspace = (task) => {
                if (task.stageIndex === 4) {
                    window.location.href = `report_detail.html?taskNo=${encodeURIComponent(task.taskId)}&from=order`;
                    return;
                }
                if (task.status === '完成') {
                    window.location.href = 'report_detail.html?taskNo=' + encodeURIComponent(task.taskId) + '&from=order';
                    return;
                }
                let targetPage = 'task_detail_config.html';
                if (task.status === '待配置') targetPage = 'task_detail_config.html';
                else if (task.status === '数据采集') targetPage = 'task_detail_collect.html';
                else if (task.status === 'LCA计算') targetPage = 'task_detail_lca.html';
                else if (task.status === '核查认证') targetPage = 'task_detail_verify.html';
                const q = `?taskId=${task.taskId}&from=order`;
                window.location.href = targetPage + q;
            };

            const goToTaskList = () => window.location.href = 'self_operated_task_list.html';
            const handleSearch = () => ElementPlus.ElMessage.success('列表已刷新');
            const handleReset = () => { query.orderNo = ''; query.company = ''; query.orderStatus = ''; };
            const viewDetail = (row) => { currentOrder.value = row; drawerVisible.value = true; };

            const openAssignDialog = (row) => {
                currentAssignOrder.value = row;
                assignForm.taskType = 'self';
                assignForm.entrustedParty = '';
                assignDialogVisible.value = true;
            };
            const submitAssign = () => {
                if (assignForm.taskType === 'entrusted' && !assignForm.entrustedParty) return;
                const partyText = assignForm.taskType === 'self' ? '自营' : (assignForm.entrustedParty === 'qingong' ? '擎工互联' : '易碳数科');
                const taskCount = currentAssignOrder.value?.subTasks?.length || 0;
                ElementPlus.ElMessage.success({
                    message: `订单已确认，任务类型：${assignForm.taskType === 'self' ? '自营任务' : '委托任务'}${assignForm.taskType === 'entrusted' ? '，委托方：' + partyText : ''}。已生成 ${taskCount} 个子任务，可前往「任务管理」处理。`,
                    duration: 4500
                });
                if (currentAssignOrder.value) currentAssignOrder.value.orderStatus = 'CONFIRMED';
                assignDialogVisible.value = false;
                drawerVisible.value = false;
            };

            return {
                menuConfig, currentUser, openPage, sidebarCollapsed, toggleSidebar, activeMenuId, goPortal, showPortalInHeader,
                query, processedOrderList, drawerVisible, currentOrder,
                assignDialogVisible, assignForm, openAssignDialog, submitAssign,
                getTaskDisplayLabel, getTaskStatusType, getOrderStatusType, getOrderStatusLabel,
                handleSearch, handleReset, viewDetail, goToTaskWorkspace, goToTaskList,
                messageCenterVisible, messageList, messageUnreadCount, goMessage, formatMessageTime
            };
        }
    });
})();
