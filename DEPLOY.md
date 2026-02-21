# 凡人修仙 Web 应用 - Vercel 部署指南

## 快速部署步骤

### 1. 准备代码
```bash
cd ~/.openclaw/workspace/projects/immortal-cultivation
```

### 2. 构建后端
```bash
cd backend
npm install
npx prisma generate
npm run build
cd ..
```

### 3. 构建前端
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. 部署到 Vercel
```bash
# 如果你已安装 Vercel CLI
vercel

# 或者使用 Git 部署
# 1. 创建 GitHub 仓库
# 2. 推送代码
# 3. 在 Vercel 导入项目
```

## 环境变量配置

在 Vercel Dashboard → Project Settings → Environment Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `file:./prisma/dev.db` | 数据库路径 |
| `JWT_SECRET` | `your-secret-key` | JWT 密钥（请修改）|
| `FRONTEND_URL` | `https://你的域名.vercel.app` | 前端地址 |

## 注意事项

1. **SQLite 数据库**: Vercel 是无服务器环境，SQLite 文件在每次部署后会重置。如需持久化数据，建议迁移到 PostgreSQL（Vercel Postgres）。

2. **API 地址**: 前端需要指向正确的后端地址。开发时使用 `http://localhost:3001`，生产环境使用 Vercel 分配的域名。

3. **构建缓存**: 如果部署失败，尝试清除缓存重新部署。

## 替代方案（推荐）

由于 SQLite 在 Vercel Serverless 环境的限制，建议：

### 方案 A: 使用 Vercel Postgres
1. 在 Vercel 创建 Postgres 数据库
2. 修改 `DATABASE_URL` 为 Postgres 连接字符串
3. 更新 Prisma schema 适配 PostgreSQL

### 方案 B: 分离部署
- **后端**: 部署到 Railway/Render（支持 SQLite 持久化）
- **前端**: 部署到 Vercel（静态网站）

## 虾哥推荐

对于快速测试，直接用 **方案 B**:
1. 后端部署到 Railway（免费，支持持久化 SQLite）
2. 前端部署到 Vercel（免费 CDN）

需要我帮你配置 Railway 后端部署吗？
