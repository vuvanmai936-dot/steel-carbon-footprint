# ADR · 架构决策记录（Architecture Decision Records）

> **替代品**：以前用 `08_PR_*` / `16_设计方案 + 17_实施方案` 这种"PR 长文"承载架构决策，结果文档越攒越厚、越来越难分辨"现行 vs 历史"。从 2026-05-09 起，**所有跨页面/跨仓的决策**用 ADR 记录；只对一个页面的细节优化继续走 [`14_走查清单`](../03_任务详情/14_任务详情页_UI_UE_走查修改清单.md) 即可。

## 文件命名

```text
docs/adr/ADR-NNNN-<kebab-case-标题>.md
```

- `NNNN`：四位序号，单调递增；从 `0001` 开始。  
- 标题用英文 kebab-case（便于 grep / URL 复制），第一行 `# ADR-NNNN: <中文标题>`。

## 状态枚举

| 状态 | 含义 |
|------|------|
| Proposed | 提案中，未达成共识；摆出选项与权衡。 |
| Accepted | 已采纳，进入或已经在实施；多人引用、不要轻改。 |
| Superseded by ADR-XXXX | 被新 ADR 取代，仍作历史保留。 |
| Rejected | 经讨论被否决；保留以避免被反复重提。 |
| Deprecated | 仍在生效但不再扩展，将被替换。 |

## 工作流

1. **新决策**：复制 [`template.md`](template.md) → `ADR-<下一个序号>-<标题>.md`，初始状态 `Proposed`，发起讨论。  
2. **达成共识**：状态改为 `Accepted`；同时在 [`docs/00_迭代计划/设计变更记录.md`](../00_迭代计划/设计变更记录.md) 追加一行；如涉及 SoT 文档，同步回写。  
3. **被替代**：旧 ADR 状态改为 `Superseded by ADR-XXXX`，新 ADR 顶部 `## 1. 背景` 引用旧 ADR；不删除历史。  
4. **不在 ADR 里反复辩论**：决策已 `Accepted` 后，正向推进；如要推翻，开新 ADR 而非编辑旧 ADR。

## 现有 ADR

| 序号 | 标题 | 状态 |
|------|------|------|
| [ADR-0001](ADR-0001-three-layer-separation-and-sot.md) | 设计 SoT × 可演示原型 × 开发实现 三层分离 | Accepted |
| [ADR-0002](ADR-0002-spreadjs-license-and-sfc-migration.md) | SpreadJS 正式 License 与按需 SFC 迁移 | Proposed |
