import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  calculateBazi,
  BaziResult,
  isValidDate,
  formatBazi,
} from '../utils/baziCalculator.js';

const prisma = new PrismaClient();

/**
 * 计算并保存八字
 * POST /api/v1/bazi/calculate
 */
export async function calculateAndSaveBazi(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: '未登录',
      });
      return;
    }

    const {
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute = 0,
      timezone = 'Asia/Shanghai',
    } = req.body;

    // 参数验证
    if (!birthYear || !birthMonth || !birthDay || birthHour === undefined) {
      res.status(400).json({
        success: false,
        error: '缺少必要参数: birthYear, birthMonth, birthDay, birthHour',
      });
      return;
    }

    // 验证日期有效性
    if (!isValidDate(birthYear, birthMonth, birthDay)) {
      res.status(400).json({
        success: false,
        error: '无效的日期',
      });
      return;
    }

    // 验证时间范围
    if (birthHour < 0 || birthHour > 23) {
      res.status(400).json({
        success: false,
        error: 'birthHour 必须在 0-23 之间',
      });
      return;
    }

    // 计算八字
    const result: BaziResult = calculateBazi(
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute,
      timezone
    );

    // 保存到数据库
    const bazi = await prisma.bazi.upsert({
      where: { userId },
      create: {
        userId,
        birthYear,
        birthMonth,
        birthDay,
        birthHour,
        birthMinute,
        yearStem: result.bazi.year.stem,
        yearBranch: result.bazi.year.branch,
        yearElement: result.bazi.year.element,
        monthStem: result.bazi.month.stem,
        monthBranch: result.bazi.month.branch,
        monthElement: result.bazi.month.element,
        dayStem: result.bazi.day.stem,
        dayBranch: result.bazi.day.branch,
        dayElement: result.bazi.day.element,
        hourStem: result.bazi.hour.stem,
        hourBranch: result.bazi.hour.branch,
        hourElement: result.bazi.hour.element,
        metalCount: result.wuxing.metal,
        woodCount: result.wuxing.wood,
        waterCount: result.wuxing.water,
        fireCount: result.wuxing.fire,
        earthCount: result.wuxing.earth,
        rootType: result.lingGen.type,
        rootName: result.lingGen.name,
        primaryElement: result.lingGen.primaryElement,
        secondaryElement: result.lingGen.secondaryElement,
        rootBonus: result.lingGen.bonus,
        rootDescription: result.lingGen.description,
        calculatedAt: new Date(),
      },
      update: {
        birthYear,
        birthMonth,
        birthDay,
        birthHour,
        birthMinute,
        yearStem: result.bazi.year.stem,
        yearBranch: result.bazi.year.branch,
        yearElement: result.bazi.year.element,
        monthStem: result.bazi.month.stem,
        monthBranch: result.bazi.month.branch,
        monthElement: result.bazi.month.element,
        dayStem: result.bazi.day.stem,
        dayBranch: result.bazi.day.branch,
        dayElement: result.bazi.day.element,
        hourStem: result.bazi.hour.stem,
        hourBranch: result.bazi.hour.branch,
        hourElement: result.bazi.hour.element,
        metalCount: result.wuxing.metal,
        woodCount: result.wuxing.wood,
        waterCount: result.wuxing.water,
        fireCount: result.wuxing.fire,
        earthCount: result.wuxing.earth,
        rootType: result.lingGen.type,
        rootName: result.lingGen.name,
        primaryElement: result.lingGen.primaryElement,
        secondaryElement: result.lingGen.secondaryElement,
        rootBonus: result.lingGen.bonus,
        rootDescription: result.lingGen.description,
        calculatedAt: new Date(),
      },
    });

    // 返回符合 API 规范的响应
    res.json({
      success: true,
      data: {
        bazi: {
          year: {
            stem: result.bazi.year.stem,
            branch: result.bazi.year.branch,
            element: result.bazi.year.element,
          },
          month: {
            stem: result.bazi.month.stem,
            branch: result.bazi.month.branch,
            element: result.bazi.month.element,
          },
          day: {
            stem: result.bazi.day.stem,
            branch: result.bazi.day.branch,
            element: result.bazi.day.element,
          },
          hour: {
            stem: result.bazi.hour.stem,
            branch: result.bazi.hour.branch,
            element: result.bazi.hour.element,
          },
        },
        wuxing: {
          metal: result.wuxing.metal,
          wood: result.wuxing.wood,
          water: result.wuxing.water,
          fire: result.wuxing.fire,
          earth: result.wuxing.earth,
        },
        lingGen: {
          type: result.lingGen.type,
          name: result.lingGen.name,
          primaryElement: result.lingGen.primaryElement,
          secondaryElement: result.lingGen.secondaryElement,
          bonus: result.lingGen.bonus,
          description: result.lingGen.description,
        },
      },
    });
  } catch (error) {
    console.error('计算八字失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
}

/**
 * 获取当前用户八字
 * GET /api/v1/bazi/me
 */
export async function getMyBazi(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: '未登录',
      });
      return;
    }

    const bazi = await prisma.bazi.findUnique({
      where: { userId },
    });

    if (!bazi) {
      res.status(404).json({
        success: false,
        error: '尚未设置八字，请先调用 /api/v1/bazi/calculate',
      });
      return;
    }

    // 返回符合 API 规范的响应
    res.json({
      success: true,
      data: {
        birthInfo: {
          year: bazi.birthYear,
          month: bazi.birthMonth,
          day: bazi.birthDay,
          hour: bazi.birthHour,
          minute: bazi.birthMinute,
        },
        bazi: {
          year: {
            stem: bazi.yearStem,
            branch: bazi.yearBranch,
            element: bazi.yearElement,
          },
          month: {
            stem: bazi.monthStem,
            branch: bazi.monthBranch,
            element: bazi.monthElement,
          },
          day: {
            stem: bazi.dayStem,
            branch: bazi.dayBranch,
            element: bazi.dayElement,
          },
          hour: {
            stem: bazi.hourStem,
            branch: bazi.hourBranch,
            element: bazi.hourElement,
          },
        },
        wuxing: {
          metal: bazi.metalCount,
          wood: bazi.woodCount,
          water: bazi.waterCount,
          fire: bazi.fireCount,
          earth: bazi.earthCount,
        },
        lingGen: {
          type: bazi.rootType,
          name: bazi.rootName,
          primaryElement: bazi.primaryElement,
          secondaryElement: bazi.secondaryElement || undefined,
          bonus: bazi.rootBonus,
          description: bazi.rootDescription,
        },
        calculatedAt: bazi.calculatedAt,
      },
    });
  } catch (error) {
    console.error('获取八字失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
}

/**
 * 纯计算八字（不保存）
 * POST /api/v1/bazi/compute
 */
export async function computeBaziOnly(req: Request, res: Response): Promise<void> {
  try {
    const {
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute = 0,
      timezone = 'Asia/Shanghai',
    } = req.body;

    // 参数验证
    if (!birthYear || !birthMonth || !birthDay || birthHour === undefined) {
      res.status(400).json({
        success: false,
        error: '缺少必要参数: birthYear, birthMonth, birthDay, birthHour',
      });
      return;
    }

    // 验证日期有效性
    if (!isValidDate(birthYear, birthMonth, birthDay)) {
      res.status(400).json({
        success: false,
        error: '无效的日期',
      });
      return;
    }

    // 验证时间范围
    if (birthHour < 0 || birthHour > 23) {
      res.status(400).json({
        success: false,
        error: 'birthHour 必须在 0-23 之间',
      });
      return;
    }

    // 计算八字
    const result: BaziResult = calculateBazi(
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute,
      timezone
    );

    res.json({
      success: true,
      data: {
        bazi: {
          year: {
            stem: result.bazi.year.stem,
            branch: result.bazi.year.branch,
            element: result.bazi.year.element,
          },
          month: {
            stem: result.bazi.month.stem,
            branch: result.bazi.month.branch,
            element: result.bazi.month.element,
          },
          day: {
            stem: result.bazi.day.stem,
            branch: result.bazi.day.branch,
            element: result.bazi.day.element,
          },
          hour: {
            stem: result.bazi.hour.stem,
            branch: result.bazi.hour.branch,
            element: result.bazi.hour.element,
          },
        },
        wuxing: {
          metal: result.wuxing.metal,
          wood: result.wuxing.wood,
          water: result.wuxing.water,
          fire: result.wuxing.fire,
          earth: result.wuxing.earth,
        },
        lingGen: {
          type: result.lingGen.type,
          name: result.lingGen.name,
          primaryElement: result.lingGen.primaryElement,
          secondaryElement: result.lingGen.secondaryElement,
          bonus: result.lingGen.bonus,
          description: result.lingGen.description,
        },
        formatted: formatBazi(result.bazi),
      },
    });
  } catch (error) {
    console.error('计算八字失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
}
