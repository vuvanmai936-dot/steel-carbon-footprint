/**
 * 运营端 Mock：订单→任务→报告 共用同一套 taskId/orderNo，与 js/mockTasks.js 的 MOCK_TASK_MAP 对齐。
 * 报告 taskNo = 任务 taskId；仅「待归档/已归档」阶段任务在报告列表中存在对应记录。
 * 报告管理页使用 getReportList() 获取同一引用，下发/确认接收/申诉均直接修改 MOCK_REPORTS，与供应商端闭环。
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
            reportVersion: 'sealed',
            releasedToSupplier: true,
            received: true,
            archiveTime: '2026-02-06 14:05:22',
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
            reportVersion: 'draft',
            releasedToSupplier: false,
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
            reportVersion: 'sealed',
            releasedToSupplier: false,
            docs: {
                calc: { name: 'Report.pdf', ver: 'V1', date: '2025-12-12' },
                verify: null,
                cert: null
            },
            history: [
                { title: '已作废', desc: '发现数据造假，人工撤销', timestamp: '2025-12-13 09:00', type: 'danger' }
            ]
        },
        {
            taskNo: 'TSK-2026-889',
            orderNo: 'ORD-20260203-001',
            productName: '普通功率石墨电极',
            supplierName: '南通碳素有限公司',
            verifier: 'DNV',
            status: 'process',
            reportVersion: 'sealed',
            releasedToSupplier: true,
            received: false,
            appeal: { reason: '核算边界与产品规格说明不一致，申请重新核查。', submitTime: '2026-02-09 14:30' },
            docs: {
                calc: { name: '普通功率石墨电极核算报告_用印版.pdf', ver: 'V1', date: '2026-02-08' },
                verify: { name: '核查报告_DNV.pdf', ver: 'V1', date: '2026-02-08' },
                cert: { name: '声明证书.jpg', ver: 'V1', expire: '2027-02-08' }
            },
            history: [
                { title: '供应商提交申诉', desc: '我有异议', timestamp: '2026-02-09 14:30', type: 'warning' },
                { title: '已下发至供应商', desc: '供应商可确认接收或申诉', timestamp: '2026-02-09 10:00', type: 'primary' }
            ]
        }
    ];

    /**
     * 报告管理列表：返回 MOCK_REPORTS 同一引用，下发/确认/申诉直接修改原数组，与供应商端闭环
     */
    function getReportList() {
        return MOCK_REPORTS;
    }

    /**
     * 供应商端「我的报告」列表：仅已下发且属于该供应商的报告
     * @param {string} supplierName 与 MOCK_REPORTS.supplierName 一致
     * @returns {Array<{taskNo, taskId, orderNo, productName, reportStatus, reportDate, received, appeal}>}
     */
    function getSupplierReports(supplierName) {
        if (!supplierName) return [];
        return MOCK_REPORTS.filter(function (r) {
            return r.releasedToSupplier === true && r.supplierName === supplierName;
        }).map(function (r) {
            var statusText = r.status === 'archived' ? '已发证' : r.releasedToSupplier ? '已下发' : '待处理';
            var reportDate = (r.docs && r.docs.calc && r.docs.calc.date) ? r.docs.calc.date : (r.archiveTime || '').slice(0, 10);
            return {
                taskNo: r.taskNo,
                taskId: r.taskNo,
                orderNo: r.orderNo,
                productName: r.productName,
                reportStatus: statusText,
                reportDate: reportDate,
                received: r.received === true,
                appeal: r.appeal
            };
        });
    }

    /**
     * 供应商确认接收报告（写入 MOCK_REPORTS，报告管理可归档）
     * @param {string} taskNo
     */
    function confirmReceive(taskNo) {
        for (var i = 0; i < MOCK_REPORTS.length; i++) {
            if (MOCK_REPORTS[i].taskNo === taskNo) {
                MOCK_REPORTS[i].received = true;
                if (!MOCK_REPORTS[i].history) MOCK_REPORTS[i].history = [];
                MOCK_REPORTS[i].history.unshift({
                    title: '供应商确认接收',
                    desc: '供应商已确认接收报告',
                    timestamp: new Date().toLocaleString('zh-CN'),
                    type: 'success'
                });
                return true;
            }
        }
        return false;
    }

    /**
     * 供应商提交申诉（写入 MOCK_REPORTS，报告管理显示申诉中）
     * @param {string} taskNo
     * @param {string} reason
     * @param {Array} [attachments] 可选附件（Mock 仅占位）
     */
    function submitAppeal(taskNo, reason, attachments) {
        for (var i = 0; i < MOCK_REPORTS.length; i++) {
            if (MOCK_REPORTS[i].taskNo === taskNo) {
                MOCK_REPORTS[i].appeal = {
                    reason: reason || '',
                    submitTime: new Date().toLocaleString('zh-CN')
                };
                if (!MOCK_REPORTS[i].history) MOCK_REPORTS[i].history = [];
                MOCK_REPORTS[i].history.unshift({
                    title: '供应商提交申诉',
                    desc: '我有异议',
                    timestamp: new Date().toLocaleString('zh-CN'),
                    type: 'warning'
                });
                return true;
            }
        }
        return false;
    }

    global.MOCK_REPORTS = MOCK_REPORTS;
    global.getReportList = getReportList;
    global.getSupplierReports = getSupplierReports;
    global.confirmReceive = confirmReceive;
    global.submitAppeal = submitAppeal;
})(typeof window !== 'undefined' ? window : this);
