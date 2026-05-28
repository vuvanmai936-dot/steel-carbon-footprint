# `js/mocks/` — Mock 数据"逻辑包"

> **现状**：原型仓库的 Mock 数据按 IIFE-style 全局脚本通过 `<script src>` 在 50+ HTML 页加载。本目录暂**不物理移动**这些文件（避免一次性改动近百个 HTML 引用），仅以"逻辑包"形式集中说明组成、互依与使用边界。物理迁移到本目录留待后续与开发环境对齐时再做。

## 1. 文件组成（按"域"）

| 域 | 文件（实际路径） | 提供的全局接口（节选） | 主要消费方 |
|----|------------------|------------------------|------------|
| 任务 / 订单 / 模板 Snapshot | [`../mockTasks.js`](../mockTasks.js) | `getMockTask`、`MOCK_TASK_MAP`、`getStageLabel`、`getStageStatusText`、`resetGoldenDemoTaskState`、`getSupplierTaskList`、`getOperatorTaskList`、模板/采集 Snapshot 持久化 | 三端任务列表与详情页、模板详情、订单页 |
| 运营端报告 | [`../mockOperator.js`](../mockOperator.js) | `getReportList`、`MOCK_REPORTS`、`resetGoldenDemoState`、下发/确认接收/申诉的 Mock 回写 | `operator/report_mgt.html`、`operator/report_detail.html`、`supplier/reports.html`、`prototype/flows/golden_5min.html` |
| 用户级消息 | [`../mockMessages.js`](../mockMessages.js) | `getMyMessages`、`markRead`、`markAllRead`、`getUnreadCount`，消息类型枚举 | 顶栏消息中心（`js/layout.js`、`js/supplierLayout.js`、`js/certifierLayout.js`）、各端消息中心抽屉 |
| 任务澄清 / 驳回 / 异议 | [`../mockClarifications.js`](../mockClarifications.js) | `getClarifications`、`createClarification`、`appendMessage`，会话/参与方/subjectType | 任务详情「沟通」Tab、`supplier/task_clarify.html`、运营/认证侧澄清弹窗 |

> 三端布局脚本（`js/layout.js`、`js/supplierLayout.js`、`js/certifierLayout.js`）会**软依赖**消息 Mock：未加载时降级为空实现，不报错。

## 2. 互依关系（不要破坏的硬约束）

- `mockOperator.js` 中的报告 `taskNo` **必须在** `mockTasks.js` 的 `MOCK_TASK_MAP` 中存在；否则报告列表会跳到不存在的任务。
- `mockMessages.js` / `mockClarifications.js` 中的 `relatedId`（taskId / reportId）应当能在 `mockTasks.js` 或 `mockOperator.js` 中查到；新增 Mock 用例请同步三方。
- 报告状态变更（下发/确认接收/申诉）只在 `mockOperator.js` 的 `MOCK_REPORTS` 上回写；任务阶段（`stageIndex` 4 子状态）由 `mockTasks.js` 单独维护，二者由"报告全流程在报告管理"语义而非数据反向驱动。详见 [`docs/01_业务与流程/04_任务调度与状态机.md`](../../docs/01_业务与流程/04_任务调度与状态机.md)。

## 3. 加载顺序约定

各 HTML 页通常按以下顺序加载，缺一会让顶栏消息/澄清按钮"假装空"但不报错：

```html
<script src="../js/mockTasks.js"></script>
<script src="../js/mockOperator.js"></script>      <!-- 仅运营端用到报告时 -->
<script src="../js/mockMessages.js"></script>
<script src="../js/mockClarifications.js"></script>
<script src="../js/layout.js"></script>            <!-- 或 supplierLayout / certifierLayout -->
```

## 4. 与开发环境（六仓）的关系

本目录及其下 Mock 仅服务于**演示原型**；实际 API 契约请见 [`docs/02_功能与对接/11_接口与互操作设计（实施期）.md`](../../docs/02_功能与对接/11_接口与互操作设计（实施期）.md) §7「最小 OpenAPI 片段」。开发仓在替换 Mock 时优先以 OpenAPI 与 [`docs/SoT_MAP.md`](../../docs/SoT_MAP.md) 为准，本 Mock 仅供字段示例参考。

## 5. 后续物理迁移计划（不在本期）

待与六仓 fe 团队对齐演示策略后，可一次性：

1. `git mv js/mockTasks.js js/mocks/tasks.js`（其余三份同理改名）。
2. 全仓批量替换 `<script src="../js/mockTasks.js">` → `<script src="../js/mocks/tasks.js">`。
3. 同步 [`docs/02_功能与对接/07_Mock数据说明.md`](../../docs/02_功能与对接/07_Mock数据说明.md)、[`docs/SoT_MAP.md`](../../docs/SoT_MAP.md) 与 [`scripts/sync-help-from-doc.js`](../../scripts/sync-help-from-doc.js) 的硬编码路径。
4. 在 [`docs/00_迭代计划/设计变更记录.md`](../../docs/00_迭代计划/设计变更记录.md) 登记一行"Mock 物理迁移"。
