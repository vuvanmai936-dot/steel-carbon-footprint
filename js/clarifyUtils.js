/**
 * 澄清区域工具函数（时间格式化、角色头像等）
 * 供 docs/17 钉钉式对话实施方案 使用
 */
(function (global) {
  'use strict';

  function formatClarifyTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var h = ('0' + d.getHours()).slice(-2);
    var m = ('0' + d.getMinutes()).slice(-2);
    var time = h + ':' + m;
    if (msgDate.getTime() === today.getTime()) return time;
    if (msgDate.getTime() === today.getTime() - 86400000) return '昨天 ' + time;
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + time;
  }

  function roleAvatar(role) {
    return { operator: '运', supplier: '供', verifier: '核' }[role] || '?';
  }

  if (typeof global !== 'undefined') {
    global.formatClarifyTime = formatClarifyTime;
    global.roleAvatar = roleAvatar;
  }
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
