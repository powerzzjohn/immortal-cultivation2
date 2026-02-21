import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getUserDailyWisdom,
  getRandomWisdom,
  getWisdomCollection,
  generateDailySummary,
  recordWisdomInsight,
  getUserWisdomInsights,
} from '../services/wisdomService.js';
import { type WisdomQuote } from '../config/wisdom.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/wisdom/daily
 * 获取今日箴言
 */
router.get('/daily', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    
    // 获取用户八字主属性
    const bazi = await prisma.bazi.findUnique({
      where: { userId },
    });
    
    const dailyWisdom = await getUserDailyWisdom(userId, bazi?.primaryElement || undefined);
    
    res.json({
      success: true,
      data: {
        quote: dailyWisdom.quote,
        isFirstView: dailyWisdom.isFirstView,
        totalViews: dailyWisdom.totalViews,
      },
    });
  } catch (error) {
    console.error('获取每日箴言失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

/**
 * GET /api/wisdom/random
 * 获取随机箴言
 */
router.get('/random', authMiddleware, async (req, res) => {
  try {
    const { category, element } = req.query;
    const quote = getRandomWisdom(
      category as WisdomQuote['category'],
      element as string
    );
    
    res.json({
      success: true,
      data: { quote },
    });
  } catch (error) {
    console.error('获取随机箴言失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

/**
 * GET /api/wisdom/collection
 * 获取箴言集合
 */
router.get('/collection', authMiddleware, async (req, res) => {
  try {
    const { category, element } = req.query;
    const quotes = getWisdomCollection(
      category as WisdomQuote['category'],
      element as string
    );
    
    res.json({
      success: true,
      data: {
        quotes,
        total: quotes.length,
      },
    });
  } catch (error) {
    console.error('获取箴言集合失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

/**
 * GET /api/wisdom/daily-summary
 * 获取每日总结
 */
router.get('/daily-summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();
    
    const summary = await generateDailySummary(userId, date);
    
    if (!summary) {
      return res.status(404).json({ error: '未找到修炼记录' });
    }
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('获取每日总结失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

/**
 * POST /api/wisdom/insight
 * 记录箴言感悟
 */
router.post('/insight', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { quoteId, insight } = req.body;
    
    if (!quoteId || !insight) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    await recordWisdomInsight(userId, quoteId, insight);
    
    res.json({
      success: true,
      message: '感悟已记录',
    });
  } catch (error) {
    console.error('记录感悟失败:', error);
    res.status(500).json({ error: '记录失败' });
  }
});

/**
 * GET /api/wisdom/insights
 * 获取用户感悟历史
 */
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const insights = await getUserWisdomInsights(userId, limit);
    
    res.json({
      success: true,
      data: { insights },
    });
  } catch (error) {
    console.error('获取感悟历史失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

/**
 * GET /api/wisdom/categories
 * 获取箴言分类列表
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'philosophy', name: '哲理', description: '道家哲学智慧' },
      { id: 'cultivation', name: '修炼', description: '修真心法要诀' },
      { id: 'universe', name: '宇宙', description: '天地大道法则' },
      { id: 'mind', name: '心性', description: '心性修养之道' },
      { id: 'nature', name: '自然', description: '顺应自然规律' },
    ];
    
    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

export default router;
