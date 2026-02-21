import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getCelestialData } from '../services/celestialService.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 获取当前天时数据
router.get('/now', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { lat, lon } = req.query;
    
    // 获取用户灵根属性
    const bazi = await prisma.bazi.findUnique({
      where: { userId },
      select: { primaryElement: true },
    });
    
    if (!bazi) {
      return res.status(400).json({ error: '请先设置八字' });
    }
    
    // 默认使用北京坐标
    const latitude = parseFloat(lat as string) || 39.9042;
    const longitude = parseFloat(lon as string) || 116.4074;
    
    const celestialData = await getCelestialData(
      bazi.primaryElement,
      latitude,
      longitude
    );
    
    res.json(celestialData);
  } catch (error) {
    console.error('获取天时数据失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 获取月相
router.get('/moon', authMiddleware, async (req, res) => {
  try {
    const { calculateMoonPhase } = await import('../services/celestialService.js');
    const moonPhase = calculateMoonPhase();
    res.json(moonPhase);
  } catch (error) {
    console.error('获取月相失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

export default router;
