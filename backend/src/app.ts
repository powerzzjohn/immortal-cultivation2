import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// 路由导入
import authRoutes from './routes/auth.js';
import baziRoutes from './routes/bazi.js';
import baziRoutesV1 from './routes/baziRoutes.js';
import cultivationRoutes from './routes/cultivation.js';
import celestialRoutes from './routes/celestial.js';
import chatRoutes from './routes/chat.js';
import wisdomRoutes from './routes/wisdom.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/bazi', baziRoutes);
app.use('/api/v1/bazi', baziRoutesV1);  // v1 API 版本
app.use('/api/cultivation', cultivationRoutes);
app.use('/api/celestial', celestialRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wisdom', wisdomRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 本地开发时启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🦐 凡人修仙服务器启动在端口 ${PORT}`);
    console.log(`API地址: http://localhost:${PORT}/api`);
  });
}

// 导出供 Vercel 使用
export default app;
