import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { generateDailySummaryWithAI } from '../services/aiSummaryService.js';
import { getCelestialData } from '../services/celestialService.js';
import { getRealmByLevel } from '../config/constants.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * 获取今日修炼总结
 * GET /api/summary/today
 */
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查是否已生成今日总结
    const existingSummary = await prisma.dailySummary.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingSummary) {
      return res.json({
        summary: {
          date: existingSummary.date.toISOString().split('T')[0],
          todayMinutes: existingSummary.todayMinutes,
          expGained: existingSummary.expGained,
          bonusApplied: existingSummary.bonusApplied,
          greeting: existingSummary.greeting,
          cultivationReview: existingSummary.cultivationReview,
          insight: existingSummary.insight,
          wisdom: existingSummary.wisdom,
          suggestion: existingSummary.suggestion,
          goldenQuote: existingSummary.goldenQuote,
        },
        isNew: false,
      });
    }

    // 没有总结，返回空
    res.json({
      summary: null,
      isNew: false,
      message: '今日尚未修炼完成，暂无总结',
    });
  } catch (error) {
    console.error('获取今日总结失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

/**
 * 生成今日修炼总结
 * POST /api/summary/generate
 * 在修炼结束时调用
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { latitude = 39.9042, longitude = 116.4074 } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取用户完整信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bazi: true,
        cultivation: true,
      },
    });

    if (!user || !user.cultivation) {
      return res.status(404).json({ error: '未找到用户修炼记录' });
    }

    // 检查今日是否已有总结
    const existingSummary = await prisma.dailySummary.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingSummary) {
      return res.json({
        summary: existingSummary,
        isNew: false,
        message: '今日总结已生成',
      });
    }

    // 获取今日修炼数据
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const cultivationLogs = await prisma.cultivationLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (cultivationLogs.length === 0) {
      return res.status(400).json({ error: '今日无修炼记录，无法生成总结' });
    }

    const todayMinutes = cultivationLogs.reduce((sum, log) => sum + log.minutes, 0);
    const todayExp = cultivationLogs.reduce((sum, log) => sum + log.expGained, 0);
    const avgBonus = cultivationLogs.reduce((sum, log) => sum + log.bonus, 0) / cultivationLogs.length;

    // 获取今日灵石收益
    const resourceLogs = await prisma.resourceLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        type: 'reward',
      },
    });

    const spiritStonesEarned = resourceLogs
      .filter((log) => log.resourceType === 'spiritStones')
      .reduce((sum, log) => sum + log.amount, 0);

    // 获取天时数据
    const userElement = user.bazi?.primaryElement || '土';
    let celestialInfo;
    try {
      celestialInfo = await getCelestialData(userElement, latitude, longitude);
    } catch (e) {
      // 使用默认数据
      celestialInfo = {
        weather: { weather: '晴', temperature: 20 },
        wuYunLiuQi: { mainQi: { name: '未知' } },
        ziWuLiuZhu: { meridian: '未知' },
        moonPhase: { name: '未知' },
        bonus: { total: 1.0 },
      };
    }

    // 调用AI生成总结
    const aiResult = await generateDailySummaryWithAI({
      daoName: user.daoName,
      realmName: user.cultivation.realmName,
      realmLevel: user.cultivation.realm,
      todayMinutes,
      totalDays: user.cultivation.totalDays,
      todayExp,
      spiritStonesEarned,
      bonusApplied: avgBonus,
      userElement,
      rootType: user.bazi?.rootName || '未知',
      celestialInfo: {
        weather: celestialInfo.weather.weather,
        temperature: celestialInfo.weather.temperature,
        wuYunQi: celestialInfo.wuYunLiuQi.mainQi.name,
        ziWuMeridian: celestialInfo.ziWuLiuZhu.meridian,
        moonPhase: celestialInfo.moonPhase.name,
        totalBonus: celestialInfo.bonus.total,
      },
      isBreakthrough: false,
    });

    // 保存总结到数据库
    const summary = await prisma.dailySummary.create({
      data: {
        userId,
        date: today,
        todayMinutes,
        expGained: todayExp,
        bonusApplied: avgBonus,
        greeting: aiResult.greeting,
        cultivationReview: aiResult.cultivationReview,
        insight: aiResult.insight,
        wisdom: aiResult.wisdom,
        suggestion: aiResult.suggestion,
        goldenQuote: aiResult.goldenQuote,
      },
    });

    res.json({
      summary: {
        date: summary.date.toISOString().split('T')[0],
        todayMinutes: summary.todayMinutes,
        expGained: summary.expGained,
        bonusApplied: summary.bonusApplied,
        greeting: summary.greeting,
        cultivationReview: summary.cultivationReview,
        insight: summary.insight,
        wisdom: summary.wisdom,
        suggestion: summary.suggestion,
        goldenQuote: summary.goldenQuote,
      },
      isNew: true,
    });
  } catch (error) {
    console.error('生成总结失败:', error);
    res.status(500).json({ error: '生成失败' });
  }
});

/**
 * 获取历史总结列表
 * GET /api/summary/history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 7;

    const summaries = await prisma.dailySummary.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    res.json({
      summaries: summaries.map((s) => ({
        date: s.date.toISOString().split('T')[0],
        todayMinutes: s.todayMinutes,
        expGained: s.expGained,
        goldenQuote: s.goldenQuote,
      })),
    });
  } catch (error) {
    console.error('获取历史总结失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

/**
 * 获取指定日期的总结
 * GET /api/summary/:date
 */
router.get('/:date', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const dateStr = req.params.date;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const summary = await prisma.dailySummary.findFirst({
      where: {
        userId,
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!summary) {
      return res.status(404).json({ error: '未找到该日总结' });
    }

    res.json({
      summary: {
        date: summary.date.toISOString().split('T')[0],
        todayMinutes: summary.todayMinutes,
        expGained: summary.expGained,
        bonusApplied: summary.bonusApplied,
        greeting: summary.greeting,
        cultivationReview: summary.cultivationReview,
        insight: summary.insight,
        wisdom: summary.wisdom,
        suggestion: summary.suggestion,
        goldenQuote: summary.goldenQuote,
      },
    });
  } catch (error) {
    console.error('获取指定日期总结失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

export default router;
