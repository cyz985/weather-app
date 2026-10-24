# 天气查询应用 技术设计文档

| 项目 | 内容 |
| --- | --- |
| 文档版本 | v1.1（MVP 实现版） |
| 更新日期 | 2026-10-24 |
| 状态 | 已实现 |
| 需求文档 | [PRD.md](./PRD.md) |
| 代理规范 | [AGENTS.md](./AGENTS.md) |

## 0. 变更说明

相对 v1.0：

1. 数据源改为 **OpenWeatherMap Current Weather + 5 Day / 3 Hour Forecast**，需 API Key，从 `.env.local` 的 `VITE_OPENWEATHER_API_KEY` 读取。
2. 移除 TanStack Query、geocoding 接口、BigDataCloud 反查、URL 状态、单位/主题切换、24 小时逐小时预报。
3. 服务端状态由自研 `useWeather` Hook 管理；收藏由 `useFavorites` + `localStorage` 管理。

## 1. 概述与约束

纯前端 SPA，无自建后端、无数据库、无路由。构建产物为静态文件，浏览器直接调用 OpenWeatherMap。

**约束**：

1. 所有外部请求必须处理超时、限流、结构异常与密钥错误。
2. 不引入重型 UI 库、图表库、状态库、请求库。
3. TypeScript `strict`，不使用 `any`。
4. Key 不得硬编码进源码，只从环境变量读取。

## 2. 技术选型

| 层 | 选型 | 版本 | 理由 |
| --- | --- | --- | --- |
| 构建 | Vite | 6.x | 启动快、产物简单 |
| 框架 | React | 18.3 | 函数组件 + Hooks |
| 语言 | TypeScript | 5.8（strict） | 类型安全 |
| 样式 | Tailwind CSS + CSS 变量 | 3.4 | 工具类布局，主题色用变量 |
| 质量 | ESLint（flat config） | 9.x | 统一风格 |
| 天气数据 | OpenWeatherMap Current Weather API | 2.5 | 免费、支持中文、CORS |
| 多日预报 | OpenWeatherMap 5 Day / 3 Hour Forecast API | 2.5 | 与当前天气同源、同一 Key |
| 收藏存储 | 浏览器 localStorage | — | 无后端、刷新保留 |
| 定位 | 浏览器 Geolocation API | — | 一键获取经纬度 |

**明确不引入**：路由库、Redux/MobX/Zustand、TanStack Query、axios、moment/dayjs、图标库、图表库、UI 组件库、CSS-in-JS。

## 3. 系统架构

```text
┌───────────────────────────────────────────────────┐
│                      Browser                      │
│                                                   │
│  App.tsx（页面组合、错误横幅、收藏联动）           │
│   ├─ useWeather ──────► src/api/openWeather.ts     │
│   ├─ useFavorites ────► src/lib/storage.ts         │
│   └─ useGeolocation ──► navigator.geolocation      │
│                                                   │
│  components/*（展示，不做请求与换算）              │
│  lib/*（格式化、天气分类、错误、别名、存储）        │
└───────────────────────┬───────────────────────────┘
                        │ HTTPS (CORS)
                        ▼
            OpenWeatherMap API（2.5）
            /data/2.5/weather  /data/2.5/forecast
```

| 层 | 职责 | 禁止 |
| --- | --- | --- |
| `src/api` | 拼接 URL、fetch、超时、响应校验、归一化为领域模型 | 不依赖 React |
| `src/hooks` | 请求状态、定位状态、收藏状态、副作用 | 不直接拼 URL |
| `src/components` | 展示与交互 | 不发请求、不做单位换算 |
| `src/lib` | 纯函数：格式化、天气分类、错误、城市别名、存储 | 不含 JSX |
| `App.tsx` | 组合数据与组件，处理页面级交互 | 不写业务计算 |

## 4. 目录结构（实际）

```text
weather-app/
├─ PRD.md / TECH_DESIGN.md / AGENTS.md
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tailwind.config.ts
├─ postcss.config.js
├─ tsconfig*.json
├─ eslint.config.js
├─ .env.local            # 本地密钥，已 gitignore
├─ src/
│  ├─ api/
│  │  ├─ openWeather.ts  # 当前天气 + 预报 + 请求封装
│  │  └─ types.ts        # 领域模型与查询类型
│  ├─ components/
│  │  ├─ SearchBar.tsx
│  │  ├─ FavoriteCities.tsx
│  │  ├─ CurrentWeatherCard.tsx
│  │  ├─ ForecastList.tsx
│  │  ├─ WeatherIcon.tsx
│  │  ├─ icons.tsx
│  │  └─ states/
│  │     ├─ LoadingState.tsx
│  │     ├─ ErrorState.tsx
│  │     └─ ErrorBanner.tsx
│  ├─ hooks/
│  │  ├─ useWeather.ts
│  │  ├─ useFavorites.ts
│  │  └─ useGeolocation.ts
│  ├─ lib/
│  │  ├─ cityAliases.ts
│  │  ├─ errors.ts
│  │  ├─ format.ts
│  │  ├─ storage.ts
│  │  └─ weatherTheme.ts
│  ├─ styles/globals.css
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ vite-env.d.ts
└─ index.html
```

## 5. 数据契约

### 5.1 领域模型

```ts
// src/api/types.ts
export type WeatherQuery = { city: string } | { lat: number; lon: number }

export interface Coordinates { lat: number; lon: number }

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface CurrentWeather {
  cityName: string
  country: string
  coordinates: Coordinates
  temperature: number      // °C
  feelsLike: number        // °C
  humidity: number         // %
  windSpeed: number        // km/h（由 m/s 换算）
  windDirection: number    // 度
  pressure: number         // hPa
  condition: WeatherCondition
  isDay: boolean
  dt: number               // UTC 秒
  timezoneOffset: number   // 城市时区偏移（秒）
}

export interface ForecastDay {
  date: string             // 城市本地日期 YYYY-MM-DD
  condition: WeatherCondition
  tempMin: number
  tempMax: number
  humidity: number
  windSpeed: number        // km/h
  precipitationProbability: number // 0–1
}

export interface WeatherData {
  current: CurrentWeather
  forecast: ForecastDay[]
}

export interface FavoriteCity {
  id: string               // `${lat.toFixed(3)},${lon.toFixed(3)}`
  name: string
  country: string
  lat: number
  lon: number
}
```

### 5.2 外部接口

**当前天气**：

```text
GET https://api.openweathermap.org/data/2.5/weather
  ?appid={VITE_OPENWEATHER_API_KEY}
  &units=metric
  &lang=zh_cn
  &q={城市英文名}  或  &lat={lat}&lon={lon}
```

**多日预报**：

```text
GET https://api.openweathermap.org/data/2.5/forecast
  ?appid={VITE_OPENWEATHER_API_KEY}
  &units=metric
  &lang=zh_cn
  &cnt=40
  &q={城市英文名}  或  &lat={lat}&lon={lon}
```

说明：

- `units=metric` 时温度为 °C，**风速为 m/s**，前端乘 3.6 转 km/h。
- `lang=zh_cn` 返回中文 `description`。
- 免费预报为 3 小时 × 40 条，约 5 天。
- 401 表示密钥无效；404 表示城市不存在；429 表示限流。

### 5.3 响应校验

只校验消费字段，不做全量 schema：

1. `coord`、`weather[0]`、`main.temp/feels_like/humidity/pressure`、`wind.speed`、`dt`、`timezone`、`name` 必须存在且类型正确。
2. 预报 `list` 非空，`city.timezone` 为数字；每条必须含 `dt`、`weather[0]`、`main.temp_min/temp_max/humidity`、`wind.speed`。
3. 任一缺失即整次请求失败，抛 `INVALID_DATA`，不允许半残数据进入 UI。

### 5.4 天气分类

```ts
// src/lib/weatherTheme.ts
export type WeatherKind =
  | 'clear' | 'partly' | 'cloudy' | 'rain' | 'thunder' | 'snow' | 'mist'

export function getWeatherKind(code: number): WeatherKind {
  if (code >= 200 && code < 300) return 'thunder'
  if (code >= 300 && code < 600) return 'rain'
  if (code >= 600 && code < 700) return 'snow'
  if (code >= 700 && code < 800) return 'mist'
  if (code === 800) return 'clear'
  if (code === 801) return 'partly'
  return 'cloudy'
}
```

未识别的代码自然落入 `cloudy`，不报错。

图标由 `WeatherIcon` 按 `kind + isNight` 返回内联 SVG（sun / moon / sun-cloud / moon-cloud / cloud / rain / thunder / snow / mist），带轻微动画，`prefers-reduced-motion` 下关闭。

## 6. 状态与数据流

### 6.1 useWeather

```ts
interface WeatherState {
  data: WeatherData | null
  isLoading: boolean
  error: AppError | null
}
```

流程：

1. `load(query)`：abort 上一次请求 → 新建 `AbortController` → `isLoading=true, error=null`。
2. `Promise.all([getCurrentWeather, getForecast])` 并行请求，共享同一 signal。
3. 成功：`{ data, isLoading:false, error:null }`。
4. 失败：若 signal 已 abort 则忽略；否则保留旧 `data`，写入 `toAppError(error)`。
5. `lastQueryRef` 记录最近一次查询，供 `retry()` 重放。
6. 组件卸载时 abort 未完成请求。

不实现定时轮询与自动重试；错误横幅提供手动重试。

### 6.2 useFavorites

- 初始化 `useState(() => readFavorites())`。
- `useEffect` 监听变化写回 localStorage。
- `toggleFavorite` 按 id 去重/移除；`removeFavorite` 直接过滤。

### 6.3 useGeolocation

- `getCurrentPosition`：`enableHighAccuracy:false`、`timeout:10000`、`maximumAge:300000`。
- 返回 `Promise<Coordinates | null>`；`PERMISSION_DENIED → GEO_DENIED`，其余 → `GEO_UNAVAILABLE`（可重试）。
- 不支持 Geolocation 时直接返回 `null` 并设置错误。

### 6.4 存储结构

```ts
localStorage['weather.favorites.v1'] = FavoriteCity[]
```

读取必须：

1. `try/catch` 包裹 `getItem` 与 `JSON.parse`。
2. 校验数组、元素字段类型、经纬度为有限数字。
3. 按 id 去重。
4. 任何异常返回 `[]`，不抛错。

写入失败（隐私模式/配额不足）静默降级。

## 7. 组件设计

| 组件 | 关键 props | 职责 |
| --- | --- | --- |
| `App` | 无 | 组合 Hook 与区块，处理搜索/定位/收藏/横幅 |
| `SearchBar` | `onSearch`、`onLocate`、`isSearching`、`isLocating` | 搜索表单、空输入校验、双按钮 spinner |
| `FavoriteCities` | `cities`、`activeId`、`onSelect`、`onRemove` | 收藏 chips、当前高亮、删除、空态 |
| `CurrentWeatherCard` | `current`、`today?`、`isFavorite`、`onToggleFavorite` | 主题渐变主卡、大温度、指标网格、收藏星标 |
| `ForecastList` | `days` | 多日列表、图标、降水、温度区间条 |
| `WeatherIcon` | `code`、`isNight`、`size`、`className` | 内联 SVG 天气图标 |
| `LoadingState` | 无 | 骨架屏，`role="status"` |
| `ErrorState` | `error`、`onRetry` | 整页错误卡片 |
| `ErrorBanner` | `error`、`onRetry?`、`onDismiss?` | 内联错误横幅 |

渲染规则：

- 全部命名导出。
- 组件只接收已归一化数据。
- 数值格式化统一走 `lib/format.ts`。
- 外部文本（城市名等）作为文本节点渲染。

## 8. 关键实现规则

### 8.1 错误模型

```ts
// src/lib/errors.ts
export type AppErrorCode =
  | 'MISSING_KEY' | 'INVALID_KEY' | 'CITY_NOT_FOUND' | 'BAD_REQUEST'
  | 'NETWORK' | 'TIMEOUT' | 'RATE_LIMIT' | 'SERVER' | 'INVALID_DATA'
  | 'GEO_DENIED' | 'GEO_UNAVAILABLE' | 'UNKNOWN'
```

| code | 触发 | 文案要点 | 可重试 |
| --- | --- | --- | --- |
| MISSING_KEY | 未读取到 env | 提示在 `.env.local` 配置并重启 | 否 |
| INVALID_KEY | HTTP 401 | 提示检查 Key 是否正确 | 否 |
| CITY_NOT_FOUND | HTTP 404 | 提示检查拼写，支持中英文 | 否 |
| BAD_REQUEST | 空城市 / 非法经纬度 / HTTP 400 | 提示检查输入或定位结果 | 否 |
| NETWORK | fetch reject | 提示检查网络 | 是 |
| TIMEOUT | 10 秒超时 | 提示稍后重试 | 是 |
| RATE_LIMIT | HTTP 429 | 提示接口限流 | 是 |
| SERVER | HTTP 5xx | 提示服务异常 | 是 |
| INVALID_DATA | 校验/解析失败 | 提示数据异常 | 是 |
| GEO_DENIED | 定位权限拒绝 | 提示允许权限或手动搜索 | 否 |
| GEO_UNAVAILABLE | 不支持/超时 | 提示手动搜索 | 是 |
| UNKNOWN | 其他异常 | 通用失败提示 | 是 |

请求封装统一处理：`AbortController` + 10 秒 `setTimeout`、HTTP 状态映射、JSON 解析失败归类 `INVALID_DATA`、调用方 abort 时静默返回。

### 8.2 城市名处理

- 请求前：`resolveApiCityName(input)` 去掉末尾「市」，查中文别名表（约 40 个常用城市）转英文；未命中则原样使用。
- 展示前：`resolveDisplayCityName(name)` 按英文名反查中文；未命中保留接口返回名称。
- 别名表只覆盖常用城市，不追求完整。

### 8.3 时间处理

OpenWeatherMap 返回 UTC 秒与城市 `timezone` 偏移。规则：

1. 城市日期/时间：`new Date((unix + offset) * 1000)` 后使用 `Intl.DateTimeFormat(..., { timeZone: 'UTC' })`，避免浏览器本地时区干扰。
2. 禁止直接用 `new Date(本地时间字符串)` 解析城市本地时间。
3. 预报分组日期：`(unix + offset)` 后取 `toISOString().slice(0,10)`。
4. 星期计算用 `new Date(`${date}T12:00:00Z`).getUTCDay()`，避开边界。
5. 今天/明天由列表索引判断（索引 0、1），其余按星期。

### 8.4 预报聚合

```text
按本地日期分组
  ↓
每日代表时段 = |hour - 12| 最小的 3 小时时段
  ↓
tempMin = 组内 temp_min 最小值
tempMax = 组内 temp_max 最大值
humidity = 组内平均（四舍五入）
windSpeed = 组内最大风速 × 3.6
pop = 组内 pop 最大值
```

今天通常只有当天剩余时段，温度区间偏窄属正常现象。

### 8.5 视觉与主题

- 当前天气卡片使用 `.weather-theme--{kind}-{day|night}` 渐变（14 组），定义在 `globals.css`。
- 渐变、圆角、阴影、文字色只使用 CSS 变量。
- 天气图标动画：太阳旋转、云浮动、雨滴下落；`prefers-reduced-motion` 下全部关闭。
- 断点 `sm:640`、`md:768`、`lg:1024`；桌面 `lg` 两列。

### 8.6 定位与查询联动

```text
点击定位 → locate() → 成功得到 {lat, lon} → load({lat, lon})
                 └─ 失败/拒绝 → 设置 geoError → 横幅提示，保留当前数据
```

定位结果不自动写入收藏。

## 9. 安全与隐私

1. Key 只存在于 `.env.local`（已 gitignore），通过 `import.meta.env` 注入。
2. 注意：`VITE_` 变量会打包进客户端，生产部署应在 OpenWeatherMap 后台按域名/额度限制 Key。
3. 不使用 `dangerouslySetInnerHTML`；城市名等外部文本作为文本节点渲染。
4. 外链 `target="_blank"` 配 `rel="noopener noreferrer"`。
5. 定位坐标仅用于当次 API 请求与收藏，不上传自有服务。
6. 建议部署 CSP：`connect-src 'self' https://api.openweathermap.org`。

## 10. 构建与部署

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

环境变量：

```text
VITE_OPENWEATHER_API_KEY=你的 OpenWeatherMap API Key
```

部署要点：

1. `npm run build` 产出 `dist/`，托管到任意静态服务。
2. 单页无路由，无需 SPA 重写。
3. 生产必须 HTTPS（Geolocation 要求安全上下文）。
4. 页脚固定署名并链接 OpenWeatherMap。

## 11. 测试策略（待接入）

当前未配置 Vitest/RTL/MSW。后续接入后优先覆盖：

| 层级 | 范围 |
| --- | --- |
| 单元 | `format`（温度/风速/风向/日期）、`weatherTheme` 分类、`cityAliases`、`storage` 损坏数据、预报聚合 |
| 组件 | 搜索提交与空输入、加载态、错误态与重试、收藏增删 |
| 集成 | 默认北京加载、搜索切换、定位成功/拒绝、刷新后收藏保留 |

## 12. 设计决策记录（ADR）

| 编号 | 决策 | 理由 | 代价 |
| --- | --- | --- | --- |
| ADR-001 | 使用 OpenWeatherMap 而非 Open-Meteo | 用户指定；中文描述、当前天气字段齐全 | 需要 Key，客户端可见，有免费额度限制 |
| ADR-002 | 纯前端直连 API，无自建后端 | 零运维、零成本 | 无法隐藏 Key，无法服务端聚合 |
| ADR-003 | 不引入 TanStack Query | 单视图、请求少，自研 Hook 足够 | 缓存/去重需自行维护 |
| ADR-004 | 免费版预报按日聚合 | 免费版无每日接口 | 代表天气为近似值，仅 5 天 |
| ADR-005 | 中文城市名本地别名表 | 解决接口中文匹配不稳 | 覆盖有限，需持续补充 |
| ADR-006 | 收藏用 localStorage | 无后端且刷新保留 | 换设备/浏览器不同步 |
| ADR-007 | 不引入日期库 | 仅需格式化与分组，`Intl` + 偏移足够 | 复杂时区场景需扩展 |

## 13. 未决问题

1. 是否接入单元测试工具链。
2. 是否增加单位切换与深色主题。
3. 是否补充更完整的城市中英文别名表。
4. 生产部署平台与 Key 域名限制策略。
