# Prototype · Golden Flows

> **定位**：本目录承载**面向评审/对外的"5 分钟黄金动线"**。原型仓库其它 60+ 页只在内部走查时使用；对外演示与重要评审一律跑这里的动线。
>
> 与开发实现（`blockchain-future` 组六仓）的关系：本动线**仅用于讲清业务故事**，不与六仓功能对等；接口契约请见 [`docs/02_功能与对接/11_接口与互操作设计（实施期）.md` §7](../../docs/02_功能与对接/11_接口与互操作设计（实施期）.md)。

## 现有动线

| 文件 | 时长 | 主线 |
|------|------|------|
| [`golden_5min.html`](golden_5min.html) | 5 分钟 | 任务五段闭环（含报告下发→确认→归档） |

## 5 分钟动线脚本（与 `golden_5min.html` 一一对应）

| # | 角色 / 时间 | 页面（点击进入） | 关键动作 | 预期结果 |
|---|-------------|------------------|----------|----------|
| 0 | 起点 / 0:00 | [`/index.html`](../../index.html) → [`/pcf.html`](../../pcf.html) | 介绍 1+4 生态与"四大支柱" | 通过门户进入运营端 |
| 1 | 运营 / 0:30 | [`operator/order.html`](../../operator/order.html) | 选订单 `ORD-20260203-001` → 拆任务 → 进配置 | 任务 `TSK-2026-888` 进入 stage 0 |
| 2 | 运营 / 1:00 | [`operator/task_detail_config.html?taskId=TSK-2026-888`](../../operator/task_detail_config.html?taskId=TSK-2026-888) | 选模板 / 配置参数 / 下发 | 任务进入 stage 1（采集中） |
| 3 | 供应商 / 1:30 | [`supplier/task_list.html`](../../supplier/task_list.html) → [`supplier/task_fill.html?taskId=TSK-2026-888`](../../supplier/task_fill.html?taskId=TSK-2026-888) | SpreadJS 填报 → 提交 | 任务进入 stage 1 子状态"待审核" |
| 4 | 运营 / 2:30 | [`operator/task_detail_collect.html?taskId=TSK-2026-888`](../../operator/task_detail_collect.html?taskId=TSK-2026-888) | 采集审核 → 通过 | 任务进入 stage 2（LCA） |
| 5 | 自动 / 3:00 | （后端任务） | LCA 计算（演示态自动跳过） | 任务进入 stage 3（核查） |
| 6 | 核查机构 / 3:15 | [`certifier/task_list.html`](../../certifier/task_list.html) → [`certifier/task_detail_verify.html?taskId=TSK-2026-888`](../../certifier/task_detail_verify.html?taskId=TSK-2026-888) | 沟通 Tab 走 1 条澄清 → 通过 | 任务进入 stage 4（报告） |
| 7 | 运营 / 3:45 | [`operator/report_mgt.html`](../../operator/report_mgt.html) | 勾选报告 → 下发 | 报告子状态：已下发 |
| 8 | 供应商 / 4:15 | [`supplier/reports.html`](../../supplier/reports.html) | 预览 → 确认接收 | 报告子状态：待归档 → 已归档 |
| 9 | 终点 / 4:45 | [`operator/report_detail.html?reportId=RPT-2026-0001`](../../operator/report_detail.html?reportId=RPT-2026-0001) | 看链上凭证（VC）+ TDS 四大支柱小结 | 闭环完成 |

> **预设数据**：动线依赖 [`js/mockTasks.js`](../../js/mockTasks.js) 中的 `TSK-2026-888`（起始 stage 0 / `pending`）与 [`js/mockOperator.js`](../../js/mockOperator.js) 中的 `RPT-2026-0001`。演示推进后：在 [`golden_5min.html`](golden_5min.html) 顶栏点 **「重置演示数据」**，或访问 `?demo=reset`；亦可调用全局 `resetGoldenDemoState()`。

## 演示前检查清单

- [ ] 浏览器已开启 `localhost:5173`（`npm run dev`），或对外环境为最新 `dist/`。
- [ ] `TSK-2026-888` 在 `mockTasks.js` 中阶段为 0（若已被推进，在黄金动线页点「重置演示数据」或打开 `?demo=reset`）。
- [ ] 可选：`npm run test:e2e` 冒烟（需已 `npm install` 且 dev server 可用）。
- [ ] SpreadJS CDN 评估版可正常加载（演示环境默认可用，正式环境需采购授权）。
- [ ] 顶栏消息中心可见 1–2 条 `任务分配` 类消息，不影响主线。
- [ ] 没有控制台 JS 报错（`F12` 抽查）。

## 后续扩展（可选）

- `golden_15min.html`：在主线基础上插入"驳回澄清回流"分支；
- `golden_appeal.html`：突出申诉窗口与已归档不可申诉的边界；
- `golden_entrust.html`：擎工 SaaS 委托任务（第二阶段开始）。
