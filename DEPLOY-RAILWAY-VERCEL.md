# 凡人修仙 Web 应用 - Railway + Vercel 部署指南

## 架构
- **后端**: Railway (PostgreSQL + Node.js)
- **前端**: Vercel (静态网站)

## 部署步骤

### 第一步：准备代码
```bash
cd ~/.openclaw/workspace/projects/immortal-cultivation
git add -A
git commit -m "迁移到 PostgreSQL"
git push origin main
```

### 第二步：部署后端到 Railway

**2.1 创建 Railway 项目**
1. 访问 https://railway.app
2. New Project → Deploy from GitHub repo
3. 选择 `immortal-cultivation2`

**2.2 添加 PostgreSQL 数据库**
1. 在项目页面点击 "New" → "Database" → "Add PostgreSQL"
2. Railway 会自动创建数据库并设置环境变量

**2.3 配置环境变量**
Railway 会自动设置 `DATABASE_URL` 和 `DIRECT_URL`，你只需要添加：
```
JWT_SECRET=你的强密码（随机字符串）
FRONTEND_URL=https://你的前端域名.vercel.app  （先占位，部署完前端再改）
```

**2.4 部署**
- Railway 会自动检测 `backend/railway.json` 配置
- 构建时会自动运行：`npx prisma migrate deploy && npm start`
- 部署成功后复制后端域名：`https://你的项目.up.railway.app`

### 第三步：部署前端到 Vercel

**3.1 创建 Vercel 项目**
1. 访问 https://vercel.com
2. Import GitHub 仓库
3. 根目录选择：`frontend`
4. Framework: Vite

**3.2 配置环境变量**
```
VITE_API_URL=https://你的Railway域名.up.railway.app
```

**3.3 部署**
- 点击 Deploy

### 第四步：更新 CORS
回到 Railway Dashboard，更新环境变量：
```
FRONTEND_URL=https://你的Vercel域名.vercel.app
```

## 本地开发

如果你想在本地开发：

**选项1：使用 SQLite（简单）**
1. 临时修改 `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
2. 设置 `.env`: `DATABASE_URL="file:./prisma/dev.db"`
3. 运行 `npx prisma migrate dev`

**选项2：使用本地 PostgreSQL**
1. 安装 PostgreSQL
2. 创建数据库
3. 设置 `DATABASE_URL` 和 `DIRECT_URL`

## 故障排除

**问题：Migration 失败**
- 检查 `DATABASE_URL` 和 `DIRECT_URL` 是否正确设置
- 查看 Railway 部署日志

**问题：前端无法连接后端**
- 检查 `VITE_API_URL` 是否正确
- 检查 Railway 的 `FRONTEND_URL` CORS 设置

**问题：数据库连接错误**
- 确保 PostgreSQL 插件已正确添加
- 检查环境变量是否自动注入
