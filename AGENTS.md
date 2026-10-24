# AGENTS.md

面向 AI 编码代理的项目规范。开始任何任务前必须先读本文件，再读 [PRD.md](./PRD.md) 与 [TECH_DESIGN.md](./TECH_DESIGN.md)。

## 0. 优先级与当前状态

**规则优先级**：用户当前指令 > 本文件 > TECH_DESIGN.md > PRD.md。冲突时以优先级高者为准，并在回复中说明冲突点。

**当前仓库状态**：

- React 18 + TypeScript + Vite 6 + Tailwind CSS 3.4 已就绪，MVP 功能已实现（搜索、定位、当前天气、5 天预报、收藏、加载/错误态、响应式主题）。
- 已存在 `src/api`、`src/hooks`、`src/components`、`src/lib`、`src/App.tsx`、`.env.local`（已忽略）。
- 单元测试工具链（Vitest/RTL/MSW）尚未接入，`npm run test` 暂不可用。
- 未经用户明确要求，**不得**新增依赖或改动已实现范围外的功能。
- 需求变更时先改文档，再改代码；不允许代码与文档长期不一致。

## 1. 技术栈（锁定）

| 项 | 选型 |
| --- | --- |
| 框架 | React 18 + TypeScript 5（strict） |
| 构建 | Vite 6 |
| 服务端状态 | 自研 Hooks（`useWeather`），不引入请求缓存库 |
| 样式 | Tailwind CSS 3.4 + CSS 变量 |
| 测试 | 未接入（后续计划 Vitest + React Testing Library + MSW） |
| 质量 | ESLint |
| 数据源 | OpenWeatherMap Current Weather + 5 Day / 3 Hour Forecast（同一 API Key） |
| 本地能力 | 浏览器 Geolocation API + localStorage（收藏） |

**禁止擅自引入**：UI 组件库（MUI/AntD/shadcn 等）、Redux/MobX/Zustand、React Router、axios、moment/dayjs、图标库、图表库、CSS-in-JS、状态持久化中间件。确需新增依赖时，先说明理由、体积与替代方案，获得用户同意后再安装。

## 2. 常用命令

以下命令在脚手架建立后生效：

```powershell
npm install          # 安装依赖
npm run dev          # 本地开发
npm run build        # 类型检查 + 生产构建
npm run preview      # 预览构建产物
npm run lint         # ESLint
npm run typecheck    # tsc -b
```

提交或汇报完成前，必须实际运行 `npm run typecheck`、`npm run lint`；涉及构建产物时运行 `npm run build`。测试工具链接入后再补充 `npm run test`。不得声称"应该能过"或伪造输出；失败时如实报告并修复。

## 3. 目录与文件职责

```text
src/api/          仅此层允许发起网络请求（openWeather.ts + types.ts）
src/hooks/        请求状态、定位、收藏等交互副作用
src/components/   展示与交互组件
src/components/states/  加载/错误/空态
src/lib/          纯函数（格式化、天气分类、城市别名、存储、错误）
src/styles/       全局样式与设计 token
src/App.tsx       页面组合
tests/            测试接入后存放全局 setup 与 MSW handlers
```

规则：

1. 组件内**禁止**直接 `fetch`；请求只能来自 `src/api` + `src/hooks`。
2. 单位换算、时间格式化、风向映射只放在 `src/lib`，组件内不做数学运算。
3. 单个组件文件不超过 200 行；超出时按区块拆分。
4. 测试接入后，测试文件与被测文件同目录，命名 `*.test.ts(x)`；mock 数据与 handler 放 `tests/mocks/`。
5. 不创建无职责的 barrel 文件（`index.ts` 转发）；直接从具体文件导入。

## 4. 命名与写法

- 组件：`PascalCase.tsx`，使用**命名导出**，不使用默认导出。
- Hook：`useXxx.ts`，返回对象而非数组，便于扩展。
- 类型/接口：`PascalCase`；联合类型常量用 `UPPER_SNAKE_CASE`。
- 函数/变量：`camelCase`；布尔值以 `is/has/can/should` 开头。
- CSS 类：Tailwind 工具类为主；自定义类用 kebab-case；颜色/圆角/阴影只用 CSS 变量。
- 文案：简体中文；温度显示 `23°`；风速 `12 km/h`；日期 `10月24日`。
- 注释：只在逻辑不直观时写，使用中文，说明"为什么"而非"做了什么"。
- 禁止 `any`、无理由的 `as`、非空断言 `!`；确需使用时须就近注释原因。
- 禁止 `console.log`、`debugger`、注释掉的死代码进入提交。

## 5. 数据与请求规则

1. 所有请求必须经过 `src/api/openWeather.ts`，统一 10 秒超时与错误分类。
2. 错误统一为 `AppError`（见 TECH_DESIGN 8.1），UI 只消费 `code` 与 `retryable`。
3. 响应使用前必须校验关键字段；结构不符直接抛 `INVALID_DATA`，禁止半残数据渲染。
4. 收藏 id 使用经纬度保留 3 位小数（`getCityKey`）。
5. 不新增定时轮询与自动重试；刷新由用户操作触发。
6. 新查询必须 abort 上一次未完成请求；不手写请求竞态标志。
7. 坐标与城市等外部文本必须作为文本节点渲染，禁止 `dangerouslySetInnerHTML`。
8. API Key 只能从 `import.meta.env.VITE_OPENWEATHER_API_KEY` 读取；不得硬编码，不得新增未在 TECH_DESIGN 声明的外部域名。
9. 时间处理遵守 TECH_DESIGN 8.3：城市时间必须用 `unix + timezone` 偏移后按 UTC 格式化。
10. `localStorage` 读写只能经 `src/lib/storage.ts`，必须 `try/catch` + 结构校验 + 版本化键名。

## 6. UI 与交互规则

1. 移动优先；断点仅使用 `sm:640`、`md:768`、`lg:1024`。
2. 每个数据区块必须具备三态：加载骨架、错误（含重试）、空态。
3. 骨架屏高度与真实内容一致，避免布局跳动。
4. 触控目标 ≥ 44×44px；可见焦点样式；对比度 ≥ 4.5:1。
5. 图标统一使用 `WeatherIcon` 内联 SVG；禁止 emoji、外部图片、图标库。
6. 背景渐变与主题色只使用 `globals.css` 中的 token，禁止组件内硬编码十六进制颜色。
7. 搜索为普通表单提交，不要求 combobox 候选；输入空值时给出 `role="alert"` 提示。
8. 状态变化使用 `role="status"` / `role="alert"` 播报；装饰性图标 `aria-hidden="true"`。
9. 动效 ≤ 200ms，并尊重 `prefers-reduced-motion`。
10. 页脚必须保留 OpenWeatherMap 署名链接。

## 7. 测试与完成定义

### 7.1 测试要求

- 测试工具链尚未接入；接入后，新增纯逻辑（格式化、天气分类、校验、存储）必须带单元测试。
- 修复缺陷时先写复现测试，再修复。
- 交互组件至少覆盖：正常渲染、加载态、错误态、键盘操作。
- 测试接入后必须覆盖的用例：
  - 温度/风速/风向/日期格式化
  - 预报按日聚合（代表时段、最低最高、降水概率）
  - 未识别天气代码降级为 cloudy
  - localStorage 数据损坏时不崩溃
  - 城市不存在 404、接口 500、429
  - 定位拒绝与超时提示

### 7.2 完成定义（DoD）

- [ ] 功能符合 PRD 对应条目与验收标准
- [ ] `npm run typecheck` 通过
- [ ] `npm run lint` 通过
- [ ] `npm run build` 通过
- [ ] 移动端 360px 与桌面端 1024px 实际检查无溢出、无遮挡
- [ ] 加载 / 错误 / 空态齐全
- [ ] 键盘可完成该功能的主路径
- [ ] 文档与实现一致（需求或接口变更已回写 PRD/TECH_DESIGN）
- [ ] 汇报中给出真实执行的命令与结果

## 8. 禁止事项

1. 不得初始化项目、安装依赖或创建源码，除非用户明确要求。
2. 不得引入未获批准的依赖。
3. 不得创建自建后端、数据库、账号体系。
4. 不得提交密钥、`.env` 实际值、个人数据。
5. 不得接入统计、广告、追踪脚本。
6. 不得大面积重构与当前任务无关的代码。
7. 不得在未运行验证的情况下声称测试通过。
8. 不得执行 `git commit`、`git push`、分支操作，除非用户明确要求。
9. 不得删除或改写 PRD/TECH_DESIGN 中的既定决策而不说明原因。
10. 不得用 emoji 代替界面图标，也不得在文档中随意添加装饰性 emoji。

## 9. 变更流程

1. 阅读 PRD、TECH_DESIGN、本文件，确认需求属于当前范围。
2. 需求有歧义时，采用文档中的默认决策并在回复中说明；影响范围较大时先询问用户。
3. 需求或接口发生变化：先更新 PRD / TECH_DESIGN，再实现。
4. 小步实现，单次改动聚焦一个功能点；不顺手做无关优化。
5. 运行 typecheck、lint、测试；如涉及界面，实际在浏览器中验证关键路径。
6. 汇报：改了什么、为什么、验证命令与结果、剩余风险。

## 10. 文档同步矩阵

| 变更类型 | 需更新 |
| --- | --- |
| 新增/修改功能、优先级、验收标准 | PRD.md |
| 接口、数据结构、依赖、目录、缓存策略 | TECH_DESIGN.md |
| 工程约定、命令、禁止事项 | AGENTS.md |
| 仅样式微调（不改变规范） | 无需更新文档 |

## 11. 提交规范

仅在用户明确要求提交时执行。提交信息使用 Conventional Commits：

```text
feat: 支持城市搜索与收藏
fix: 修复切换城市后预报未刷新
docs: 补充密钥错误提示说明
refactor: 抽取时间格式化函数
test: 增加 429 限流场景用例
chore: 更新 ESLint 配置
```

要求：一次提交一个主题；不提交 `node_modules/`、`dist/`、本地 `.env`；提交前确认暂存文件清单。
