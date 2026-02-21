# 凡人修仙

基于八字命格、天时气运、金丹工程的现代化修仙应用。

## 核心特色

1. **八字命格测算** - 准确测算生辰八字，确定灵根类型
2. **天时修炼系统** - 结合天气、五运六气、子午流注、月相计算修炼加成
3. **金丹工程智慧** - 每日修炼总结融入现代科学修炼观

## 技术栈

- **前端**: React 18 + TypeScript + TailwindCSS + Zustand
- **后端**: Node.js + Express + Prisma + SQLite
- **AI**: Kimi k2.5 (Moonshot)

## 项目结构

```
immortal-cultivation/
├── frontend/          # React前端
├── backend/           # Express后端
├── shared/            # 共享类型
└── docs/              # 文档
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 前端 http://localhost:3000
# 后端 http://localhost:3001
```

## 环境变量

复制 `.env.example` 到 `.env` 并填写：
- `MOONSHOT_API_KEY` - Moonshot API密钥
- `QWEATHER_KEY` - 和风天气API密钥
- `GAODE_KEY` - 高德地图API密钥
- `JWT_SECRET` - JWT密钥

## 功能模块

- [x] 用户注册/登录
- [x] 八字测算与灵根判定
- [x] 天时系统（天气、五运六气、子午流注、月相）
- [x] 修炼系统（计时、经验、境界）
- [ ] AI NPC对话（Kimi集成）
- [ ] 每日修炼总结
- [ ] 储物袋系统

## 文档

详细设计文档见 `/docs/凡人修仙-PRD-v1.0.md`
