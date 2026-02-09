/**
 * 运营端 Mock：订单→任务→报告 共用同一套 taskId/orderNo，与 js/mockTasks.js 的 MOCK_TASK_MAP 对齐。
 * 报告 taskNo = 任务 taskId；仅「待归档/已归档」阶段任务在报告列表中存在对应记录。
 */
(function (global) {
    // 与 mockTasks.js MOCK_TASK_MAP 一致的任务号；报告仅包含 stageIndex 4 或 5 的 taskId
    var MOCK_REPORTS = [
        {
            taskNo: 'TSK-2025-101',
            orderNo: 'ORD-20250315-099',
            productName: '热轧卷板',
            supplierName: '南京钢铁集团',
            verifier: 'SGS 通标',
            status: 'archived',
            archiveTime: '2026-02-06 14:05:22',
            appeal: { reason: '核算边界与合同约定不一致，申请重新核查。', submitTime: '2026-02-08 10:00' },
            docs: {
                calc: { name: '核算报告_V2.pdf', ver: 'V2', date: '2026-02-05' },
                verify: { name: '核查报告_Final.pdf', ver: 'V1', date: '2026-02-06' },
                cert: { name: '核查声明.jpg', ver: 'V1', expire: '2027-02-06' }
            },
            history: [
                { title: '归档上链成功', desc: '操作人: 管理员', timestamp: '2026-02-06 14:05', type: 'success' },
                { title: '证书已同步', desc: '来源: SGS 业务接口', timestamp: '2026-02-06 14:00', type: 'primary' },
                { title: '核查通过', desc: '核查报告已生成', timestamp: '2026-02-06 13:55', type: 'primary' },
                { title: '核算报告定稿', desc: '版本 V2', timestamp: '2026-02-05 16:30', type: 'info' }
            ]
        },
        {
            taskNo: 'TSK-2025-999',
            orderNo: 'ORD-20251212-015',
            productName: '汽车结构钢',
            supplierName: '马钢股份',
            verifier: 'DNV',
            status: 'process',
            docs: {
                calc: { name: '汽车结构钢核算报告_V1.pdf', ver: 'V1', date: '2026-02-05' },
                verify: null,
                cert: null
            },
            history: [
                { title: '核算报告生成', desc: '推送给核查方', timestamp: '2026-02-05 15:00', type: 'info' }
            ]
        },
        {
            taskNo: 'TSK-2026-888',
            orderNo: 'ORD-20260203-001',
            productName: '超高功率石墨电极',
            supplierName: '南通碳素有限公司',
            verifier: 'TUV 莱茵',
            status: 'revoked',
            docs: {
                calc: { name: 'Report.pdf', ver: 'V1', date: '2025-12-12' },
                verify: null,
                cert: null
            },
            history: [
                { title: '已作废', desc: '发现数据造假，人工撤销', timestamp: '2025-12-13 09:00', type: 'danger' }
            ]
        }
    ];

    global.MOCK_REPORTS = MOCK_REPORTS;
})(typeof window !== 'undefined' ? window : this);
