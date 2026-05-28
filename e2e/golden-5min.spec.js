// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('黄金动线', () => {
  test('动线页可打开且含关键步骤', async ({ page }) => {
    await page.goto('/prototype/flows/golden_5min.html');
    await expect(page).toHaveTitle(/5 分钟黄金动线/);
    await expect(page.getByRole('heading', { name: /5 分钟黄金动线/ })).toBeVisible();
    await expect(page.locator('.meta')).toContainText('TSK-2026-888');
    await expect(page.getByRole('button', { name: '重置演示数据' })).toBeVisible();
  });

  test('?demo=reset 将 TSK-2026-888 恢复为 stage 0', async ({ page }) => {
    await page.goto('/prototype/flows/golden_5min.html?demo=reset');
    const task = await page.evaluate(function () {
      if (typeof getTaskByTaskId !== 'function') return null;
      return getTaskByTaskId('TSK-2026-888', 0);
    });
    expect(task).not.toBeNull();
    expect(task.stageIndex).toBe(0);
    expect(task.stageSubStatus).toBe('pending');
  });

  test('报告 RPT-2026-0001 可经 reportId 打开详情', async ({ page }) => {
    await page.goto('/prototype/flows/golden_5min.html?demo=reset');
    await page.goto('/operator/report_detail.html?reportId=RPT-2026-0001');
    await expect(page.locator('text=TSK-2026-888').first()).toBeVisible();
  });
});
