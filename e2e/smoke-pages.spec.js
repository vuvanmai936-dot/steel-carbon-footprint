// @ts-check
/**
 * 全站冒烟：Vite 入口 HTML 可打开且无致命脚本错误（Vue 未定义等）
 */
const { test, expect } = require('@playwright/test');
const { readdirSync } = require('fs');
const { join, resolve } = require('path');

const ROOT = resolve(__dirname, '..');

function collectViteHtmlRoutes() {
  const routes = [];
  const dirs = ['', 'operator', 'supplier', 'certifier', 'prototype/flows'];
  for (const dir of dirs) {
    const fullDir = join(ROOT, dir);
    let names;
    try {
      names = readdirSync(fullDir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.endsWith('.html')) continue;
      routes.push(dir ? `${dir}/${name}` : name);
    }
  }
  return routes.sort();
}

const IGNORE_CONSOLE = [
  /favicon/i,
  /Failed to load resource.*404/i,
  /SpreadJS/i,
  /license/i,
  /grapecity/i,
  /DevTools/i,
];

function isIgnoredConsole(text) {
  return IGNORE_CONSOLE.some((re) => re.test(text));
}

const ROUTES = collectViteHtmlRoutes();

test.describe('全站页面冒烟', () => {
  for (const route of ROUTES) {
    test(`可打开: ${route}`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !isIgnoredConsole(msg.text())) {
          errors.push(msg.text());
        }
      });

      const res = await page.goto('/' + route, { waitUntil: 'networkidle' });
      expect(res && res.ok(), `${route} 应返回 2xx`).toBeTruthy();

      const needsVue = route !== 'index.html' && !route.includes('golden_5min');
      if (needsVue) {
        await page.waitForFunction(() => typeof window.Vue !== 'undefined', null, {
          timeout: 15_000,
        });
      }

      const fatal = errors.filter(
        (e) =>
          /Vue is not defined|ElementPlus is not defined|createApp is not defined/i.test(e) ||
          /Unexpected token|SyntaxError/i.test(e)
      );
      expect(fatal, `控制台致命错误 @ ${route}:\n${fatal.join('\n')}`).toEqual([]);
    });
  }
});

test.describe('关键交互', () => {
  test('pcf 门户可进入运营驾驶舱', async ({ page }) => {
    await page.goto('/pcf.html');
    await expect(page.locator('.l3-with-entry')).toBeVisible();
    await page.locator('.l3-with-entry').click();
    await page.waitForURL(/operator\/dashboard\.html/, { timeout: 10_000 });
  });

  test('黄金动线页可纵向滚动', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/prototype/flows/golden_5min.html', { waitUntil: 'networkidle' });
    const metrics = await page.evaluate(() => {
      const el = document.scrollingElement || document.documentElement;
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTop = maxScroll;
      return { maxScroll, scrollTop: el.scrollTop };
    });
    expect(metrics.maxScroll).toBeGreaterThan(80);
    expect(metrics.scrollTop).toBeGreaterThan(0);
  });

  test('运营驾驶舱 #app 已挂载', async ({ page }) => {
    await page.goto('/operator/dashboard.html');
    const mounted = await page.evaluate(() => {
      const el = document.querySelector('#app');
      return !!(el && el.children.length > 0);
    });
    expect(mounted).toBe(true);
  });
});
