/**
 * 全局工具类 Utils
 */
const Utils = {
  // 格式化碳排放数值，保留两位小数并带单位
  formatCarbon(value) {
    if (!value && value !== 0) return '--';
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' tCO2e';
  },

  // 获取当前日期格式化 (YYYY-MM-DD)
  getCurrentDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  // 模拟简单的页面跳转带参数
  jumpTo(page, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    window.location.href = `${page}.html${queryString ? '?' + queryString : ''}`;
  }
};