# frontend

Next.js 16 (App Router) + TypeScript + Vitest 的前端工程。

本目录是 **frontend submodule**（https://github.com/sqlyouran/first_frontend），由父仓统一管理治理规则。父仓入口见 `../AGENTS.md`。

## 工具链

| 项 | 版本要求 |
|---|---|
| Node.js | ≥ 20.19（推荐 `nvm use 20` 锁定） |
| Next.js | 16.x（App Router） |
| React | 19.x |
| TypeScript | 5.x |
| 测试栈 | Vitest + @testing-library/react + @testing-library/jest-dom |
| 包管理 | npm（锁定 `package-lock.json`） |

## 本地开发

### 启动顺序：先后端，后前端

```bash
# 终端 A：起 Spring Boot 后端（端口 8080）
cd backend
./mvnw spring-boot:run       # 或 mvn spring-boot:run

# 终端 B：起 Next.js 前端（端口 3000，被占时自动 fallback）
cd frontend
npm install
npm run dev
```

访问 `http://localhost:3000`（或 Next 自动分配的下一个可用端口）。

### 环境变量

`.env.local` 已在 `.gitignore` 中（**不入仓**），本地手动创建：

```bash
# frontend/.env.local
BACKEND_URL=http://localhost:8080
```

部署到 Vercel 时由环境变量面板注入，不要硬编码在代码里。

## 命令

```bash
npm run dev          # 起 dev server
npm run build        # 生产构建
npm run start        # 起生产 server
npm test             # 跑 Vitest（单跑）
npm run test:watch   # Vitest watch 模式
```

## BFF 边界（必须遵守）

`lib/backend.ts` 是**薄 BFF** 封装：

**允许**（薄 BFF 范围）：
- SSR 数据预取：在 Server Component 内 fetch 后端
- 多接口聚合：一次 RSC 渲染调多个后端端点
- 字段裁剪：从后端响应中只挑前端需要的字段
- 缓存读：用 `fetch` 的 `cache` / `next.revalidate`

**禁止**（业务后端范围，违反父仓 AGENTS.md 红线）：
- ❌ 在 Route Handlers (`app/api/**/route.ts`) 写入业务
- ❌ 在 Server Actions 实现鉴权写 / 事务 / 领域逻辑
- ❌ 任何写入数据库、操作消息队列、状态机的代码

写操作、事务、权限校验、业务逻辑**一律走 Spring Boot**，前端只透传 cookie / token。

新增 Route Handler / Server Action 前必须先开 OpenSpec change（父仓 `/opsx:propose`）。

## 首页骨架

首页（`/`）拆为 6 个 region，骨架阶段仅提供挂载位与命名契约，各 region 内容由后续独立 change 实现：

| Slot | DOM 容器 | 挂载位 | 后续变更 |
|---|---|---|---|
| `HeroSlot` | `<section data-region="hero">` | `app/page.tsx` | `homepage-hero` |
| `FeatureNavSlot` | `<section data-region="feature-nav">`（包含占位 `<a>`） | `app/page.tsx` | `homepage-feature-nav` ✓ |
| `CityGridSlot` | `<section data-region="city-grid">` | `app/page.tsx` | `homepage-city-grid` |
| `HotPostsSlot` | `<section data-region="hot-posts">` | `app/page.tsx` | `homepage-hot-posts` |
| `HotSpotsSlot` | `<section data-region="hot-spots">` | `app/page.tsx` | `homepage-hot-spots` |
| `AiLauncherSlot` | `<div data-region="ai-launcher">` | `app/layout.tsx`（`{children}` 之后） | `homepage-ai-launcher` |

骨架阶段约定（来自 `homepage-shell` 变更）：

- 所有 Slot 默认为完全空容器（无子节点 / 无 inline style / 无 className）。各区块各自 change 在 Slot 内部填充内容。
  - `homepage-feature-nav` 已解除 `FeatureNavSlot` 的空容器约束，现渲染硬编码 `featureNav.data.ts` 中的占位 `<a>`。
- `app/page.tsx` **不依赖后端** HTTP；后端 8080 未启动时首页仍返回 200 + 6 个 `data-region`。
- `HelloMessage.tsx` / `HelloMessage.test.tsx` / `lib/backend.ts` 作为 BFF 链路活体探针保留，**首页 UI 不再 import**；SSR 链路覆盖改由 `HelloMessage.test.tsx` 单测保住。
- AI 助手入口跳推上举至 root layout（D4 trigger：当出现第 2 条不希望渲染助手的路由时，重新 propose 提到路由组布局）。

## 目录结构

```
frontend/
├── app/                    App Router 路由（文件即路由）
│   ├── layout.tsx          根布局（挂载 AiLauncherSlot）
│   ├── page.tsx            首页（渲染 5 个页内 Slot）
│   ├── regions/            6 个 region Slot 组件目录
│   └── HelloMessage.tsx    BFF 链路探针（client component，首页不再 import）
├── components/ui/          shadcn/ui 生成的原子组件
├── lib/
│   ├── backend.ts          server-only BFF helper
│   └── utils.ts            cn helper (clsx + tailwind-merge)
├── public/                 静态资源
├── .env.local              本地环境变量（不入仓）
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
└── package.json
```

## 测试

```bash
npm test
```

测试栈：Vitest + happy-dom + React Testing Library。

**Server Component 不能直接被 RTL render**（async），统一模式：
- 把展示逻辑抽成 client component（如 `HelloMessage.tsx`）
- Server Component 只 fetch 数据，传给 client component
- 测试覆盖 client component 的 props 渲染
