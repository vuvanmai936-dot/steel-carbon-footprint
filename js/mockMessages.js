/**
 * 用户级消息 Mock（与 docs/15_消息功能规划 一致）
 * 提供 getMyMessages、markRead、markAllRead；消息类型：任务分配、SLA预警、澄清、驳回/整改、报告/证书、系统通知
 */
(function (global) {
    'use strict';

    /** 消息类型枚举（与规划文档一致） */
    var MESSAGE_TYPE = {
        TASK_ASSIGN: 'task_assign',
        SLA_ALERT: 'sla_alert',
        CLARIFY: 'clarify',
        REJECT_RECTIFY: 'reject_rectify',
        REPORT_CERT: 'report_cert',
        SYSTEM: 'system'
    };

    /** 按用户存储消息列表，内存可变 */
    var STORE = {};
    var ID_COUNTER = 1;

    function nextId() {
        return 'msg_' + (ID_COUNTER++);
    }

    /**
     * 为指定用户生成默认消息列表
     * @param {string} userId - 当前用户 ID
     * @param {string} end - 'operator' | 'certifier' | 'supplier'，决定展示哪类消息
     */
    function getDefaultMessages(userId, end) {
        end = end || 'operator';
        var list = [];
        if (end === 'certifier') {
            list.push({
                messageId: nextId(),
                userId: userId,
                type: MESSAGE_TYPE.CLARIFY,
                title: 'YY耐火材料 回复了澄清',
                body: '已上传《绿电交易凭证.pdf》，请重新审核。',
                relatedType: 'task',
                relatedId: 'PCF-2511-0035',
                jumpUrl: '',
                read: false,
                createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
            });
            list.push({
                messageId: nextId(),
                userId: userId,
                type: MESSAGE_TYPE.TASK_ASSIGN,
                title: '新任务分配',
                body: '系统自动分配了“无缝钢管”核查任务。',
                relatedType: 'task',
                relatedId: 'PCF-2511-0038',
                jumpUrl: '',
                read: false,
                createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
            });
            list.push({
                messageId: nextId(),
                userId: userId,
                type: MESSAGE_TYPE.SLA_ALERT,
                title: 'SLA 预警',
                body: '任务 PCF-2511-0034 剩余时间不足 48 小时。',
                relatedType: 'task',
                relatedId: 'PCF-2511-0034',
                jumpUrl: '',
                read: true,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            });
        }
        if (end === 'operator') {
            list.push({
                messageId: nextId(),
                userId: userId,
                type: MESSAGE_TYPE.CLARIFY,
                title: '供应商发起了澄清',
                body: '任务 PCF-2511-0035：M 配料表是否需包含外购半成品？',
                relatedType: 'task',
                relatedId: 'PCF-2511-0035',
                jumpUrl: '',
                read: false,
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            });
            list.push({
                messageId: nextId(),
                userId: userId,
                type: MESSAGE_TYPE.TASK_ASSIGN,
                title: '新任务待配置',
                body: '订单 O202511001 已确认，请配置模板并下发。',
                relatedType: 'task',
                relatedId: 'PCF-2511-0039',
                jumpUrl: '',
                read: true,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            });
        }
        return list;
    }

    function ensureUserStore(userId, end) {
        end = end || 'operator';
        var key = (userId || 'default') + '_' + end;
        if (!STORE[key]) {
            STORE[key] = getDefaultMessages(userId, end).map(function (m) {
                return JSON.parse(JSON.stringify(m));
            });
        }
        return STORE[key];
    }

    /**
     * 构建跳转 URL（运营端与核查端路径不同，由调用方传入 basePath 或在此根据 relatedType+type 生成）
     * @param {Object} msg - 消息对象
     * @param {string} end - 'operator' | 'certifier' | 'supplier'
     */
    function buildJumpUrl(msg, end) {
        if (msg.jumpUrl) return msg.jumpUrl;
        if (msg.relatedType === 'task' && msg.relatedId) {
            if (end === 'certifier') {
                var url = 'task_detail.html?taskId=' + encodeURIComponent(msg.relatedId);
                if (msg.type === MESSAGE_TYPE.CLARIFY) url += '&open=clarify';
                return url;
            }
            if (end === 'operator') {
                var u = 'task_detail_config.html?taskId=' + encodeURIComponent(msg.relatedId);
                if (msg.type === MESSAGE_TYPE.CLARIFY) u += '&open=clarify';
                return u;
            }
        }
        if (msg.relatedType === 'report' && msg.relatedId) {
            return 'report_detail.html?taskNo=' + encodeURIComponent(msg.relatedId);
        }
        return '';
    }

    /**
     * 获取当前用户的消息列表
     * @param {string} userId - 用户 ID 或角色标识
     * @param {Object} opts - { limit, offset, unreadOnly }
     * @param {string} end - 'operator' | 'certifier' | 'supplier'，用于生成 jumpUrl
     * @returns {Array<{messageId, type, title, body, relatedType, relatedId, jumpUrl, read, createdAt}>}
     */
    function getMyMessages(userId, opts, end) {
        opts = opts || {};
        var limit = opts.limit != null ? opts.limit : 50;
        var offset = opts.offset != null ? opts.offset : 0;
        var unreadOnly = !!opts.unreadOnly;
        end = end || 'operator';
        var list = ensureUserStore(userId, end);
        if (unreadOnly) list = list.filter(function (m) { return !m.read; });
        list = list.slice(0, list.length).sort(function (a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        var slice = list.slice(offset, offset + limit);
        return slice.map(function (m) {
            var jumpUrl = buildJumpUrl(m, end);
            return {
                messageId: m.messageId,
                type: m.type,
                title: m.title,
                body: m.body,
                desc: m.body,
                relatedType: m.relatedType,
                relatedId: m.relatedId,
                jumpUrl: jumpUrl,
                read: m.read,
                createdAt: m.createdAt
            };
        });
    }

    /**
     * 标记单条已读
     * @param {string} userId
     * @param {string} messageId
     */
    function markRead(userId, messageId, end) {
        var list = ensureUserStore(userId, end || 'operator');
        var item = list.filter(function (m) { return m.messageId === messageId; })[0];
        if (item) item.read = true;
    }

    /**
     * 标记全部已读
     * @param {string} userId
     */
    function markAllRead(userId, end) {
        var list = ensureUserStore(userId, end || 'operator');
        list.forEach(function (m) { m.read = true; });
    }

    /**
     * 未读数量
     * @param {string} userId
     * @returns {number}
     */
    function getUnreadCount(userId, end) {
        return ensureUserStore(userId, end || 'operator').filter(function (m) { return !m.read; }).length;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            MESSAGE_TYPE: MESSAGE_TYPE,
            getMyMessages: getMyMessages,
            markRead: markRead,
            markAllRead: markAllRead,
            getUnreadCount: getUnreadCount,
            buildJumpUrl: buildJumpUrl
        };
    } else {
        global.getMyMessages = getMyMessages;
        global.markRead = markRead;
        global.markAllRead = markAllRead;
        global.getUnreadCount = getUnreadCount;
        global.MESSAGE_TYPE = MESSAGE_TYPE;
        global.buildJumpUrl = buildJumpUrl;
    }
})(typeof window !== 'undefined' ? window : global);
