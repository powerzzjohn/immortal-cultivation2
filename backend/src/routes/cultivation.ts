import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { REALMS } from '../config/constants.js';

const router = Router();
const prisma = new PrismaClient();

// 获取修炼状态
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    
    const cultivation = await prisma.cultivation.findUnique({
      where: { userId },
    });
    
    if (!cultivation) {
      return res.status(404).json({ error: '未找到修炼记录' });
    }
    
    // 检查是否需要重置今日修炼时间（跨天）
    const now = new Date();
    const lastCultivate = cultivation.lastCultivateAt;
    let todayMinutes = cultivation.todayMinutes;
    
    if (lastCultivate) {
      const lastDate = new Date(lastCultivate);
      if (lastDate.getDate() !== now.getDate() || 
          lastDate.getMonth() !== now.getMonth() ||
          lastDate.getFullYear() !== now.getFullYear()) {
        todayMinutes = 0;
      }
    }
    
    // 计算当前境界进度
    const currentRealm = REALMS.find(r => r.level === cultivation.realm) || REALMS[0];
    const progress = (cultivation.currentExp / currentRealm.maxExp) * 100;
    
    res.json({
      cultivation: {
        currentExp: cultivation.currentExp,
        totalExp: cultivation.totalExp,
        realm: cultivation.realm,
        realmName: cultivation.realmName,
        totalDays: cultivation.totalDays,
        todayMinutes,
        isCultivating: cultivation.isCultivating,
        cultivateStartAt: cultivation.cultivateStartAt,
        progress: Math.round(progress * 100) / 100,
        nextRealmExp: currentRealm.maxExp,
      },
    });
  } catch (error) {
    console.error('获取修炼状态失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 开始修炼
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    
    const cultivation = await prisma.cultivation.findUnique({
      where: { userId },
    });
    
    if (!cultivation) {
      return res.status(404).json({ error: '未找到修炼记录' });
    }
    
    if (cultivation.isCultivating) {
      return res.status(400).json({ error: '已经在修炼中' });
    }
    
    await prisma.cultivation.update({
      where: { userId },
      data: {
        isCultivating: true,
        cultivateStartAt: new Date(),
      },
    });
    
    res.json({ message: '开始修炼', startTime: new Date() });
  } catch (error) {
    console.error('开始修炼失败:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// 停止修炼
router.post('/stop', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { minutes, expGained } = req.body;
    
    const cultivation = await prisma.cultivation.findUnique({
      where: { userId },
    });
    
    if (!cultivation) {
      return res.status(404).json({ error: '未找到修炼记录' });
    }
    
    if (!cultivation.isCultivating) {
      return res.status(400).json({ error: '未在修炼中' });
    }
    
    // 计算新经验值和境界
    let newExp = cultivation.currentExp + (expGained || minutes);
    let newRealm = cultivation.realm;
    let newRealmName = cultivation.realmName;
    
    // 检查是否突破境界
    const currentRealm = REALMS.find(r => r.level === cultivation.realm);
    if (currentRealm && newExp >= currentRealm.maxExp) {
      newExp = newExp - currentRealm.maxExp;
      newRealm++;
      const nextRealm = REALMS.find(r => r.level === newRealm);
      if (nextRealm) {
        newRealmName = nextRealm.name;
      }
    }
    
    await prisma.cultivation.update({
      where: { userId },
      data: {
        isCultivating: false,
        cultivateStartAt: null,
        currentExp: newExp,
        totalExp: cultivation.totalExp + (expGained || minutes),
        realm: newRealm,
        realmName: newRealmName,
        todayMinutes: cultivation.todayMinutes + minutes,
        lastCultivateAt: new Date(),
      },
    });
    
    // 记录修炼日志
    await prisma.cultivationLog.create({
      data: {
        userId,
        minutes,
        expGained: expGained || minutes,
        bonus: 1.0, // TODO: 根据天时计算加成
      },
    });

    // 奖励灵石
    const spiritStonesReward = Math.floor(minutes / 10); // 每10分钟1灵石
    if (spiritStonesReward > 0) {
      await prisma.resources.update({
        where: { userId },
        data: {
          spiritStones: { increment: spiritStonesReward },
        },
      });

      // 记录资源日志
      await prisma.resourceLog.create({
        data: {
          userId,
          resourceType: 'spiritStones',
          amount: spiritStonesReward,
          type: 'reward',
          description: '修炼奖励',
        },
      });
    }
    
    res.json({
      message: '修炼结束',
      minutes,
      expGained: expGained || minutes,
      spiritStonesReward,
      levelUp: newRealm > cultivation.realm,
      newRealm: newRealmName,
    });
  } catch (error) {
    console.error('停止修炼失败:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

export default router;
