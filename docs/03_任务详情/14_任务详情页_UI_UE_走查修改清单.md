# 任务详情页 UI / UE 走查修改清单

**依据**：[UI_UE_任务详情页全局审查提示词](UI_UE_任务详情页全局审查提示词.md)  
**范围**：运营端 `task_detail_*.html`、认证端 `certifier/task_detail*.html`、供应商端 `supplier/task_stage_*.html`，及共享资源 [`css/task_detail.css`](../../css/task_detail.css)、[`css/task_detail_refactor.css`](../../css/task_detail_refactor.css)、[`js/taskDetailLayout.js`](../../js/taskDetailLayout.js)。  
**方法**：静态代码与结构对照（2026-05-09）；未做浏览器像素级验收。  
**统计**：P0 0 条 · P1 5 条 · P2 6 条 · P3 4 条（归纳后）

---

## 一、总览

| 类别 | 数量 | 说明 |
|------|------|------|
| P0 | 0 | 未发现提示词中「底栏盖住侧栏、主流程不可操作」类确定问题（未做真机 fixed 底栏全量扫描） |
| P1 | 5 | 阶段条/顶区骨架不一致、认证端报告页脱离统一模板等 |
| P2 | 6 | 面包屑可点性、重构样式未收敛、TDS 长文案等 |
| P3 | 4 | 废弃页、示例页、模板文件、无障碍细节 |

---

## 二、跨页面归纳问题（优先处理）

### U1 — 配置阶段阶段条与其它运营页不一致（UI · **P1**）

- **现象**：[`operator/task_detail_config.html`](../../operator/task_detail_config.html) 使用自定义 `.config-stage-bar`（分段线 + `stage-item`），其余运营阶段页使用 `el-steps` + `.task-stage-steps`（如 [`task_detail_collect.html`](../../operator/task_detail_collect.html)）。
- **影响**：配置页与其它阶段的视觉层级、可点击跳转行为、维护成本不一致。
- **建议**：将配置页顶区改为与 `task_detail_collect` 相同的 `task-detail-unified__top` + `el-steps` + `task-stage-steps`，阶段跳转逻辑复用既有 `goStage` 模式；或保留自定义条但需在 `task_detail.css` 中明确与 `el-steps` 的间距/字重 token 对齐（次选）。

### U2 — 认证机构「报告阶段」页缺少统一步骤条与任务信息区（UI / UE · **P1**）

- **现象**：[`certifier/task_detail_certify.html`](../../certifier/task_detail_certify.html) 仅为 `el-result` + 按钮，无 `el-steps`、无 `task-info-dashboard`，与 [`certifier/task_detail_verify.html`](../../certifier/task_detail_verify.html) 等页差异大。
- **影响**：用户在阶段间跳转缺少一致锚点；与 `TaskDetailLayout.getStageSteps` 仅两阶段（verify/report）的叙事不矛盾，但**页面骨架**未统一。
- **建议**：为 `task_detail_certify` 增加与其它认证详情页一致的顶栏（面包屑保留）+ 两格步骤条 + 精简任务摘要（taskId 只读），再放置 `el-result` 说明文案。

### U3 — 重构骨架与样式仅停留在示例页（UE · **P1**·已归档治理）

- **现象**：原 `operator/task_detail_collect_refactor_example.html` 引入 `task_detail_refactor.css`、`el-page-header`、`task-detail-scroll-body`；正式 [`task_detail_collect.html`](../../operator/task_detail_collect.html) 仍用 `task-detail-unified` + `task_detail.css`。
- **2026-05-09 处置**：示例页与样式已迁入 [`docs/_archive/refactor_example/`](../_archive/refactor_example/)；后续若需推进重构，请在 [`12_任务详情页统一实施方案`](12_任务详情页统一实施方案.md) 中明确里程碑后再恢复。

### U4 — 供应商阶段页与 `taskDetailLayout.js` 未统一接入（UE · **P2**）

- **现象**：[`supplier/task_stage_config.html`](../../supplier/task_stage_config.html) 等页内手写 `stageSteps` 数组，未引用 `TaskDetailLayout.getStageSteps`；采集步跳转指向 `task_fill.html` 而非对称的 `task_stage_*` 命名（可能为业务刻意）。
- **影响**：阶段 href 与运营端 `operatorFiles` 映射重复维护，易出现 taskId 查询串或阶段顺序不一致。
- **建议**：至少统一由 `taskDetailLayout.js` 生成步骤列表（传入 `basePath: 'supplier'` 与自定义 `fileMap`），或在 06 文档中写明「供应商采集入口必须为 task_fill」的单一事实来源。

### U5 — 面包屑「任务管理」不可点 vs 供应商「我的任务」可点（UE · **P2**）

- **现象**：运营采集页面包屑为纯文本「任务管理」（[`task_detail_collect.html`](../../operator/task_detail_collect.html) L66-67）；供应商端「我的任务」为链接（[`task_stage_config.html`](../../supplier/task_stage_config.html) L57）。
- **影响**：同构任务流下，运营侧返回列表路径依赖左上角圆形返回，发现性略弱。
- **建议**：为「任务管理」增加指向 `self_operated_task_list.html`（或委托列表）的 `el-breadcrumb-item` 链接，与供应商一致。

---

## 三、按文件的问题清单

### 运营端

| 文件 | 类型 | 级别 | 现象 / 建议 |
|------|------|------|-------------|
| `operator/task_detail_config.html` | UI | P1 | 见 U1 |
| `operator/task_detail_collect.html` | UE | P2 | 见 U5；主内容区已用 `task-detail-unified` + `padding-bottom` 由内部滚动区承担，需对照长页面是否所有 Tab 内滚动区均有足够底部留白（与提示词 ≥72px 对齐） |
| `operator/task_detail_lca.html` | UI | P2 | 与 collect/verify 统一为 `task-detail-unified__top` 时核对 `task-info-dashboard` 与步骤条间距是否与其它页一致（抽查结构已接近） |
| `operator/task_detail_verify.html` | UI | P2 | `verify-tab-sidebar` 底区为 `panel-footer`，确认窄屏下 TDS/长按钮折行策略；原 `task_detail_refactor.css` 已归档至 [`_archive/refactor_example/`](../_archive/refactor_example/)，可作历史参考 |
| `operator/task_detail_certify.html` | UE | P2 | 「报告」阶段在业务上跳转报告管理，步骤条最后一项点击行为需在页内说明（避免用户以为仍在任务详情完成归档） |
| ~~`operator/task_detail_collect_refactor_example.html`~~ | — | 已归档 | 已迁至 [`_archive/refactor_example/`](../_archive/refactor_example/) |
| ~~`operator/task_detail.html`~~ | — | 已删除 | 仅为废弃跳转页，2026-05-09 物理删除（详情请用各阶段 `task_detail_*.html` 直接进入） |

### 认证机构端

| 文件 | 类型 | 级别 | 现象 / 建议 |
|------|------|------|-------------|
| `certifier/task_detail_certify.html` | UI / UE | P1 | 见 U2 |
| `certifier/task_detail.html` | UI | P2 | 含 `task-info-dashboard__actions`、独立 `__tds` 行，与运营端 `task-info-dashboard__row` 结构不同；评估是否收敛为同一 BEM 块，减少 CSS 分支 |
| `certifier/task_detail_verify.html` | UI | P2 | 与运营 verify 对照：右栏协作日志高度、`min-height: 0` 是否满足 flex 不撑破视口 |

### 供应商端

| 文件 | 类型 | 级别 | 现象 / 建议 |
|------|------|------|-------------|
| `supplier/task_stage_*.html` | UE | P2 | 见 U4、U5；HTML 注释声明 Deprecated 迁移方向，需在迭代中落实或移除误导 |
| `supplier/task_stage_config.html` | UE | P3 | 已使用 `aria-label` 于返回与侧栏折叠，可作为其它端对照样本 |

### 共享资源

| 文件 | 类型 | 级别 | 现象 / 建议 |
|------|------|------|-------------|
| `js/taskDetailLayout.js` | UE | P2 | `initRightPanel` 较薄，各页右栏标题仍不统一（如「澄清与日志」vs Tab 文案）；建议与 [`19_驳回澄清与消息实施方案`](../04_澄清与消息/19_驳回澄清与消息实施方案.md) 对齐命名 |
| `css/task_detail.css` | UI | P2 | `.task-detail-scroll-body` 已设 `padding-bottom: 80px`；凡未使用该类的吸底页需逐页补齐 |
| ~~`css/task_detail_refactor.css`~~ | — | 已归档 | 已迁至 [`_archive/refactor_example/`](../_archive/refactor_example/) |

### 其它

| 文件 | 类型 | 级别 | 说明 |
|------|------|------|------|
| ~~`task_detail_template.html`~~ | — | 已归档 | 已迁至 [`_archive/`](../_archive/) |

---

## 四、UE 专项（导航 / 反馈 / 文案 / a11y）

| 编号 | 级别 | 说明 |
|------|------|------|
| E1 | P2 | **提交防重复**：采集/审核/核查通过驳回等主按钮在 `loading` 态下应 `disabled`（各页 script 需抽样验证） |
| E2 | P2 | **澄清 Tab 文案**：统一「澄清与日志」与 Badge 规则（0 未读隐藏），与提示词 4.2 一致 |
| E3 | P3 | **可访问性**：关键图标按钮补充 `aria-label`（运营侧栏折叠部分页已有，认证端抽查补齐） |
| E4 | P3 | **演示角色**：顶栏可增加轻量「原型 · 未登录」提示，降低评审对权限的误解（与综合分析结论一致） |

---

## 五、建议执行顺序（给开发）

1. **P1**：U1（配置页阶段条）→ U2（认证报告页骨架）→ U3（refactor 与主 collect 路线决策文档 + 代码收敛）。  
2. **P2**：U5、U4、E1、E2 及按文件表中 P2 项。  
3. **P3**：示例/废弃页治理、模板同步、a11y 与演示角标。

---

## 六、关联文档

- [UI_UE_任务详情页全局审查提示词](UI_UE_任务详情页全局审查提示词.md)
- [12_任务详情页统一实施方案](12_任务详情页统一实施方案.md)
- 历史背景：[`_archive/legacy_docs/任务详情页采集页审查与修改方案.md`](../_archive/legacy_docs/任务详情页采集页审查与修改方案.md)、[`_archive/legacy_docs/模板配置页优化说明.md`](../_archive/legacy_docs/模板配置页优化说明.md)、[`_archive/legacy_docs/任务详情页文件与样式说明.md`](../_archive/legacy_docs/任务详情页文件与样式说明.md)
