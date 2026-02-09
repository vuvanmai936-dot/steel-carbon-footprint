# 钢铁行业产业链碳足迹数据服务系统（前端原型）

本仓库为“钢铁行业产业链碳足迹数据服务系统”的 **前端原型工程**，用于产品方案评审、交互演示和需求对齐。  
当前形态为 **多页面静态站点**，基于 `Vue 3` 与 `Element Plus`（CDN 引入），涵盖运营管理端、供应商工作台、认证机构工作台等角色视角。

## 技术栈与工程化

- **前端框架**：Vue 3（全局构建版本，通过 CDN 引入）
- **UI 组件库**：Element Plus（CDN 引入）
- **构建与开发服务器**：Vite
- **语言**：原型阶段使用原生 JavaScript 和 HTML/CSS

## 目录结构

> 仅列出主要目录与文件，方便快速认知。

- `index.html`：系统门户页，入口路由到各角色子系统
- `operator/`：运营管理端相关页面（任务管理、模板管理、治理配置等）
- `supplier/`：供应商工作台相关页面
- `certifier/`：认证机构工作台相关页面
- `css/`：全局与角色样式
  - `common.css`：全局基础样式
  - `operator.css` / `supplier.css` / `certifier.css` 等：按角色划分的样式
- `public/`：构建时原样拷贝到 `dist/` 的静态资源
  - `js/layout.js`：通用布局与导航相关逻辑
  - `js/utils.js`：通用工具函数
  - 其他图片、字体等也可放于此目录
- `docs/`：业务与数据设计文档
  - `00_全局数据字典与枚举.md`
  - `01_订单管理逻辑.md`
  - `02_任务调度与状态机.md`
  - `03_模板引擎解析逻辑.md`
- `vite.config.js`：Vite 多页面构建配置（根目录 + operator / supplier / certifier 下所有 HTML 均为入口）
- `package.json`：npm 依赖与脚本配置
- `.gitignore`：git 忽略规则

> 后续可按需新增：`src/`（抽离复用逻辑）等目录，以支撑更深入的工程化与组件化改造。

## 本地开发与预览

### 环境要求

- Node.js：建议 ≥ 18.x
- 包管理工具：默认使用 `npm`（也可根据团队习惯改用 pnpm / yarn）

### 安装依赖

```bash
npm install
```

### 启动本地开发服务器

```bash
npm run dev
```

默认会启动 Vite 开发服务器，你可以在浏览器中访问提示的本地地址，例如：

- 门户页：`http://localhost:5173/`
- 运营端任务列表（示例）：`http://localhost:5173/operator/self_operated_task_list.html`

> 当前页面主要依赖 CDN 脚本与本地 CSS/JS 文件，Vite 主要用于提供本地开发服务器与静态构建能力，不改变现有访问路径。

### 构建与预览生产版本

```bash
npm run build
npm run preview
```

- 构建产物输出到 `dist/` 目录（包含所有多页面 HTML、CSS 与 public 下静态资源）
- `npm run preview` 会基于构建结果启动本地静态服务器，方便进行上线前自测
- **部署**：将 `dist/` 目录整体上传至任意静态托管（如 Nginx、对象存储、GitHub Pages 等）即可对外访问；若部署在子路径，需在 `vite.config.js` 中设置 `base: '/你的子路径/'`

## 版本控制与协作建议

- 建议在本地执行 `git init` 初始化仓库（如有权限问题，可在本机手动执行）
- 使用有意义的提交信息，例如：
  - `chore: 初始化前端工程基础结构`
  - `feat: 新增运营端任务列表页面原型`
  - `style: 调整门户页视觉样式`

## 阶段二改造说明（已做）

- **公共基础样式**：`html, body, #app` 全高布局与 `[v-cloak]` 已移入 `css/common.css`，运营端各页不再重复写。
- **统一 Vue 启动**：运营端所有页面改为通过 `runOperatorApp(component)` 启动（在 `public/js/layout.js` 中定义），内部统一完成 `createApp`、`initApp`（Element Plus + 图标）、`mount('#app')`；若页面已引入 Element 中文包脚本，会自动使用中文。
- **效果**：改菜单、改通用布局或启动逻辑时，只需改 `public/js/layout.js` 或 `css/common.css`，各页脚本更短、维护成本更低。

## 后续工程化升级规划（建议）

以下内容暂未在当前阶段实施，可作为后续迭代方向：

- **代码质量**：引入 ESLint + Prettier，统一 JavaScript/CSS 代码风格
- **模块化与组件化**：逐步将重复布局（导航栏、侧边栏、列表卡片等）抽离为独立组件，按需引入 Vue 单文件组件（SFC）
- **类型与可维护性**：在合适时机引入 TypeScript，完善关键领域模型（订单、任务、报告、模板等）的类型定义
- **测试与 CI**：为关键业务流程增加端到端测试（如 Playwright/Cypress），并在 CI 流水线中集成构建检查

当前仓库的目标是：**在不打扰业务原型体验的前提下，完成基础工程化搭建，为后续正式研发与持续演进打好地基。**

