/**
 * 原型依赖清单：构建后使用 public/vendor/ 本地副本（npm run sync:vendor）。
 */
(function (global) {
  global.PCF_VENDOR_URLS = {
    elementPlusCss: 'vendor/element-plus.css',
    vue3: 'vendor/vue.global.prod.js',
    elementPlus: 'vendor/element-plus.full.min.js',
    elementPlusIcons: 'vendor/element-plus-icons.iife.min.js',
    elementPlusZhCn: 'vendor/element-plus-locale-zh-cn.js',
    spreadCss:
      'https://cdn.grapecity.com/spreadjs/hosted/css/gc.spread.sheets.excel2013white.16.0.0.css',
    spreadJs:
      'https://cdn.grapecity.com/spreadjs/hosted/scripts/gc.spread.sheets.all.16.0.0.min.js',
    echarts: 'https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js',
  };
})(typeof window !== 'undefined' ? window : this);
