import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateBazi } from '../services/baziService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 计算并保存八字
router.post('/calculate', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { year, month, day, hour, minute } = req.body;
    
    // 计算八字
    const baziResult = calculateBazi(year, month, day, hour);
    
    // 保存到数据库
    const bazi = await prisma.bazi.upsert({
      where: { userId },
      create: {
        userId,
        birthYear: year,
        birthMonth: month,
        birthDay: day,
        birthHour: hour,
        birthMinute: minute || 0,
        yearStem: baziResult.yearPillar.stem,
        yearBranch: baziResult.yearPillar.branch,
        yearElement: baziResult.yearPillar.element,
        monthStem: baziResult.monthPillar.stem,
        monthBranch: baziResult.monthPillar.branch,
        monthElement: baziResult.monthPillar.element,
        dayStem: baziResult.dayPillar.stem,
        dayBranch: baziResult.dayPillar.branch,
        dayElement: baziResult.dayPillar.element,
        hourStem: baziResult.hourPillar.stem,
        hourBranch: baziResult.hourPillar.branch,
        hourElement: baziResult.hourPillar.element,
        metalCount: baziResult.elementStats.金,
        woodCount: baziResult.elementStats.木,
        waterCount: baziResult.elementStats.水,
        fireCount: baziResult.elementStats.火,
        earthCount: baziResult.elementStats.土,
        rootType: baziResult.spiritualRoot.type,
        rootName: baziResult.spiritualRoot.name,
        primaryElement: baziResult.spiritualRoot.primaryElement,
        secondaryElement: baziResult.spiritualRoot.secondaryElement,
        variantType: baziResult.spiritualRoot.variantType,
        rootBonus: baziResult.spiritualRoot.bonus,
        rootDescription: baziResult.spiritualRoot.description,
      },
      update: {
        birthYear: year,
        birthMonth: month,
        birthDay: day,
        birthHour: hour,
        birthMinute: minute || 0,
        yearStem: baziResult.yearPillar.stem,
        yearBranch: baziResult.yearPillar.branch,
        yearElement: baziResult.yearPillar.element,
        monthStem: baziResult.monthPillar.stem,
        monthBranch: baziResult.monthPillar.branch,
        monthElement: baziResult.monthPillar.element,
        dayStem: baziResult.dayPillar.stem,
        dayBranch: baziResult.dayPillar.branch,
        dayElement: baziResult.dayPillar.element,
        hourStem: baziResult.hourPillar.stem,
        hourBranch: baziResult.hourPillar.branch,
        hourElement: baziResult.hourPillar.element,
        metalCount: baziResult.elementStats.金,
        woodCount: baziResult.elementStats.木,
        waterCount: baziResult.elementStats.水,
        fireCount: baziResult.elementStats.火,
        earthCount: baziResult.elementStats.土,
        rootType: baziResult.spiritualRoot.type,
        rootName: baziResult.spiritualRoot.name,
        primaryElement: baziResult.spiritualRoot.primaryElement,
        secondaryElement: baziResult.spiritualRoot.secondaryElement,
        variantType: baziResult.spiritualRoot.variantType,
        rootBonus: baziResult.spiritualRoot.bonus,
        rootDescription: baziResult.spiritualRoot.description,
        calculatedAt: new Date(),
      },
    });
    
    res.json({
      bazi: {
        yearPillar: baziResult.yearPillar,
        monthPillar: baziResult.monthPillar,
        dayPillar: baziResult.dayPillar,
        hourPillar: baziResult.hourPillar,
        elementStats: baziResult.elementStats,
        spiritualRoot: baziResult.spiritualRoot,
      },
    });
  } catch (error) {
    console.error('计算八字失败:', error);
    res.status(500).json({ error: '计算失败' });
  }
});

// 获取用户八字
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    
    const bazi = await prisma.bazi.findUnique({
      where: { userId },
    });
    
    if (!bazi) {
      return res.status(404).json({ error: '尚未设置八字' });
    }
    
    res.json({
      bazi: {
        birthYear: bazi.birthYear,
        birthMonth: bazi.birthMonth,
        birthDay: bazi.birthDay,
        birthHour: bazi.birthHour,
        yearPillar: { stem: bazi.yearStem, branch: bazi.yearBranch, element: bazi.yearElement },
        monthPillar: { stem: bazi.monthStem, branch: bazi.monthBranch, element: bazi.monthElement },
        dayPillar: { stem: bazi.dayStem, branch: bazi.dayBranch, element: bazi.dayElement },
        hourPillar: { stem: bazi.hourStem, branch: bazi.hourBranch, element: bazi.hourElement },
        elementStats: {
          金: bazi.metalCount,
          木: bazi.woodCount,
          水: bazi.waterCount,
          火: bazi.fireCount,
          土: bazi.earthCount,
        },
        spiritualRoot: {
          type: bazi.rootType,
          name: bazi.rootName,
          primaryElement: bazi.primaryElement,
          secondaryElement: bazi.secondaryElement,
          variantType: bazi.variantType,
          bonus: bazi.rootBonus,
          description: bazi.rootDescription,
        },
      },
    });
  } catch (error) {
    console.error('获取八字失败:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

export default router;
