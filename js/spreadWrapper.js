/**
 * SpreadJS 统一入口（ADR-0002）；封装 spreadUtils，供各页与六仓 fe 对齐命名。
 * 正式 License：部署时注入 window.PCF_SPREADJS_LICENSE 后调用 SpreadWrapper.applyLicense()。
 */
(function (global) {
  'use strict';

  if (typeof global.SpreadUtils === 'undefined') {
    console.warn('spreadWrapper: 请先加载 js/spreadUtils.js');
    return;
  }

  var U = global.SpreadUtils;

  global.SpreadWrapper = {
    applyLicense: function (licenseKey) {
      return U.applySpreadLicense(licenseKey);
    },
    createWorkbook: function (hostEl, workbookOptions) {
      return U.createWorkbook(hostEl, workbookOptions);
    },
    createSpreadFromSnapshot: function (hostEl, snapshot, options) {
      return U.createSpreadFromSnapshot(hostEl, snapshot, options);
    },
    getSnapshotFromSpread: function (spread, extra) {
      return U.getSnapshotFromSpread(spread, extra);
    },
    setSpreadReadOnly: function (spread) {
      return U.setSpreadReadOnly(spread);
    },
  };
})(typeof window !== 'undefined' ? window : this);
