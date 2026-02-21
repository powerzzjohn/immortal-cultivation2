# 🚀 凡人修仙 Web 应用 - 分离部署指南

## 部署架构

```
┌─────────────┐      HTTPS       ┌─────────────┐
│   Vercel    │ ◄──────────────► │   Railway   │
│   (前端)     │                  │   (后端)     │
│  React App  │                  │  Node.js    │
└─────────────┘                  └─────────────┘
     ▲                                  │
     │                              SQLite
     │                              (持久化)
  用户访问
```

---

## 第一步：部署后端到 Railway

### 1.1 准备工作

确保你已经在本地测试过后端可以正常运行：
```bash
cd ~/.openclaw/workspace/projects/immortal-cultivation/backend
npm install
npx prisma generate
npm run dev
```

### 1.2 注册 Railway

1. 访问 https://railway.app
2. 点击 "Start for Free"
3. 使用 GitHub 账号登录
4. 完成邮箱验证（可能需要验证邮件）

### 1.3 创建项目

方式一：通过 GitHub 部署（推荐）
1. 先把代码推送到 GitHub 仓库
2. Railway Dashboard → "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库

方式二：通过 CLI 部署
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 进入后端目录
cd ~/.openclaw/workspace/projects/immortal-cultivation/backend

# 创建项目
railway init

# 部署
railway up
```

### 1.4 配置环境变量

在 Railway Dashboard → 你的项目 → Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `file:./prisma/dev.db` | SQLite 数据库路径 |
| `JWT_SECRET` | `xiuxian-secret-2024` | JWT 密钥（请修改为自己的）|
| `FRONTEND_URL` | `https://your-vercel-app.vercel.app` | 前端地址（先留空，部署完前端再填）|
| `NODE_ENV` | `production` | 生产环境 |

### 1.5 部署设置

在 Railway Dashboard → Settings：
1. **Build Command**: `npm install && npx prisma generate && npm run build`
2. **Start Command**: `node dist/app.js`
3. **Healthcheck Path**: `/api/health`

### 1.6 获取后端地址

部署成功后，你会得到一个域名：
```
https://immortal-cultivation-backend.up.railway.app
```

**记录这个地址，部署前端时需要用到！**

---

## 第二步：部署前端到 Vercel

### 2.1 修改前端环境变量

编辑 `frontend/.env.production`：
```bash
# 替换为你的 Railway 后端地址
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

### 2.2 构建前端

```bash
cd ~/.openclaw/workspace/projects/immortal-cultivation/frontend
npm install
npm run build
```

构建成功后，会在 `dist/` 目录生成静态文件。

### 2.3 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2.4 登录 Vercel

```bash
vercel login
# 按提示在浏览器中完成登录
```

### 2.5 部署

```bash
cd ~/.openclaw/workspace/projects/immortal-cultivation/frontend

# 首次部署
vercel

# 按提示选择：
# ? Set up and deploy ".../frontend"? [Y/n] Y
# ? Which scope do you want to deploy to? [你的账号]
# ? Link to existing project? [y/N] N
# ? What's your project name? [immortal-cultivation]

# 后续更新
vercel --prod
```

### 2.6 获取前端地址

部署成功后，你会得到：
```
https://immortal-cultivation.vercel.app
```

---

## 第三步：配置 CORS

### 3.1 更新 Railway 环境变量

回到 Railway Dashboard，更新 `FRONTEND_URL`：
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Railway 会自动重新部署。

### 3.2 验证 CORS

访问你的前端地址，打开浏览器开发者工具 → Network，检查 API 请求是否正常。

---

## 第四步：验证部署

### 4.1 测试后端

访问：`https://your-railway-app.up.railway.app/api/health`

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### 4.2 测试前端

访问你的 Vercel 地址，检查：
- [ ] 页面正常加载
- [ ] 八字测算功能正常
- [ ] 箴言系统正常
- [ ] 注册/登录功能正常

---

## 故障排查

### 后端 500 错误
```bash
# 查看 Railway 日志
railway logs
```

### 前端 API 请求失败
1. 检查 `.env.production` 中的 `VITE_API_URL` 是否正确
2. 检查 Railway 的 `FRONTEND_URL` 是否配置正确
3. 检查 CORS 设置

### 数据库问题
SQLite 在 Railway 会持久化到磁盘，但如果容器重启可能会丢失。如需长期数据保存，建议迁移到 PostgreSQL。

---

## 虾哥总结

**你已经完成的配置：**
- ✅ Railway 部署配置 (`nixpacks.toml`)
- ✅ 前端环境变量配置
- ✅ 构建脚本

**你需要手动操作的：**
1. 注册 Railway 并部署后端
2. 注册 Vercel 并部署前端
3. 配置环境变量和 CORS

**预计时间：** 15-20 分钟

有任何问题随时问我！🦐
