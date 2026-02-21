#!/bin/bash
# Railway deployment build script

echo "🦐 凡人修仙后端部署脚本"

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build TypeScript
npm run build

echo "✅ 构建完成！"
