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

## 目录结构

```
frontend/
├── app/                    App Router 路由（文件即路由）
│   ├── layout.tsx          根布局
│   ├── page.tsx            首页（Server Component）
│   └── HelloMessage.tsx    Client Component（接收 message props）
├── lib/
│   └── backend.ts          server-only BFF helper
├── public/                 静态资源
├── .env.local              本地环境变量（不入仓）
├── next.config.ts
├── vitest.config.ts
└── package.json
```

## 测试

```bash
npm test
```

测试栈：Vitest + jsdom + React Testing Library。

**Server Component 不能直接被 RTL render**（async），统一模式：
- 把展示逻辑抽成 client component（如 `HelloMessage.tsx`）
- Server Component 只 fetch 数据，传给 client component
- 测试覆盖 client component 的 props 渲染
