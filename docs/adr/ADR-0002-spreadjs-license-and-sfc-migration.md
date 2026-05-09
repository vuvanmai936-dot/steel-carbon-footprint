# ADR-0002: SpreadJS 正式 License 与按需 SFC 迁移

- **状态**：Proposed
- **日期**：2026-05-09
- **作者**：产品经理（孙抗峰）
- **影响仓**：`pcf-center-fe`、`pcf-supplier-fe`、`pcf-audit-fe`、原型仓 0209

## 1. 背景

当前原型与（推测）六仓 fe 仍使用 **GrapeCity SpreadJS 16.x CDN 评估版**，仅适用于本地/内网演示，正式部署会出现授权告警与功能限制。同时，原型采用"原生 JS + Vue 3 全局构建"，在表格/表单/对话框等组件复用度提升后，**单文件组件（SFC）**的工程收益开始大于"零构建"的便利。

阻塞 PCF 系统正式上线的两件事一并讨论：

- **SpreadJS 商业授权**：未确认采购的 SKU、采购方与许可文件的存放/分发方式。
- **SFC 化时机**：是否把高复用组件（任务条 / 沟通 Tab / 报告卡 / SpreadJS Wrapper）迁到 Vue SFC + Vite 编译。

## 2. 决策（提案）

两件事**绑定**推进：在 `prototype/flows/` 与高复用组件第一次成规模重写时，**同时**采购 SpreadJS 授权与启用 SFC：

- **SpreadJS**：以"上线一个生产版本"为前置条件，采购对应 SKU；License 字符串以**环境变量 / 服务端注入**而非硬编码到 JS。
- **SFC**：把以下组件迁到 SFC，新仓页面以 SFC 起步：
  - `SpreadWrapper`：包装 spreadUtils.js 的初始化、Snapshot 加载/导出、license 注入。
  - `TaskInfoBar`、`StageStepper`、`CommunicationTab`、`ReportCard`：现有 `js/taskDetailLayout.js` 中重复结构。
- 原型仓继续保留 60+ 静态页用于内部走查；新增页面与"黄金动线"页面优先用 SFC。

## 3. 备选方案

| 方案 | 优点 | 缺点 | 评价 |
|------|------|------|------|
| A. 立即采购 + 全量 SFC 重写 | 一步到位 | 投入大、停机风险高 | 不可取（与"渐进迁移"原则冲突） |
| B. 仅采购 SpreadJS，不动组件结构 | 解锁正式上线 | 重复代码继续累积 | 短期可，长期不利 |
| C. 仅 SFC，不采购授权 | 工程整洁度提升 | 无法上生产 | 不可取 |
| D. 绑定推进（本提案） | 节省一次组件重写、对外有清晰里程碑 | 需要商务 + 技术联动 | **倾向采纳**；待商务/技术确认 |

## 4. 采纳后的影响

- **采购**：商务/法务确定 SKU 与年度许可方式。
- **代码**：六仓 fe 引入 Vite 多页 + SFC 编译；SpreadJS license 通过启动配置注入。
- **设计**：[`docs/02_功能与对接/05_模板引擎解析逻辑.md`](../02_功能与对接/05_模板引擎解析逻辑.md) 第 7 节"部署检查清单"补充 license 注入约定；[`README.md`](../../README.md)「生产部署前检查」段同步更新。
- **不在范围**：是否把原型仓与六仓 fe 合并；是否引入其它表格库（Handsontable、AG Grid 等）。

## 5. 后续追踪

| # | 行动项 | 责任人 | 截止 | 状态 |
|---|--------|--------|------|------|
| A1 | 商务侧完成 SpreadJS 授权 SKU、采购方式与时间表确认 | 商务 | 待定 | 待启动 |
| A2 | 技术侧出 `SpreadWrapper` SFC 试点（在 `pcf-center-fe`） | center fe 负责人 | 待定 | 待启动 |
| A3 | 与本 ADR 一并复议：是否把原型仓 60+ 页"冻结"，仅维护 `prototype/flows/` | 产品 | 商务/技术确认后 | 待启动 |

## 6. 参考

- [`docs/02_功能与对接/05_模板引擎解析逻辑.md` §7](../02_功能与对接/05_模板引擎解析逻辑.md)
- [`README.md`「生产部署前检查」](../../README.md)
- [ADR-0001](ADR-0001-three-layer-separation-and-sot.md)
