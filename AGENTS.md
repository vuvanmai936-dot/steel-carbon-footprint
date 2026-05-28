# AI 与自动化协作说明

本仓库在 **`.cursor/rules/`** 下维护 Cursor 项目规则（`.mdc`），用于约束技术栈、多页 Vite 结构、Vue3 CDN + Element Plus、SpreadJS 16、Mock 任务数据及文档与状态机一致性。

- 规则目录：[`.cursor/rules/`](.cursor/rules/)
- 人类可读总览仍以根目录 [`README.md`](README.md) 为准。

## 方法论与插件（Superpowers）

- **业务与状态**：以 `.cursor/rules/` 与 `docs/`（尤其 `docs/01_业务与流程/04_任务调度与状态机.md`）、`js/mockTasks.js` 为准。
- **开发流程**：使用官方 [Superpowers](https://github.com/obra/superpowers) 插件（brainstorming → writing-plans → 执行 → verification），勿与已归档的 ECC 全局 skills 混用。
- **Cursor**：优先在 Agent 聊天框执行 `/add-plugin superpowers`（或插件市场搜索安装）。若市场不可用，本机已配置本地插件：`~/.cursor/plugins/local/superpowers`（指向 Claude 插件缓存 5.1.0），技能目录已链接到 `~/.cursor/skills/`。安装或链接后请 **重启 Agent 会话**。
- **Claude Code**：用户级插件 `superpowers@claude-plugins-official`（`claude plugin list` 查看）。

## 常用首条提示（复制到 Agent）

```text
本任务遵循仓库 .cursor/rules 与 docs/ 业务 SoT。
- 状态机：docs/01_业务与流程/04_任务调度与状态机.md；Mock：js/mockTasks.js
- 只改 js/layout.js，不直接改 public/js/layout.js；不确定时 npm run sync:public
- 完成前：npm run build && npm run lint；可选 npm run test:e2e（需 npx playwright install chromium）
- HTML 维护：改 CDN 块后运行 npm run patch:html；三端布局依赖 js/sharedShell.js
- 界面与注释使用简体中文
```

更完整的协作栈说明见仓库外计划文档（本地 Cursor plans）或团队 Obsidian。
