/**
 * 任务澄清功能 Mock 数据与接口（与 docs/04_澄清与消息/18_驳回澄清与消息全局规划 一致）
 * 支持 role: operator | supplier | verifier；会话含 participants（可见范围）、subjectType（report_draft/supplier_data/general）
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
    { value: '其他', label: '其他' },
  ];

  // 按 taskId 存储澄清会话，内存可变，刷新后恢复默认
  var STORE = {};

  function getDefaultClarifications(taskId) {
    var base = [
      {
        id: 'clar_' + taskId.replace(/-/g, '_') + '_1',
        subject: 'M 配料表是否需包含外购半成品',
        type: '数据完整性',
        subjectType: 'general',
        initiator: 'supplier',
        initiatorName: '供应商',
        status: 'open',
        stageIndex: 0,
        participants: ['operator', 'supplier'],
        createdAt: '2026-03-02T10:00:00',
        updatedAt: '2026-03-02T11:30:00',
        messages: [
          {
            id: 'msg_1',
            role: 'supplier',
            authorName: '供应商',
            content: '请问 M 配料表是否需包含外购半成品？',
            createdAt: '2026-03-02T10:00:00',
          },
          {
            id: 'msg_2',
            role: 'operator',
            authorName: '运营',
            content: '需要。请按模板中「外购半成品」子表填报。',
            createdAt: '2026-03-02T11:30:00',
          },
        ],
      },
      {
        id: 'clar_' + taskId.replace(/-/g, '_') + '_2',
        subject: '核算报告草稿第3章结论表述需确认',
        type: '核查意见',
        subjectType: 'report_draft',
        initiator: 'verifier',
        initiatorName: 'SGS',
        status: 'open',
        stageIndex: 3,
        participants: ['operator', 'verifier'],
        createdAt: '2026-03-03T09:00:00',
        updatedAt: '2026-03-03T09:00:00',
        messages: [
          {
            id: 'msg_v1',
            role: 'verifier',
            authorName: 'SGS',
            content: '核算报告草稿第3章结论表述请与核查声明保持一致。',
            createdAt: '2026-03-03T09:00:00',
          },
        ],
      },
      {
        id: 'clar_' + taskId.replace(/-/g, '_') + '_3',
        subject: '工序A能耗数据来源请补充说明',
        type: '核查意见',
        subjectType: 'supplier_data',
        initiator: 'verifier',
        initiatorName: 'SGS',
        status: 'open',
        stageIndex: 3,
        participants: ['operator', 'verifier'],
        createdAt: '2026-03-03T10:00:00',
        updatedAt: '2026-03-03T10:00:00',
        messages: [
          {
            id: 'msg_v2',
            role: 'verifier',
            authorName: 'SGS',
            content: '工序A能耗数据来源需补充凭证或说明，请运营确认后回复或转交供应商。',
            createdAt: '2026-03-03T10:00:00',
          },
        ],
      },
    ];
    // 单一日志流用默认会话：所有「在一个对话框内」的沟通都归入此会话，不单独设澄清标题
    var rfiId = 'rfi_' + taskId.replace(/-/g, '_');
    base.unshift({
      id: rfiId,
      subject: '沟通记录',
      type: '其他',
      subjectType: 'general',
      initiator: 'operator',
      initiatorName: '运营',
      status: 'open',
      stageIndex: 0,
      participants: ['operator', 'supplier', 'verifier'],
      createdAt: '2026-03-01T08:00:00',
      updatedAt: '2026-03-01T08:00:00',
      messages: [],
    });
    return base;
  }

  /**
   * 单一日志流下发送消息时使用的默认会话 ID（沟通内容都在此对话框内处理，不单独设澄清标题）
   * @param {string} taskId
   * @returns {string}
   */
  function getDefaultRfiSessionId(taskId) {
    if (!taskId) return '';
    return 'rfi_' + taskId.replace(/-/g, '_');
  }

  function ensureTaskStore(taskId) {
    if (!STORE[taskId]) {
      STORE[taskId] = getDefaultClarifications(taskId).map(function (c) {
        return JSON.parse(JSON.stringify(c));
      });
    }
    return STORE[taskId];
  }

  /**
   * 按任务拉取澄清列表（含每条最后一条消息摘要）；按 currentRole 过滤可见范围（运营见全部）
   * @param {string} taskId
   * @param {string} [currentRole] 'operator'|'supplier'|'verifier'，不传或 operator 时返回全部
   * @returns {Array<{id, subject, type, initiator, initiatorName, status, stageIndex, updatedAt, lastMessage?, participants?, subjectType?}>}
   */
  function getClarificationsByTaskId(taskId, currentRole) {
    if (!taskId) return [];
    var list = ensureTaskStore(taskId);
    var filtered = list;
    if (currentRole && currentRole !== 'operator') {
      filtered = list.filter(function (c) {
        var participants = c.participants || ['operator', 'supplier'];
        return participants.indexOf(currentRole) !== -1;
      });
    }
    return filtered.map(function (c) {
      var last = c.messages && c.messages.length ? c.messages[c.messages.length - 1] : null;
      return {
        id: c.id,
        subject: c.subject,
        type: c.type,
        subjectType: c.subjectType,
        initiator: c.initiator,
        initiatorName: c.initiatorName,
        status: c.status,
        stageIndex: c.stageIndex,
        participants: c.participants,
        updatedAt: c.updatedAt,
        lastMessage: last ? last.content : '',
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
    var id = 'clar_' + taskId.replace(/-/g, '_') + '_' + Date.now().toString(36);
    var now = new Date().toISOString().slice(0, 19).replace('T', 'T');
    var msgId = 'msg_' + id.replace('clar_', '');
    var msg = {
      id: msgId,
      role: role,
      authorName: name,
      content: payload.firstMessage || '(无内容)',
      createdAt: now,
      attachments: payload.attachments && payload.attachments.length ? payload.attachments.slice() : [],
    };
    var participants = payload.participants || [role, 'operator'];
    if (participants.indexOf('operator') === -1) participants.unshift('operator');
    if (participants.indexOf(role) === -1) participants.push(role);
    var item = {
      id: id,
      subject: payload.subject || '新澄清',
      type: payload.type || '其他',
      subjectType: payload.subjectType || 'general',
      initiator: role,
      initiatorName: name,
      status: 'open',
      stageIndex: stage,
      participants: participants,
      createdAt: now,
      updatedAt: now,
      messages: [msg],
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
          createdAt: now,
          attachments: payload.attachments && payload.attachments.length ? payload.attachments.slice() : [],
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

  /**
   * 运营将核查机构发起的「供应商数据/凭证」类澄清转发给供应商，使供应商可见并参与
   * @param {string} taskId
   * @param {string} clarificationId
   * @returns {Object|null} 更新后的澄清会话
   */
  function assignClarificationToSupplier(taskId, clarificationId) {
    if (!taskId || !clarificationId) return null;
    var list = ensureTaskStore(taskId);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === clarificationId) {
        var p = list[i].participants || [];
        if (p.indexOf('supplier') === -1) p.push('supplier');
        list[i].participants = p;
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
  global.getDefaultRfiSessionId = getDefaultRfiSessionId;
  global.createClarification = createClarification;
  global.replyClarification = replyClarification;
  global.closeClarification = closeClarification;
  global.assignClarificationToSupplier = assignClarificationToSupplier;
  global.getClarificationTypes = getClarificationTypes;
})(typeof window !== 'undefined' ? window : this);
