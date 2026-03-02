/**
 * 任务澄清功能 Mock 数据与接口（与 docs/14 任务澄清功能方案 一致）
 * 支持 role: operator | supplier | verifier；会话含 stageIndex/phase、initiatedBy、assignee
 */
(function (global) {
    'use strict';

    var CLARIFICATION_TYPES = [
        { value: '数据完整性', label: '数据完整性' },
        { value: '凭证样式与要求', label: '凭证样式与要求' },
        { value: '模板字段含义', label: '模板字段含义' },
        { value: '方法学与计算', label: '方法学与计算' },
        { value: '核查意见', label: '核查意见' },
        { value: '整改要求', label: '整改要求' },
        { value: '其他', label: '其他' }
    ];

    // 按 taskId 存储澄清会话，内存可变，刷新后恢复默认
    var STORE = {};

    function getDefaultClarifications(taskId) {
        return [
            {
                id: 'clar_' + taskId.replace(/-/g, '_') + '_1',
                subject: 'M 配料表是否需包含外购半成品',
                type: '数据完整性',
                initiator: 'supplier',
                initiatorName: '供应商',
                status: 'open',
                stageIndex: 0,
                createdAt: '2026-03-02T10:00:00',
                updatedAt: '2026-03-02T11:30:00',
                messages: [
                    { id: 'msg_1', role: 'supplier', authorName: '供应商', content: '请问 M 配料表是否需包含外购半成品？', createdAt: '2026-03-02T10:00:00' },
                    { id: 'msg_2', role: 'operator', authorName: '运营', content: '需要。请按模板中「外购半成品」子表填报。', createdAt: '2026-03-02T11:30:00' }
                ]
            }
        ];
    }

    function ensureTaskStore(taskId) {
        if (!STORE[taskId]) {
            STORE[taskId] = getDefaultClarifications(taskId).map(function (c) { return JSON.parse(JSON.stringify(c)); });
        }
        return STORE[taskId];
    }

    /**
     * 按任务拉取澄清列表（含每条最后一条消息摘要）
     * @param {string} taskId
     * @returns {Array<{id, subject, type, initiator, initiatorName, status, stageIndex, updatedAt, lastMessage?: string}>}
     */
    function getClarificationsByTaskId(taskId) {
        if (!taskId) return [];
        var list = ensureTaskStore(taskId);
        return list.map(function (c) {
            var last = c.messages && c.messages.length ? c.messages[c.messages.length - 1] : null;
            return {
                id: c.id,
                subject: c.subject,
                type: c.type,
                initiator: c.initiator,
                initiatorName: c.initiatorName,
                status: c.status,
                stageIndex: c.stageIndex,
                updatedAt: c.updatedAt,
                lastMessage: last ? last.content : ''
            };
        });
    }

    /**
     * 拉取单条澄清详情（完整消息列表）
     * @param {string} taskId
     * @param {string} clarificationId
     * @returns {Object|null} { id, subject, type, messages, ... }
     */
    function getClarificationDetail(taskId, clarificationId) {
        if (!taskId || !clarificationId) return null;
        var list = ensureTaskStore(taskId);
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === clarificationId) {
                return JSON.parse(JSON.stringify(list[i]));
            }
        }
        return null;
    }

    /**
     * 新建澄清
     * @param {string} taskId
     * @param {Object} payload { type, subject, firstMessage }
     * @param {string} [currentRole='operator']
     * @param {string} [currentName='运营']
     * @param {number} [stageIndex=0]
     */
    function createClarification(taskId, payload, currentRole, currentName, stageIndex) {
        if (!taskId || !payload) return null;
        var list = ensureTaskStore(taskId);
        var role = currentRole || 'operator';
        var name = currentName || '运营';
        var stage = typeof stageIndex === 'number' ? stageIndex : 0;
        var id = 'clar_' + taskId.replace(/-/g, '_') + '_' + (Date.now().toString(36));
        var now = new Date().toISOString().slice(0, 19).replace('T', 'T');
        var msgId = 'msg_' + id.replace('clar_', '');
        var msg = {
            id: msgId,
            role: role,
            authorName: name,
            content: payload.firstMessage || '(无内容)',
            createdAt: now
        };
        var item = {
            id: id,
            subject: payload.subject || '新澄清',
            type: payload.type || '其他',
            initiator: role,
            initiatorName: name,
            status: 'open',
            stageIndex: stage,
            createdAt: now,
            updatedAt: now,
            messages: [msg]
        };
        list.push(item);
        return JSON.parse(JSON.stringify(item));
    }

    /**
     * 回复澄清
     * @param {string} taskId
     * @param {string} clarificationId
     * @param {Object} payload { content }
     * @param {string} [role='operator']
     * @param {string} [authorName='运营']
     */
    function replyClarification(taskId, clarificationId, payload, role, authorName) {
        if (!taskId || !clarificationId || !payload || !payload.content) return null;
        var list = ensureTaskStore(taskId);
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === clarificationId) {
                var now = new Date().toISOString().slice(0, 19).replace('T', 'T');
                var msg = {
                    id: 'msg_' + Date.now(),
                    role: role || 'operator',
                    authorName: authorName || '运营',
                    content: payload.content,
                    createdAt: now
                };
                list[i].messages.push(msg);
                list[i].updatedAt = now;
                return JSON.parse(JSON.stringify(list[i]));
            }
        }
        return null;
    }

    /**
     * 关闭澄清
     */
    function closeClarification(taskId, clarificationId) {
        if (!taskId || !clarificationId) return null;
        var list = ensureTaskStore(taskId);
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === clarificationId) {
                list[i].status = 'closed';
                list[i].updatedAt = new Date().toISOString().slice(0, 19).replace('T', 'T');
                return JSON.parse(JSON.stringify(list[i]));
            }
        }
        return null;
    }

    function getClarificationTypes() {
        return CLARIFICATION_TYPES.slice();
    }

    global.getClarificationsByTaskId = getClarificationsByTaskId;
    global.getClarificationDetail = getClarificationDetail;
    global.createClarification = createClarification;
    global.replyClarification = replyClarification;
    global.closeClarification = closeClarification;
    global.getClarificationTypes = getClarificationTypes;
})(typeof window !== 'undefined' ? window : this);
