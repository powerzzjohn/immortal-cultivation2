# 凡人修仙 Web 应用 - Vercel + Supabase 部署指南

## 架构
- **后端**: Vercel (Serverless Functions)
- **数据库**: Supabase (PostgreSQL)
- **前端**: Vercel (静态网站)

两个都部署在 Vercel，但数据库用 Supabase 的免费 PostgreSQL。

---

## 第一步：创建 Supabase 数据库

**1.1 打开 Supabase**
1. 访问 https://supabase.com
2. 登录（可用 GitHub 账号）

**1.2 创建新项目**
1. 点击 **"New project"**
2. 选择 Organization（或创建新的）
3. 填写项目名称：`immortal-cultivation`
4. 设置数据库密码（记住这个密码！）
5. 选择地区：**Asia Pacific (Singapore)** 离你最近
6. 点击 **"Create new project"**
7. 等待数据库创建（约1-2分钟）

**1.3 获取数据库连接信息**
1. 进入项目后，点击左侧 **"Project Settings"**（齿轮图标）
2. 点击 **"Database"** 标签
3. 找到 **"Connection string"** 部分
4. 选择 **"Prisma"** 格式，复制连接字符串
   - 这是 `DATABASE_URL`，端口是 **6543**（Pooler）
5. 再选择 **"URI"** 格式，复制连接字符串
   - 这是 `DIRECT_URL`，端口是 **5432**（直连）

**注意**：把 `[YOUR-PASSWORD]` 替换成你刚才设置的密码。

---

## 第二步：部署后端到 Vercel

**2.1 准备后端代码**
```bash
cd ~/.openclaw/workspace/projects/immortal-cultivation/backend
```

**2.2 部署到 Vercel**
1. 访问 https://vercel.com
2. 点击 **"Add New..."** → **"Project"**
3. 导入 `immortal-cultivation2` 仓库
4. 配置项目：
   - **Root Directory**: 改成 `backend`
   - **Framework Preset**: 选择 **"Other"`
5. 点击 **"Environment Variables"** 展开，添加：
   ```
   DATABASE_URL=postgresql://postgres:[密码]@db.xxx.supabase.co:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[密码]@db.xxx.supabase.co:5432/postgres
   JWT_SECRET=你的随机字符串（随便打一串字母数字）
   FRONTEND_URL=https://placeholder.vercel.app
   ```
6. 点击 **"Deploy"**

**2.3 运行数据库迁移**
部署完成后，需要在本地运行 migration：

```bash
cd ~/.openclaw/workspace/projects/immortal-cultivation/backend

# 设置环境变量
export DATABASE_URL="你的 Supabase Pooler URL"
export DIRECT_URL="你的 Supabase 直连 URL"

# 运行迁移
npx prisma migrate deploy
```

**2.4 获取后端地址**
部署成功后，Vercel 会给你分配一个域名：
```
https://immortal-cultivation2-backend.vercel.app
```

测试访问：
```
https://你的域名/api/health
```
应该返回 `{"status":"ok"}`

---

## 第三步：部署前端到 Vercel

**3.1 创建前端项目**
1. 在 Vercel 点击 **"Add New..."** → **"Project"**
2. 再次导入同一个仓库 `immortal-cultivation2`
3. 这次配置：
   - **Root Directory**: `frontend`
   - **Framework Preset**: **"Vite"**

**3.2 添加环境变量**
```
VITE_API_URL=https://你的后端域名.vercel.app
```

**3.3 部署**
点击 **"Deploy"**，等待完成。

**3.4 获取前端地址**
比如：
```
https://immortal-cultivation2.vercel.app
```

---

## 第四步：更新 CORS

回到你的 **后端项目** Vercel Dashboard：

1. 进入 Settings → Environment Variables
2. 找到 `FRONTEND_URL`，编辑为：
   ```
   https://你的前端域名.vercel.app
   ```
3. Vercel 会自动重新部署

---

## 第五步：测试

1. 打开前端地址
2. 尝试注册账号
3. 如果成功，全部完成！

---

## 💰 免费额度

| 服务 | 免费额度 | 凡人修仙够不够用 |
|------|---------|----------------|
| **Vercel** | 100GB 流量/月 | ✅ 足够 |
| **Supabase** | 500MB 数据库 | ✅ 足够 |
| **Supabase** | 无限 API 调用 | ✅ 足够 |

---

## 🐛 常见问题

**问题1：数据库连接失败**
- 检查 `DATABASE_URL` 和 `DIRECT_URL` 是否填对
- 检查密码是否正确
- Supabase 的密码如果包含特殊字符，需要 URL 编码

**问题2：CORS 错误**
- 确保 `FRONTEND_URL` 填的是前端域名，不是 `placeholder`
- 注意 `https://` 前缀

**问题3：Migration 失败**
- 确保在本地运行 `npx prisma migrate deploy`
- 检查 `DIRECT_URL` 是否正确

---

## 📁 本地开发

如果你想在本地开发：

```bash
cd ~/.openclaw/workspace/projects/immortal-cultivation/backend

# 使用 SQLite 开发（不用连 Supabase）
# 临时修改 prisma/schema.prisma：
#   provider = "sqlite"
#   url      = env("DATABASE_URL")

# 然后设置
export DATABASE_URL="file:./prisma/dev.db"

npm run dev
```

部署前记得改回 PostgreSQL 配置！
