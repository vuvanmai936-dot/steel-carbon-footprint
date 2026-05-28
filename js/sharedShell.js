/**
 * 三端工作台共享壳层：菜单高亮、消息中心、Element Plus 启动、门户可见性。
 * 须在 layout.js / supplierLayout.js / certifierLayout.js 之前加载。
 */
(function (global) {
  'use strict';

  function findActiveMenuId(menuConfig, path) {
    for (var i = 0; i < menuConfig.length; i++) {
      var item = menuConfig[i];
      if (item.path && item.path === path) return item.id;
      if (item.match && item.match.indexOf(path) !== -1) return item.id;
      if (item.children) {
        for (var j = 0; j < item.children.length; j++) {
          var c = item.children[j];
          if (c.path === path) return c.id;
          if (c.match && c.match.indexOf(path) !== -1) return c.id;
        }
      }
    }
    return '';
  }

  function formatMessageTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var now = new Date();
    var diff = (now - d) / 60000;
    if (diff < 1) return '刚刚';
    if (diff < 60) return Math.floor(diff) + '分钟前';
    if (diff < 1440) return Math.floor(diff / 60) + '小时前';
    if (diff < 43200) return Math.floor(diff / 1440) + '天前';
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  /**
   * @param {Object} vue - { ref, computed, watch }
   * @param {string} channel - operator | supplier | certifier
   * @param {function(): string} getUserName
   */
  function createMessageCenter(vue, channel, getUserName) {
    var ref = vue.ref;
    var computed = vue.computed;
    var watch = vue.watch;
    var hasMessageAPI =
      typeof getMyMessages === 'function' && typeof getUnreadCount === 'function';
    var messageCenterVisible = ref(false);
    var messageList = ref([]);
    var messageUnreadCount = computed(function () {
      var name = getUserName() || channel;
      return hasMessageAPI ? getUnreadCount(name, channel) : 0;
    });
    var loadMessages = function () {
      var name = getUserName() || channel;
      messageList.value = hasMessageAPI ? getMyMessages(name, {}, channel) : [];
    };
    var goMessage = function (m) {
      if (m && m.jumpUrl) global.location.href = m.jumpUrl;
    };
    watch(messageCenterVisible, function (v) {
      if (v) loadMessages();
    });
    return {
      messageCenterVisible: messageCenterVisible,
      messageList: messageList,
      messageUnreadCount: messageUnreadCount,
      loadMessages: loadMessages,
      goMessage: goMessage,
      formatMessageTime: formatMessageTime,
    };
  }

  function createPortalVisibility(vue, path, portalPages) {
    return vue.computed(function () {
      var base = path && path.endsWith('.html') ? path : (path || '') + '.html';
      return portalPages.indexOf(base) !== -1 || portalPages.indexOf(path) !== -1;
    });
  }

  function createSidebarState(vue, menuConfig) {
    var ref = vue.ref;
    var path =
      typeof global.location !== 'undefined' ? global.location.pathname.split('/').pop() || '' : '';
    var activeMenuId = ref(findActiveMenuId(menuConfig, path));
    var sidebarCollapsed = ref(false);
    var toggleSidebar = function () {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    };
    var openPage = function (pagePath) {
      var current = global.location.pathname.split('/').pop();
      if (current !== pagePath) global.location.href = pagePath;
    };
    return { path: path, activeMenuId: activeMenuId, sidebarCollapsed: sidebarCollapsed, toggleSidebar: toggleSidebar, openPage: openPage };
  }

  function initElementPlusApp(app) {
    var localeOpt =
      typeof ElementPlusLocaleZhCn !== 'undefined' ? { locale: ElementPlusLocaleZhCn } : {};
    app.use(ElementPlus, localeOpt);
    if (typeof ElementPlusIconsVue !== 'undefined') {
      for (var key in ElementPlusIconsVue) {
        if (Object.prototype.hasOwnProperty.call(ElementPlusIconsVue, key)) {
          app.component(key, ElementPlusIconsVue[key]);
        }
      }
    }
    return app;
  }

  global.SharedShell = {
    findActiveMenuId: findActiveMenuId,
    formatMessageTime: formatMessageTime,
    createMessageCenter: createMessageCenter,
    createPortalVisibility: createPortalVisibility,
    createSidebarState: createSidebarState,
    initElementPlusApp: initElementPlusApp,
  };
})(typeof window !== 'undefined' ? window : this);
