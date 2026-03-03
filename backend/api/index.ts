// 凡人修仙 - Vercel Serverless 完整后端
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// 中间件
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// ========== 常量定义 ==========
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const STEM_ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};
const BRANCH_ELEMENTS: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};
const DAO_NAME_PREFIXES = ['清', '虚', '玄', '灵', '云', '风', '月', '星', '山', '水'];
const DAO_NAME_SUFFIXES = ['虚', '风', '子', '真人', '道人', '居士', '散人', '仙子', '剑', '心'];

// ========== 八字服务 ==========
interface Pillar {
  stem: string;
  branch: string;
  element: string;
}

interface ElementStats {
  金: number; 木: number; 水: number; 火: number; 土: number;
}

interface SpiritualRoot {
  type: string;
  name: string;
  primaryElement: string;
  secondaryElement?: string;
  variantType?: string;
  bonus: number;
  description: string;
}

function getYearPillar(year: number): Pillar {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  return { stem, branch, element: STEM_ELEMENTS[stem] };
}

function getMonthPillar(yearStem: string, month: number): Pillar {
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  const baseMonthStemIndex = (yearStemIndex % 5) * 2;
  const monthStemIndex = (baseMonthStemIndex + month - 1) % 10;
  const monthBranchIndex = (month + 1) % 12;
  const stem = HEAVENLY_STEMS[monthStemIndex];
  const branch = EARTHLY_BRANCHES[monthBranchIndex];
  return { stem, branch, element: STEM_ELEMENTS[stem] };
}

function getDayPillar(year: number, month: number, day: number): Pillar {
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const stemIndex = (diffDays + 10) % 10;
  const branchIndex = (diffDays + 12) % 12;
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  return { stem, branch, element: STEM_ELEMENTS[stem] };
}

function getHourPillar(dayStem: string, hour: number): Pillar {
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const baseHourStemIndex = (dayStemIndex % 5) * 2;
  const zhiIndex = Math.floor((hour + 1) / 2) % 12;
  const hourStemIndex = (baseHourStemIndex + zhiIndex) % 10;
  const stem = HEAVENLY_STEMS[hourStemIndex];
  const branch = EARTHLY_BRANCHES[zhiIndex];
  return { stem, branch, element: STEM_ELEMENTS[stem] };
}

function calculateElementStats(pillars: Pillar[]): ElementStats {
  const stats: ElementStats = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  pillars.forEach(p => {
    stats[STEM_ELEMENTS[p.stem] as keyof ElementStats]++;
    stats[BRANCH_ELEMENTS[p.branch] as keyof ElementStats]++;
  });
  return stats;
}

function determineSpiritualRoot(stats: ElementStats, pillars: Pillar[]): SpiritualRoot {
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  const primaryElement = entries[0][0];
  const primaryCount = entries[0][1];
  const secondaryElement = entries[1][1] > 0 ? entries[1][0] : undefined;
  const secondaryCount = entries[1][1];

  const rootTypes: Record<string, string> = {
    '金': '剑灵根', '木': '青灵根', '水': '玄灵根', '火': '炎灵根', '土': '土灵根'
  };

  let type = 'tian';
  let bonus = 1.0;
  let description = '';

  if (primaryCount >= 4) {
    type = 'tian';
    bonus = 1.5;
    description = '天灵根，万中无一的绝世天才！';
  } else if (primaryCount === 3) {
    type = 'double';
    bonus = 1.3;
    description = '双属性伪灵根，资质上佳。';
  } else {
    type = 'triple';
    bonus = 1.0;
    description = '三属性灵根，平凡但可修炼。';
  }

  return {
    type,
    name: rootTypes[primaryElement],
    primaryElement,
    secondaryElement,
    variantType: type,
    bonus,
    description
  };
}

export function calculateBazi(year: number, month: number, day: number, hour: number) {
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(yearPillar.stem, month);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = getHourPillar(dayPillar.stem, hour);
  const elementStats = calculateElementStats([yearPillar, monthPillar, dayPillar, hourPillar]);
  const spiritualRoot = determineSpiritualRoot(elementStats, [yearPillar, monthPillar, dayPillar, hourPillar]);

  return {
    yearPillar, monthPillar, dayPillar, hourPillar,
    elementStats, spiritualRoot
  };
}

export function generateDaoName(): string {
  const prefix = DAO_NAME_PREFIXES[Math.floor(Math.random() * DAO_NAME_PREFIXES.length)];
  const suffix = DAO_NAME_SUFFIXES[Math.floor(Math.random() * DAO_NAME_SUFFIXES.length)];
  return prefix + suffix;
}

// ========== 认证中间件 ==========
function authMiddleware(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的认证令牌' });
  }
}

// ========== 路由 ==========

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: '用户已存在' });

    let daoName = generateDaoName();
    while (await prisma.user.findUnique({ where: { daoName } })) {
      daoName = generateDaoName();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, daoName, lastLoginAt: new Date() }
    });
    await prisma.cultivation.create({ data: { userId: user.id, realmName: '炼气' } });
    await prisma.resources.create({ data: { userId: user.id, spiritStones: 100 } });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, daoName: user.daoName } });
  } catch (error: any) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败', details: error.message });
  }
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: '用户不存在' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: '密码错误' });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, daoName: user.daoName } });
  } catch (error: any) {
    res.status(500).json({ error: '登录失败', details: error.message });
  }
});

// 八字计算（公开）
app.post('/api/bazi/calculate', (req, res) => {
  try {
    const { year, month, day, hour } = req.body;
    const result = calculateBazi(year, month, day, hour);
    
    // 转换为前端期望的格式
    const formatted = `${result.yearPillar.stem}${result.yearPillar.branch} ${result.monthPillar.stem}${result.monthPillar.branch} ${result.dayPillar.stem}${result.dayPillar.branch} ${result.hourPillar.stem}${result.hourPillar.branch}`;
    
    res.json({
      success: true,
      data: {
        bazi: {
          year: result.yearPillar,
          month: result.monthPillar,
          day: result.dayPillar,
          hour: result.hourPillar
        },
        wuxing: {
          metal: result.elementStats.金,
          wood: result.elementStats.木,
          water: result.elementStats.水,
          fire: result.elementStats.火,
          earth: result.elementStats.土
        },
        lingGen: {
          type: result.spiritualRoot.type,
          name: result.spiritualRoot.name,
          primaryElement: result.spiritualRoot.primaryElement,
          bonus: result.spiritualRoot.bonus,
          description: result.spiritualRoot.description
        },
        formatted
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: '计算失败', details: error.message });
  }
});

// 保存八字（需要登录）
app.post('/api/bazi/save', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const { year, month, day, hour, timezone } = req.body;
    const bazi = calculateBazi(year, month, day, hour);

    await prisma.bazi.upsert({
      where: { userId },
      update: {
        birthYear: year, birthMonth: month, birthDay: day, birthHour: hour, birthMinute: 0, timezone,
        yearStem: bazi.yearPillar.stem, yearBranch: bazi.yearPillar.branch, yearElement: bazi.yearPillar.element,
        monthStem: bazi.monthPillar.stem, monthBranch: bazi.monthPillar.branch, monthElement: bazi.monthPillar.element,
        dayStem: bazi.dayPillar.stem, dayBranch: bazi.dayPillar.branch, dayElement: bazi.dayPillar.element,
        hourStem: bazi.hourPillar.stem, hourBranch: bazi.hourPillar.branch, hourElement: bazi.hourPillar.element,
        metalCount: bazi.elementStats.金, woodCount: bazi.elementStats.木, waterCount: bazi.elementStats.水,
        fireCount: bazi.elementStats.火, earthCount: bazi.elementStats.土,
        rootType: bazi.spiritualRoot.type, rootName: bazi.spiritualRoot.name,
        primaryElement: bazi.spiritualRoot.primaryElement, secondaryElement: bazi.spiritualRoot.secondaryElement,
        variantType: bazi.spiritualRoot.variantType, rootBonus: bazi.spiritualRoot.bonus,
        rootDescription: bazi.spiritualRoot.description
      },
      create: {
        userId: userId, birthYear: year, birthMonth: month, birthDay: day, birthHour: hour, birthMinute: 0, timezone,
        yearStem: bazi.yearPillar.stem, yearBranch: bazi.yearPillar.branch, yearElement: bazi.yearPillar.element,
        monthStem: bazi.monthPillar.stem, monthBranch: bazi.monthPillar.branch, monthElement: bazi.monthPillar.element,
        dayStem: bazi.dayPillar.stem, dayBranch: bazi.dayPillar.branch, dayElement: bazi.dayPillar.element,
        hourStem: bazi.hourPillar.stem, hourBranch: bazi.hourPillar.branch, hourElement: bazi.hourPillar.element,
        metalCount: bazi.elementStats.金, woodCount: bazi.elementStats.木, waterCount: bazi.elementStats.水,
        fireCount: bazi.elementStats.火, earthCount: bazi.elementStats.土,
        rootType: bazi.spiritualRoot.type, rootName: bazi.spiritualRoot.name,
        primaryElement: bazi.spiritualRoot.primaryElement, secondaryElement: bazi.spiritualRoot.secondaryElement,
        variantType: bazi.spiritualRoot.variantType, rootBonus: bazi.spiritualRoot.bonus,
        rootDescription: bazi.spiritualRoot.description
      }
    });

    res.json({ success: true, bazi });
  } catch (error: any) {
    res.status(500).json({ error: '保存失败', details: error.message });
  }
});

// 获取我的八字（需要登录）
app.get('/api/bazi/my', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const bazi = await prisma.bazi.findUnique({ where: { userId } });
    if (!bazi) return res.status(404).json({ error: '未找到八字信息' });
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    res.json({
      success: true,
      data: {
        user: { id: user?.id, email: user?.email, daoName: user?.daoName },
        birthInfo: {
          year: bazi.birthYear,
          month: bazi.birthMonth,
          day: bazi.birthDay,
          hour: bazi.birthHour,
          minute: bazi.birthMinute
        },
        bazi: {
          year: { stem: bazi.yearStem, branch: bazi.yearBranch, element: bazi.yearElement },
          month: { stem: bazi.monthStem, branch: bazi.monthBranch, element: bazi.monthElement },
          day: { stem: bazi.dayStem, branch: bazi.dayBranch, element: bazi.dayElement },
          hour: { stem: bazi.hourStem, branch: bazi.hourBranch, element: bazi.hourElement }
        },
        wuxing: {
          metal: bazi.metalCount,
          wood: bazi.woodCount,
          water: bazi.waterCount,
          fire: bazi.fireCount,
          earth: bazi.earthCount
        },
        lingGen: {
          type: bazi.rootType,
          name: bazi.rootName,
          primaryElement: bazi.primaryElement,
          secondaryElement: bazi.secondaryElement,
          bonus: bazi.rootBonus,
          description: bazi.rootDescription
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: '获取失败', details: error.message });
  }
});

// 获取修炼状态
app.get('/api/cultivation/status', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    const cultivation = await prisma.cultivation.findUnique({ where: { userId } });
    const resources = await prisma.resources.findUnique({ where: { userId } });
    res.json({ cultivation, resources });
  } catch (error: any) {
    res.status(500).json({ error: '获取失败', details: error.message });
  }
});

// 开始修炼
app.post('/api/cultivation/start', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    const cultivation = await prisma.cultivation.update({
      where: { userId },
      data: { isCultivating: true, cultivateStartAt: new Date() }
    });
    res.json({ success: true, cultivation });
  } catch (error: any) {
    res.status(500).json({ error: '开始修炼失败', details: error.message });
  }
});

// 结束修炼
app.post('/api/cultivation/stop', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    const cultivation = await prisma.cultivation.findUnique({ where: { userId } });
    if (!cultivation || !cultivation.isCultivating) {
      return res.status(400).json({ error: '当前不在修炼状态' });
    }

    const startAt = cultivation.cultivateStartAt || new Date();
    const now = new Date();
    const minutes = Math.floor((now.getTime() - startAt.getTime()) / (1000 * 60));
    const expGained = minutes * 10; // 每分钟10经验

    const updated = await prisma.cultivation.update({
      where: { userId },
      data: {
        isCultivating: false,
        todayMinutes: cultivation.todayMinutes + minutes,
        currentExp: cultivation.currentExp + expGained,
        totalExp: cultivation.totalExp + expGained,
        lastCultivateAt: now
      }
    });

    res.json({ success: true, cultivation: updated, expGained, minutes });
  } catch (error: any) {
    res.status(500).json({ error: '结束修炼失败', details: error.message });
  }
});

// 错误处理
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: '服务器内部错误', details: err.message });
});

export default app;
