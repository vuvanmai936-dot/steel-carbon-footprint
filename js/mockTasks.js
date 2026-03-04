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
        'TSK-2026-891': { taskId: 'TSK-2026-891', orderNo: 'ORD-20260203-001', productName: '普通功率石墨电极', specs: 'Φ300mm', supplier: '南通碳素有限公司' },
        'TSK-2026-893': { taskId: 'TSK-2026-893', orderNo: 'ORD-20260210-003', productName: '高功率石墨电极', specs: 'Φ500mm', supplier: '南通碳素有限公司' },
        'TSK-2026-894': { taskId: 'TSK-2026-894', orderNo: 'ORD-20260210-003', productName: '石墨块', specs: '100×100×500', supplier: '南通碳素有限公司' },
        'TSK-2026-895': { taskId: 'TSK-2026-895', orderNo: 'ORD-20260215-004', productName: '超高功率石墨电极接头', specs: 'T2N', supplier: '南通碳素有限公司' },
        'TSK-2026-896': { taskId: 'TSK-2026-896', orderNo: 'ORD-20260215-004', productName: '电极糊', specs: '密闭糊 25kg', supplier: '南通碳素有限公司' },
        'TSK-2026-897': { taskId: 'TSK-2026-897', orderNo: 'ORD-20260218-005', productName: '普通功率石墨电极', specs: 'Φ350mm', supplier: '南通碳素有限公司' },
        'TSK-2026-898': { taskId: 'TSK-2026-898', orderNo: 'ORD-20260218-005', productName: '高功率石墨电极', specs: 'Φ450mm', supplier: '南通碳素有限公司' },
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
    (function seedSupplierDemo() {
        for (var id in MOCK_TASK_MAP) {
            if (MOCK_TASK_MAP[id].supplier !== '南通碳素有限公司') continue;
            if (MOCK_TASK_SNAPSHOTS[id]) continue;
            var base = getTemplateSnapshot('tpl_01');
            base.taskId = id;
            MOCK_TASK_SNAPSHOTS[id] = base;
        }
    })();
    /** 按任务 ID 存储的供应商已提交数据（submitTaskData 写入，task_detail_collect 读取） */
    var MOCK_TASK_SUBMITTED = {};
    /** 按任务 ID 存储的采集驳回原因（运营驳回时写入，供应商待办/填报页读取；供应商再次提交后清除） */
    var MOCK_TASK_REJECT_REASON = {};
    /** 演示用：预置一条驳回，使 TSK-2026-889 在列表中呈「采集已驳回」状态 */
    (function () { MOCK_TASK_REJECT_REASON['TSK-2026-889'] = '请补充 M 配料表电力消耗数据及对应电费凭证。'; })();

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
        delete MOCK_TASK_REJECT_REASON[taskId];
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

    /**
     * 设置任务采集驳回原因（运营端驳回时调用）
     * @param {string} taskId
     * @param {string} reason
     */
    function setTaskRejectReason(taskId, reason) {
        if (!taskId) return;
        MOCK_TASK_REJECT_REASON[taskId] = reason || '';
    }

    /**
     * 获取任务采集驳回原因（供应商待办列表与填报页使用）
     * @param {string} taskId
     * @returns {string} 驳回原因，无则返回空字符串
     */
    function getTaskRejectReason(taskId) {
        if (!taskId) return '';
        return MOCK_TASK_REJECT_REASON[taskId] || '';
    }

    var TASK_CREATE_TIMES = {
        'TSK-2026-888': '2026-02-03 09:00', 'TSK-2026-889': '2026-02-03 09:30', 'TSK-2026-890': '2026-02-01 14:20',
        'TSK-2026-891': '2026-02-04 10:00', 'TSK-2026-893': '2026-02-10 11:00', 'TSK-2026-894': '2026-02-11 08:30',
        'TSK-2026-895': '2026-02-15 14:00', 'TSK-2026-896': '2026-02-16 09:00', 'TSK-2026-897': '2026-02-18 10:30',
        'TSK-2026-898': '2026-02-18 15:00'
    };
    var TASK_DEADLINES = {
        'TSK-2026-888': '2026-02-20', 'TSK-2026-889': '2026-02-18', 'TSK-2026-890': '2026-02-15',
        'TSK-2026-891': '2026-02-22', 'TSK-2026-893': '2026-02-25', 'TSK-2026-894': '2026-02-28',
        'TSK-2026-895': '2026-03-02', 'TSK-2026-896': '2026-02-01', 'TSK-2026-897': '2026-03-05',
        'TSK-2026-898': '2026-03-01'
    };
    function getTaskCreateTime(taskId) { return TASK_CREATE_TIMES[taskId] || '2026-02-01 09:00'; }
    function getTaskDeadline(taskId) { return TASK_DEADLINES[taskId] || ''; }
    function getSupplierStageText(t, taskId) {
        if (t === 'rejected_collect' || t === 'clarification') return '3. 数据提交';
        return taskId === 'TSK-2026-888' ? '1. 订单确认' : '3. 数据提交';
    }
    function getSupplierStatusText(t, taskId) {
        if (t === 'rejected_collect' || t === 'clarification') return '需补充材料';
        return taskId === 'TSK-2026-888' ? '待开始' : '进行中';
    }
    function getSupplierActionText(t, taskId) {
        if (t === 'rejected_collect' || t === 'clarification') return '去处理';
        return taskId === 'TSK-2026-888' ? '开始' : '办理';
    }
    function getSupplierStatusTagType(t, taskId) {
        if (t === 'rejected_collect' || t === 'clarification') return 'danger';
        return taskId === 'TSK-2026-888' ? 'warning' : 'success';
    }

    /** 供应商任务当前阶段（与运营端 getStageStatusText 一致）：taskId -> { stageIndex, stageSubStatus? | reportSubStatus? } */
    var SUPPLIER_TASK_CURRENT_STAGE = {
        'TSK-2026-888': { stageIndex: 0, stageSubStatus: 'locked' },
        'TSK-2026-889': { stageIndex: 1, stageSubStatus: 'waiting_update' },
        'TSK-2026-890': { stageIndex: 2, stageSubStatus: 'clarifying' },
        'TSK-2026-891': { stageIndex: 1, stageSubStatus: 'waiting_submit' },
        'TSK-2026-893': { stageIndex: 3, stageSubStatus: 'pending_review' },
        'TSK-2026-894': { stageIndex: 4, reportSubStatus: 'released' },
        'TSK-2026-895': { stageIndex: 4, reportSubStatus: 'to_archive' },
        'TSK-2026-896': { stageIndex: 0, stageSubStatus: 'pending' },
        'TSK-2026-897': { stageIndex: 1, stageSubStatus: 'waiting_submit' },
        'TSK-2026-898': { stageIndex: 2, stageSubStatus: 'submitted' }
    };

    function getSupplierTaskStageRow(taskId, supplierName) {
        if (SUPPLIER_TASK_CURRENT_STAGE[taskId]) return Object.assign({}, SUPPLIER_TASK_CURRENT_STAGE[taskId]);
        if (typeof MOCK_TASK_LIST !== 'undefined') {
            for (var i = 0; i < MOCK_TASK_LIST.length; i++) {
                if (MOCK_TASK_LIST[i].taskId === taskId && MOCK_TASK_LIST[i].supplier === supplierName)
                    return { stageIndex: MOCK_TASK_LIST[i].stageIndex, stageSubStatus: MOCK_TASK_LIST[i].stageSubStatus, reportSubStatus: MOCK_TASK_LIST[i].reportSubStatus };
            }
        }
        return { stageIndex: 0, stageSubStatus: 'pending' };
    }

    /** 当前责任方文案（与中心端 self_operated_task_list 一致） */
    function getResponsibilityText(stageIndex, reportSubStatus) {
        if (stageIndex === 0) return '平台运营方';
        if (stageIndex === 1) return '供应商';
        if (stageIndex === 2) return '平台运营方';
        if (stageIndex === 3) return '核查机构';
        if (stageIndex === 4) {
            if (reportSubStatus === 'released') return '供应商';
            if (reportSubStatus === 'to_archive') return '平台运营方';
        }
        return '—';
    }

    function getTaskHasAppeal(taskId) {
        if (typeof MOCK_TASK_LIST === 'undefined') return false;
        for (var i = 0; i < MOCK_TASK_LIST.length; i++) {
            if (MOCK_TASK_LIST[i].taskId === taskId) return !!MOCK_TASK_LIST[i].hasAppeal;
        }
        return false;
    }

    function getTaskIsOverdue(taskId) {
        if (typeof MOCK_TASK_LIST === 'undefined') return false;
        for (var i = 0; i < MOCK_TASK_LIST.length; i++) {
            if (MOCK_TASK_LIST[i].taskId === taskId) return !!MOCK_TASK_LIST[i].isOverdue;
        }
        return false;
    }

    /**
     * 供应商待办任务列表：按供应商筛选，并结合配置下发、采集驳回、澄清状态计算 taskType；返回含 stageIndex、stageStatusText（与运营端一致）。
     * @param {string} supplierName 当前登录供应商名称，与 MOCK_TASK_MAP.supplier 一致
     * @returns {Array<{taskId, orderNo, productName, specs, taskType, stageIndex, stageStatusText, rejectReason?, clarificationText?, ...}>}
     */
    function getSupplierTaskList(supplierName) {
        if (!supplierName) return [];
        var list = [];
        for (var taskId in MOCK_TASK_MAP) {
            if (MOCK_TASK_MAP[taskId].supplier !== supplierName) continue;
            if (!MOCK_TASK_SNAPSHOTS[taskId]) continue;
            var task = MOCK_TASK_MAP[taskId];
            var rejectReason = getTaskRejectReason(taskId);
            var clarifications = typeof getClarificationsByTaskId === 'function' ? getClarificationsByTaskId(taskId, 'supplier') : [];
            var openClarify = null;
            for (var i = 0; i < clarifications.length; i++) {
                if (clarifications[i].status === 'open' && (clarifications[i].initiator === 'operator' || clarifications[i].initiator === 'verifier')) {
                    openClarify = clarifications[i];
                    break;
                }
            }
            var taskType = 'pending_fill';
            var clarificationText = '';
            if (openClarify) {
                taskType = 'clarification';
                clarificationText = openClarify.lastMessage || openClarify.subject || '有待回复的澄清';
            } else if (rejectReason) {
                taskType = 'rejected_collect';
            }
            var stageRow = getSupplierTaskStageRow(taskId, supplierName);
            var stageIndex = stageRow.stageIndex;
            var stageSubStatus = stageRow.stageSubStatus || '';
            if (stageIndex === 0) {
                taskType = '';
            } else if (stageIndex === 1) {
                if (rejectReason) taskType = 'rejected_collect';
                else taskType = 'pending_fill';
            } else if (stageIndex === 2) {
                if (openClarify && (stageSubStatus === 'clarifying' || stageSubStatus === 'waiting_supplier')) taskType = 'clarification';
                else taskType = '';
            } else if (stageIndex === 3 || stageIndex === 4) {
                if (openClarify) taskType = 'clarification';
                else taskType = '';
            }
            var stageStatusText = typeof getStageStatusText === 'function' ? getStageStatusText(stageRow) : getSupplierStageText(taskType, taskId);
            var responsibilityText = getResponsibilityText(stageRow.stageIndex, stageRow.reportSubStatus);
            var hasAppeal = getTaskHasAppeal(taskId);
            var isOverdue = getTaskIsOverdue(taskId);
            list.push({
                taskId: task.taskId,
                orderNo: task.orderNo,
                productName: task.productName,
                specs: task.specs,
                taskType: taskType,
                rejectReason: taskType === 'rejected_collect' ? rejectReason : undefined,
                clarificationText: taskType === 'clarification' ? clarificationText : undefined,
                createTime: getTaskCreateTime(taskId),
                deadline: getTaskDeadline(taskId),
                stageIndex: stageRow.stageIndex,
                stageSubStatus: stageRow.stageSubStatus,
                reportSubStatus: stageRow.reportSubStatus,
                stageText: getSupplierStageText(taskType, taskId),
                stageStatusText: stageStatusText,
                statusText: getSupplierStatusText(taskType, taskId),
                actionText: getSupplierActionText(taskType, taskId),
                statusTagType: getSupplierStatusTagType(taskType, taskId),
                responsibilityText: responsibilityText,
                hasAppeal: hasAppeal,
                isOverdue: isOverdue
            });
        }
        return list;
    }

    /**
     * 自营任务列表（与列表页、详情页共用）。阶段 0-4；阶段 4 用 reportSubStatus；阶段 0-3 用 stageSubStatus。
     */
    var MOCK_TASK_LIST = [
        { taskId: 'TSK-2026-892', orderNo: 'ORD-20260205-002', createTime: '2026-02-05', productName: 'HRB400E 螺纹钢', specs: 'Φ22mm', supplier: '沙钢集团', stageIndex: 0, stageSubStatus: 'pending', deadline: '2026-02-20', isOverdue: false },
        { taskId: 'TSK-2026-890', orderNo: 'ORD-20260203-001', createTime: '2026-02-03', productName: '超高功率石墨电极接头', specs: 'T4L', supplier: '南通碳素有限公司', stageIndex: 0, stageSubStatus: 'pending', deadline: '2026-02-15', isOverdue: false },
        { taskId: 'TSK-2026-889', orderNo: 'ORD-20260203-001', createTime: '2026-02-03', productName: '普通功率石墨电极', specs: 'Φ400mm', supplier: '南通碳素有限公司', stageIndex: 4, reportSubStatus: 'released', deadline: '2026-02-15', isOverdue: false, hasAppeal: true },
        { taskId: 'TSK-2026-896', orderNo: 'ORD-20260215-004', createTime: '2026-02-16', productName: '电极糊', specs: '密闭糊 25kg', supplier: '南通碳素有限公司', stageIndex: 0, stageSubStatus: 'pending', deadline: '2026-02-01', isOverdue: true },
        { taskId: 'TSK-2026-870', orderNo: 'ORD-20260110-008', createTime: '2026-01-10', productName: '中厚板', specs: 'Q345B 20mm', supplier: '宝钢股份', stageIndex: 2, stageSubStatus: 'submitted', deadline: '2026-02-12', isOverdue: false },
        { taskId: 'TSK-2026-888', orderNo: 'ORD-20260203-001', createTime: '2026-02-03', productName: '超高功率石墨电极', specs: 'Φ600mm', supplier: '南通碳素有限公司', stageIndex: 3, stageSubStatus: 'pending_review', deadline: '2026-02-10', isOverdue: false },
        { taskId: 'TSK-2025-999', orderNo: 'ORD-20251212-015', createTime: '2025-12-12', productName: '汽车结构钢', specs: 'SAPH440', supplier: '马钢股份', stageIndex: 4, reportSubStatus: 'released', deadline: '2026-01-15', isOverdue: false },
        { taskId: 'TSK-2025-101', orderNo: 'ORD-20250315-099', createTime: '2025-03-15', productName: '热轧卷板', specs: 'Q235B 5.0mm', supplier: '南京钢铁集团', stageIndex: 4, reportSubStatus: 'to_archive', deadline: '-', isOverdue: false },
        { taskId: 'TSK-2026-888', orderNo: 'ORD-20260203-001', createTime: '2026-02-03', productName: '超高功率石墨电极', specs: 'Φ600mm', supplier: '南通碳素有限公司', stageIndex: 4, reportSubStatus: 'archived', deadline: '-', isOverdue: false, hasAppeal: false }
    ];

    function getTaskList() {
        return MOCK_TASK_LIST.slice(0);
    }

    /**
     * 按 taskId 取一条任务，供详情页与列表状态一致。
     * @param {string} taskId - 任务 ID
     * @param {number} [pageStageIndex] - 当前详情页阶段：0=配置, 1=采集, 2=LCA, 3=核查。传入时优先返回该阶段对应的行，使状态展示跟随页面。
     * @returns {Object|null} 任务行或 null
     */
    function getTaskByTaskId(taskId, pageStageIndex) {
        if (!taskId) return null;
        var wantStage = typeof pageStageIndex === 'number' && pageStageIndex >= 0 && pageStageIndex <= 4;
        // 1) 若指定了当前页阶段，先查找 taskId + stageIndex 匹配的行
        if (wantStage) {
            for (var i = 0; i < MOCK_TASK_LIST.length; i++) {
                if (MOCK_TASK_LIST[i].taskId === taskId && MOCK_TASK_LIST[i].stageIndex === pageStageIndex)
                    return Object.assign({}, MOCK_TASK_LIST[i]);
            }
        }
        // 2) 若指定了阶段但列表无该阶段行，用 MOCK_TASK_MAP 合成该阶段状态，避免采集页误显「待配置模板」
        if (wantStage && MOCK_TASK_MAP[taskId]) {
            var baseSyn = Object.assign({}, MOCK_TASK_MAP[taskId]);
            baseSyn.stageIndex = pageStageIndex;
            baseSyn.stageSubStatus = (pageStageIndex === 0 ? 'pending' : pageStageIndex === 1 ? 'waiting_submit' : pageStageIndex === 2 ? 'uploaded' : pageStageIndex === 3 ? 'pending_review' : '');
            baseSyn.deadline = '';
            baseSyn.isOverdue = false;
            return baseSyn;
        }
        // 3) 未指定阶段时返回首条 taskId 匹配（兼容列表页等只传 taskId 的调用）
        for (var j = 0; j < MOCK_TASK_LIST.length; j++) {
            if (MOCK_TASK_LIST[j].taskId === taskId) return Object.assign({}, MOCK_TASK_LIST[j]);
        }
        // 4) 列表无该任务时用 MOCK_TASK_MAP 兜底
        if (MOCK_TASK_MAP[taskId]) {
            var base = Object.assign({}, MOCK_TASK_MAP[taskId]);
            var stage = wantStage ? pageStageIndex : 0;
            base.stageIndex = stage;
            base.stageSubStatus = (stage === 0 ? 'pending' : stage === 1 ? 'waiting_submit' : stage === 2 ? 'uploaded' : stage === 3 ? 'pending_review' : '');
            base.deadline = '';
            base.isOverdue = false;
            return base;
        }
        return null;
    }

    /**
     * 与列表用语一致：根据 task 的 stageIndex、stageSubStatus、reportSubStatus 返回展示文案。
     */
    function getStageStatusText(task) {
        if (!task) return '';
        var stage = task.stageIndex;
        if (stage === 4) {
            var s = task.reportSubStatus;
            if (s === 'released') return '已下发，待供应商确认';
            if (s === 'to_archive') return '待归档';
            if (s === 'archived') return '已归档';
            if (s === 'revoked') return '已作废';
            return '待处理';
        }
        var sub = task.stageSubStatus || '';
        if (stage === 0) {
            if (sub === 'pending') return '待配置模板';
            if (sub === 'draft') return '配置中';
            if (sub === 'locked') return '已配置';
            return '待配置模板';
        }
        if (stage === 1) {
            if (sub === 'waiting_submit') return '待提交';
            if (sub === 'auditing') return '审核中';
            if (sub === 'waiting_update') return '整改中';
            if (sub === 'passed') return '已完成';
            return '待提交';
        }
        if (stage === 2) {
            if (sub === 'uploaded') return '草稿待提交';
            if (sub === 'submitted') return '核查中';
            if (sub === 'clarifying') return '待澄清';
            if (sub === 'waiting_supplier') return '供应商整改中';
            if (sub === 'verified') return '已通过';
            return '草稿待提交';
        }
        if (stage === 3) {
            if (sub === 'pending_review') return '待运营验收';
            if (sub === 'rejected') return '已驳回';
            if (sub === 'on_chain') return '已上链';
            return '待运营验收';
        }
        return '';
    }

    global.MOCK_TASK_MAP = MOCK_TASK_MAP;
    global.MOCK_TASK_LIST = MOCK_TASK_LIST;
    global.getTaskList = getTaskList;
    global.getTaskByTaskId = getTaskByTaskId;
    global.getStageStatusText = getStageStatusText;
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
    global.setTaskRejectReason = setTaskRejectReason;
    global.getTaskRejectReason = getTaskRejectReason;
    /**
     * 供应商订单列表：按订单号聚合该供应商的任务，供订单列表/详情页使用。
     * @param {string} supplierName
     * @returns {Array<{orderNo, createTime, taskCount, tasks}>}
     */
    function getSupplierOrderList(supplierName) {
        var taskList = typeof getSupplierTaskList === 'function' ? getSupplierTaskList(supplierName) : [];
        var byOrder = {};
        for (var i = 0; i < taskList.length; i++) {
            var t = taskList[i];
            var ono = t.orderNo || '';
            if (!byOrder[ono]) {
                byOrder[ono] = { orderNo: ono, createTime: t.createTime || '', tasks: [] };
            }
            byOrder[ono].tasks.push(t);
            if (t.createTime && (!byOrder[ono].createTime || t.createTime < byOrder[ono].createTime)) {
                byOrder[ono].createTime = t.createTime;
            }
        }
        var list = [];
        for (var k in byOrder) {
            var o = byOrder[k];
            o.taskCount = o.tasks.length;
            list.push(o);
        }
        list.sort(function (a, b) { return (b.createTime || '').localeCompare(a.createTime || ''); });
        return list;
    }

    global.getSupplierTaskList = getSupplierTaskList;
    global.getSupplierTaskStageRow = getSupplierTaskStageRow;
    global.getSupplierOrderList = getSupplierOrderList;
})(typeof window !== 'undefined' ? window : this);
