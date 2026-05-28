const path = require('path');
const { defineConfig } = require('@playwright/test');

const userBrowsersPath = path.join(process.env.HOME || '', 'Library/Caches/ms-playwright');
const sandboxPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '';
if (!sandboxPath || sandboxPath.includes('cursor-sandbox-cache')) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = userBrowsersPath;
}

module.exports = defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:5175',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run sync:vendor && npm run sync:public && npm run dev -- --port 5175 --strictPort',
    url: 'http://127.0.0.1:5175/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
