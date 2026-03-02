# Mock 数据说明

本文档说明原型阶段使用的 Mock 订单号/任务号规则及对应关系，便于产品与开发对齐，后续接口对接时可据此替换。

## 1. 状态枚举（与 02 全局数据字典一致）

### 订单状态 (Order Status)
| 状态值 | 描述 |
|--------|------|
| `UNPAID` | 待支付 |
| `PAID` | 已支付 |
| `CONFIRMED` | 已确认 |
| `COMPLETED` | 已完成 |

### 任务状态 (Task Status)
| 状态值 | 描述 |
|--------|------|
| `CONFIG` | 待配置 |
| `COLLECT` | 待填报 |
| `AUDIT` | 待审核（采集阶段子状态） |
| `CALC` | LCA 计算（独立系统，当前南钢部署；当前手工摆渡，后续预留接口对接） |
| `VERIFY` | 核查中 |
| `CERTIFIED` | 已发证 |

## 2. 编号规则

* **订单号**：`ORD-YYYYMMDD-XXX`（如 ORD-20260203-001）。
* **任务号**：`TSK-YYYY-NNN`（如 TSK-2026-888）。自营任务、订单子任务、委托任务列表 Mock 均共用此规则，便于从订单→任务列表→任务详情链路 ID 一致。

## 3. 主要 Mock 订单与任务对应关系

| 订单号 | 订单状态 | 子任务 taskId | 产品/说明 |
|--------|----------|---------------|-----------|
| ORD-20260203-001 | CONFIRMED | TSK-2026-888, TSK-2026-889, TSK-2026-890 | 超高功率/普通功率石墨电极、接头 |
| ORD-20250315-099 | COMPLETED | TSK-2025-101 | 热轧卷板 |
| ORD-20260205-002 | PAID | TSK-2026-892 | HRB400E 螺纹钢 |
| ORD-20260110-008 | CONFIRMED | TSK-2026-870 | 中厚板 |
| ORD-20251212-015 | CONFIRMED | TSK-2025-999 | 汽车结构钢 |

## 4. 共享 Mock 任务表（task_detail_* 使用）

任务详情页通过 `js/mockTasks.js` 中的 `MOCK_TASK_MAP` 按 URL 参数 `taskId` 加载任务信息（订单号、产品名、规格、供应商）。表中 key 为 taskId，与上表子任务一致；订单号与订单 Mock 一致，便于从订单→任务列表→任务详情链路可追溯。

## 5. 报告 Mock 与订单→任务→报告串联

运营端报告数据由 **`js/mockOperator.js`** 提供，与订单、任务共用同一套 **taskId/orderNo**。

* **数据源**：`MOCK_REPORTS`（数组），每条报告的 **taskNo = 任务 taskId**，仅包含「待归档 / 已归档」阶段（stageIndex 5 或 6，任务列表 7 段：0 配置 / 1 采集 / 2 计算 / 3 核查 / 4 下发 / 5 待归档 / 6 已归档）对应的任务，便于从任务列表「查看档案」跳报告详情时能命中同一条档案。
* **使用约定**：
  * `operator/report_mgt.html`：报告列表初始数据来自 `MOCK_REPORTS`（深拷贝后写入 `reportList`）。
  * `operator/report_detail.html`：根据 URL 参数 `taskNo` 在 `MOCK_REPORTS` 的副本中查找当前档案；无 taskNo 或未命中时展示「未找到该档案」。

### 5.1 报告 taskNo 与订单/任务对应关系

| taskNo（报告） | orderNo | productName | supplierName | 报告状态示例 |
|----------------|---------|-------------|--------------|--------------|
| TSK-2025-101   | ORD-20250315-099 | 热轧卷板     | 南京钢铁集团 | 已归档、申诉中 |
| TSK-2025-999   | ORD-20251212-015 | 汽车结构钢   | 马钢股份     | 流转中       |
| TSK-2026-888   | ORD-20260203-001 | 超高功率石墨电极 | 南通碳素有限公司 | 已作废     |

上述 taskNo 与 `MOCK_TASK_MAP`、订单子任务、自营/委托任务列表中的 taskId 一致，保证 **订单详情 → 任务列表 → 报告管理 → 报告详情** 全链路可串联验证。

## 6. 模板与任务 Snapshot Mock

任务配置、供应商填报、采集审核等页使用 **SpreadJS** 展示模板/采集表，数据来自 Snapshot。`js/mockTasks.js` 提供以下 Mock 函数：

| 函数 | 说明 | 使用页面 |
|------|------|----------|
| `getTemplateSnapshot(templateId)` | 返回模板 Snapshot（version、templateId、sheetData、evidenceRequirements） | task_detail_config（选模板后实例化） |
| `getTaskSnapshot(taskId)` | 返回任务实例 Snapshot（含 taskId，基于模板） | task_fill、task_detail_collect |

Snapshot 格式参见 `docs/05_模板引擎解析逻辑.md` 第四节。后续对接时需替换为：

* `getTemplateSnapshot(templateId)` → `GET /api/templates/{id}/snapshot`
* `getTaskSnapshot(taskId)` → `GET /api/tasks/{id}/snapshot`
* `saveTaskSnapshot(taskId, snapshot)` → `PUT /api/tasks/{id}/snapshot`（任务配置保存/下发）
* `submitTaskData(taskId, snapshot, evidenceFiles)` → `POST /api/tasks/{id}/submit`（供应商提交）

## 7. 供应商/认证端 Mock 与推荐演示路径

### 7.1 与运营端数据对应关系

- **供应商端**：`supplier/task_list.html`、`supplier/reports.html` 等页使用的任务与报告数据，应与运营端 **MOCK_TASK_MAP**、**MOCK_REPORTS**（及订单 Mock）共用同一套 **taskId / orderNo / taskNo**。供应商待办任务列表可按 taskType（待填报/采集已驳回/待澄清）从 MOCK_TASK_MAP 派生；报告列表仅展示运营已下发的报告，与 report_mgt 下发记录、report_detail 的 taskNo 一致。
- **认证机构端**：`certifier/task_list.html` 待核查任务列表中的 taskId/orderNo 与运营端任务管理中处于「核查」阶段（VERIFY）的任务一致；任务详情 `certifier/task_detail.html?taskId=xxx` 与运营端 task_detail_verify 协作日志、报告管理中的同一任务可互相追溯。

### 7.2 推荐演示路径（评审走通闭环）

| 路径 | 说明 | 关键 ID |
|------|------|----------|
| 订单 → 任务 → 任务详情 | 运营端：订单管理选订单（如 ORD-20260203-001）→ 确认并分配任务 → 任务管理（自营/委托）→ 点击任务进入对应 task_detail_* | orderNo, taskId（如 TSK-2026-888） |
| 任务 → 报告管理 → 报告详情 | 运营端：任务列表阶段 4「报告」→ 跳转报告管理 → 按 taskNo 查看档案详情、下发、归档 | taskNo = taskId（如 TSK-2026-888） |
| 运营下发 → 供应商我的报告 | 运营端报告管理对某 taskNo 执行「下发」→ 供应商端「我的报告」中应出现该 taskId 对应报告，可演示预览、确认接收、我有异议 | taskNo/taskId 一致 |
| 核查阶段 ↔ 认证端 | 运营端任务处于核查阶段时，认证机构端「核查任务列表」中可展示同一 taskId；核查详情与运营端 task_detail_verify 对应 | taskId |

演示前请确认各端 Mock 数据源（或本地 Mock 数组）使用上文「3. 主要 Mock 订单与任务对应关系」「5.1 报告 taskNo 与订单/任务对应关系」中的同一批 ID，便于多角色串联验证。

## 8. 后续对接说明

* 将 `MOCK_TASK_MAP`、`MOCK_REPORTS` 与订单/任务/报告列表的 Mock 数组替换为 API 请求即可。
* 保持「订单号 / 任务号」规则与后端约定一致，便于联调。
* Snapshot 可存为 JSON/SSJSON，凭证文件单独存储，通过 taskId 关联。