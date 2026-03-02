/**
 * 共享 Mock 任务表：与订单 Mock、自营任务列表的 taskId/orderNo 一致，供 task_detail_* 按 URL taskId 加载。
 * 含模板/任务 Snapshot 持久化 Mock，保证「选模板→下发→填报→采集审核」数据链可验证。
 * 后续接真实接口时可替换为 API 请求。
 */
(function (global) {
    var MOCK_TASK_MAP = {
        'TSK-2026-888': { taskId: 'TSK-2026-888', orderNo: 'ORD-20260203-001', productName: '超高功率石墨电极', specs: 'Φ600mm', supplier: '南通碳素有限公司' },
        'TSK-2026-889': { taskId: 'TSK-2026-889', orderNo: 'ORD-20260203-001', productName: '普通功率石墨电极', specs: 'Φ400mm', supplier: '南通碳素有限公司' },
        'TSK-2026-890': { taskId: 'TSK-2026-890', orderNo: 'ORD-20260203-001', productName: '超高功率石墨电极接头', specs: 'T4L', supplier: '南通碳素有限公司' },
        'TSK-2025-101': { taskId: 'TSK-2025-101', orderNo: 'ORD-20250315-099', productName: '热轧卷板', specs: 'Q235B 5.0mm', supplier: '南京钢铁集团' },
        'TSK-2026-892': { taskId: 'TSK-2026-892', orderNo: 'ORD-20260205-002', productName: 'HRB400E 螺纹钢', specs: 'Φ22mm', supplier: '沙钢集团' },
        'TSK-2026-870': { taskId: 'TSK-2026-870', orderNo: 'ORD-20260110-008', productName: '中厚板', specs: 'Q345B 20mm', supplier: '宝钢股份' },
        'TSK-2025-999': { taskId: 'TSK-2025-999', orderNo: 'ORD-20251212-015', productName: '汽车结构钢', specs: 'SAPH440', supplier: '马钢股份' }
    };

    function getTaskIdFromUrl() {
        var params = new URLSearchParams(typeof window !== 'undefined' && window.location ? window.location.search : '');
        return params.get('taskId') || '';
    }

    function getFromParam() {
        var params = new URLSearchParams(typeof window !== 'undefined' && window.location ? window.location.search : '');
        return params.get('from') || '';
    }

    function getTemplateIdFromUrl() {
        var params = new URLSearchParams(typeof window !== 'undefined' && window.location ? window.location.search : '');
        return params.get('id') || '';
    }

    /**
     * 根据 URL 的 taskId 返回 taskInfo 对象；若无则返回 defaultTaskId 对应项或默认兜底。
     * @param {string} defaultTaskId - 默认任务 ID（无 URL 参数时使用）
     * @returns {Object} { taskId, orderNo, productName, specs, supplier }
     */
    function getTaskInfoFromUrl(defaultTaskId) {
        var taskId = getTaskIdFromUrl();
        if (taskId && MOCK_TASK_MAP[taskId]) return Object.assign({}, MOCK_TASK_MAP[taskId]);
        if (defaultTaskId && MOCK_TASK_MAP[defaultTaskId]) return Object.assign({}, MOCK_TASK_MAP[defaultTaskId]);
        return Object.assign({}, MOCK_TASK_MAP['TSK-2026-889']);
    }

    var DEFAULT_SHEET_DATA = {
        'M配料': [['类别', '名称', '单位', '填报指引', '数值', '备注'], ['能源', '电力消耗', 'kWh', '请提供含峰谷平分项的电费单', '', ''], ['原材料', '针状焦投入', '吨', '', '', ''], ['原材料', '煤沥青', '吨', '', '', '']],
        'M焙烧': [['类别', '名称', '单位', '填报指引', '数值', '备注'], ['能源', '天然气', 'm³', '', '', ''], ['排放', '废气排放量', 'm³', '需第三方监测报告', '', '']]
    };

    /** 按模板 ID 存储的 Snapshot（保存/发布时写入，template_detail 初始化时读取） */
    var MOCK_TEMPLATE_SNAPSHOTS = {};
    /** 按任务 ID 存储的已下发 Snapshot（任务配置下发时写入，task_fill 读取） */
    var MOCK_TASK_SNAPSHOTS = {};
    /** 按任务 ID 存储的供应商已提交数据（submitTaskData 写入，task_detail_collect 读取） */
    var MOCK_TASK_SUBMITTED = {};

    /**
     * 获取模板 Snapshot（用于任务配置选模板后加载、template_detail 初始化）
     * 若该模板已保存过则返回已存储的 Snapshot，否则返回默认。
     * @param {string} templateId
     * @returns {Object} Snapshot { version, templateId, sheetData, evidenceRequirements }
     */
    function getTemplateSnapshot(templateId) {
        var id = templateId || 'tpl_01';
        if (MOCK_TEMPLATE_SNAPSHOTS[id]) return JSON.parse(JSON.stringify(MOCK_TEMPLATE_SNAPSHOTS[id]));
        return {
            version: '1.0',
            templateId: id,
            sheetData: JSON.parse(JSON.stringify(DEFAULT_SHEET_DATA)),
            evidenceRequirements: [{ id: 'req_001', name: '电力采购结算单', desc: '需体现用电量及结算周期。' }]
        };
    }

    /**
     * 保存模板 Snapshot（template_detail 保存草稿/发布时调用）
     * @param {string} templateId
     * @param {Object} snapshot
     */
    function saveTemplateSnapshot(templateId, snapshot) {
        if (!templateId) return;
        MOCK_TEMPLATE_SNAPSHOTS[templateId] = JSON.parse(JSON.stringify(snapshot));
    }

    /**
     * 获取任务实例 Snapshot（用于供应商填报：已下发的配置；若无则返回模板默认）
     * @param {string} taskId
     * @returns {Object} Snapshot
     */
    function getTaskSnapshot(taskId) {
        if (MOCK_TASK_SNAPSHOTS[taskId]) return JSON.parse(JSON.stringify(MOCK_TASK_SNAPSHOTS[taskId]));
        var base = getTemplateSnapshot('tpl_01');
        base.taskId = taskId;
        return base;
    }

    /**
     * 保存任务 Snapshot（任务配置页下发时调用，供 task_fill / task_detail_collect 取已下发配置）
     * @param {string} taskId
     * @param {Object} snapshot
     */
    function saveTaskSnapshot(taskId, snapshot) {
        if (!taskId) return;
        var copy = JSON.parse(JSON.stringify(snapshot));
        copy.taskId = taskId;
        MOCK_TASK_SNAPSHOTS[taskId] = copy;
    }

    /**
     * 供应商提交数据（task_fill 提交时调用）
     * @param {string} taskId
     * @param {Object} snapshot
     * @param {Array} evidenceFiles 凭证文件列表（Mock 仅存储引用）
     */
    function submitTaskData(taskId, snapshot, evidenceFiles) {
        if (!taskId) return;
        MOCK_TASK_SUBMITTED[taskId] = { snapshot: JSON.parse(JSON.stringify(snapshot)), evidenceFiles: evidenceFiles || [] };
    }

    /**
     * 获取供应商已提交的 Snapshot（task_detail_collect 只读展示与审核用）
     * @param {string} taskId
     * @returns {Object|null} Snapshot 或 null
     */
    function getTaskSubmittedSnapshot(taskId) {
        if (!taskId || !MOCK_TASK_SUBMITTED[taskId]) return null;
        return JSON.parse(JSON.stringify(MOCK_TASK_SUBMITTED[taskId].snapshot));
    }

    global.MOCK_TASK_MAP = MOCK_TASK_MAP;
    global.getTaskIdFromUrl = getTaskIdFromUrl;
    global.getTaskInfoFromUrl = getTaskInfoFromUrl;
    global.getFromParam = getFromParam;
    global.getTemplateIdFromUrl = getTemplateIdFromUrl;
    global.getTemplateSnapshot = getTemplateSnapshot;
    global.saveTemplateSnapshot = saveTemplateSnapshot;
    global.getTaskSnapshot = getTaskSnapshot;
    global.saveTaskSnapshot = saveTaskSnapshot;
    global.submitTaskData = submitTaskData;
    global.getTaskSubmittedSnapshot = getTaskSubmittedSnapshot;
})(typeof window !== 'undefined' ? window : this);
