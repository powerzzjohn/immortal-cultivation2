// 凡人修仙 - Vercel Serverless 完整后端
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// 中间件
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
    res.json({
      bazi: {
        yearPillar: result.yearPillar,
        monthPillar: result.monthPillar,
        dayPillar: result.dayPillar,
        hourPillar: result.hourPillar
      },
      elementStats: result.elementStats,
      spiritualRoot: result.spiritualRoot
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

// ========== 天时系统API ==========

// 获取当前天时数据
app.get('/api/celestial/now', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    // 获取用户灵根属性
    const bazi = await prisma.bazi.findUnique({
      where: { userId },
      select: { primaryElement: true },
    });
    
    if (!bazi) {
      return res.status(400).json({ error: '请先设置八字' });
    }
    
    // 获取当前时间
    const now = new Date();
    const hour = now.getHours();
    
    // 模拟天气数据（实际应调用天气API）
    const weather = {
      temperature: 22,
      weather: '晴',
      humidity: 60,
      windDirection: '东北',
      windScale: '2',
      pressure: 1013,
      visibility: 10,
    };
    
    // 计算五运六气（简化版）
    const year = now.getFullYear();
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const yearStem = stems[(year - 4) % 10];
    const yearBranch = branches[(year - 4) % 12];
    
    const wuYunLiuQi = {
      yearLuck: { element: '木', type: '太角' },
      mainQi: { name: '厥阴风木', element: '木' },
      guestQi: { siTian: '厥阴风木', zaiQuan: '少阳相火' },
      currentSolarTerm: '立春',
    };
    
    // 子午流注
    const timeRanges = [
      { hour: 23, endHour: 1, branch: '子', meridian: '胆经', element: '木', yinYang: '阳' },
      { hour: 1, endHour: 3, branch: '丑', meridian: '肝经', element: '木', yinYang: '阴' },
      { hour: 3, endHour: 5, branch: '寅', meridian: '肺经', element: '金', yinYang: '阴' },
      { hour: 5, endHour: 7, branch: '卯', meridian: '大肠经', element: '金', yinYang: '阳' },
      { hour: 7, endHour: 9, branch: '辰', meridian: '胃经', element: '土', yinYang: '阳' },
      { hour: 9, endHour: 11, branch: '巳', meridian: '脾经', element: '土', yinYang: '阴' },
      { hour: 11, endHour: 13, branch: '午', meridian: '心经', element: '火', yinYang: '阴' },
      { hour: 13, endHour: 15, branch: '未', meridian: '小肠经', element: '火', yinYang: '阳' },
      { hour: 15, endHour: 17, branch: '申', meridian: '膀胱经', element: '水', yinYang: '阳' },
      { hour: 17, endHour: 19, branch: '酉', meridian: '肾经', element: '水', yinYang: '阴' },
      { hour: 19, endHour: 21, branch: '戌', meridian: '心包经', element: '火', yinYang: '阴' },
      { hour: 21, endHour: 23, branch: '亥', meridian: '三焦经', element: '火', yinYang: '阳' },
    ];
    
    const ziWuLiuZhu = timeRanges.find(t => 
      (t.hour <= t.endHour && hour >= t.hour && hour < t.endHour) ||
      (t.hour > t.endHour && (hour >= t.hour || hour < t.endHour))
    ) || timeRanges[0];
    
    // 月相（简化计算）
    const knownNewMoon = new Date(2000, 0, 6);
    const diffDays = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const synodicMonth = 29.53058867;
    const phase = ((diffDays % synodicMonth) / synodicMonth);
    const normalizedPhase = phase < 0 ? phase + 1 : phase;
    
    const moonPhase = {
      name: normalizedPhase < 0.5 ? '盈凸月' : '亏凸月',
      phase: normalizedPhase,
      bonus: 1.10,
      desc: '月华充盈，能量上升',
    };
    
    // 计算修炼加成
    const weatherBonus = weather.weather === '晴' ? 1.10 : 1.00;
    const tempBonus = weather.temperature >= 15 && weather.temperature <= 25 ? 1.05 : 0.98;
    const qiBonus = 1.00;
    const meridianBonus = 1.00;
    const hourBonus = hour === 23 || hour === 0 || hour >= 21 ? 1.10 : 
                      hour >= 3 && hour <= 6 ? 1.08 : 
                      hour >= 11 && hour <= 12 ? 0.95 : 1.00;
    const moonBonus = moonPhase.bonus;
    
    const totalBonus = 
      weatherBonus * 0.15 +
      tempBonus * 0.10 +
      qiBonus * 0.25 +
      meridianBonus * 0.20 +
      hourBonus * 0.10 +
      moonBonus * 0.20;
    
    res.json({
      weather,
      wuYunLiuQi,
      ziWuLiuZhu,
      moonPhase,
      bonus: {
        total: parseFloat(totalBonus.toFixed(2)),
        details: {
          weather: { factor: '天气', value: weatherBonus, desc: weather.weather },
          temperature: { factor: '温度', value: tempBonus, desc: `${weather.temperature}°C` },
          wuYun: { factor: '五运六气', value: qiBonus, desc: wuYunLiuQi.mainQi.name },
          ziWu: { factor: '子午流注', value: meridianBonus, desc: `${ziWuLiuZhu.branch}时 ${ziWuLiuZhu.meridian}` },
          hour: { factor: '时辰', value: hourBonus, desc: `${ziWuLiuZhu.branch}时` },
          moon: { factor: '月相', value: moonBonus, desc: moonPhase.name },
        },
      },
    });
  } catch (error: any) {
    console.error('获取天时数据失败:', error);
    res.status(500).json({ error: '获取失败', details: error.message });
  }
});

// 获取月相
app.get('/api/celestial/moon', authMiddleware, async (req: any, res: any) => {
  try {
    const now = new Date();
    const knownNewMoon = new Date(2000, 0, 6);
    const diffDays = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const synodicMonth = 29.53058867;
    const phase = ((diffDays % synodicMonth) / synodicMonth);
    const normalizedPhase = phase < 0 ? phase + 1 : phase;
    
    res.json({
      name: normalizedPhase < 0.5 ? '盈凸月' : '亏凸月',
      phase: normalizedPhase,
      bonus: 1.10,
      desc: '月华充盈，能量上升',
    });
  } catch (error: any) {
    res.status(500).json({ error: '获取月相失败', details: error.message });
  }
});

// ========== AI对话API ==========

// 发送消息给NPC
app.post('/api/chat/send', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: '消息不能为空' });
    
    // 保存用户消息
    await prisma.chatMessage.create({
      data: { userId, role: 'user', content: message },
    });
    
    // 获取用户上下文
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const cultivation = await prisma.cultivation.findUnique({ where: { userId } });
    
    // 调用Kimi API获取NPC回复
    const npcResponse = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2-0711-preview',
        messages: [
          {
            role: 'system',
            content: `你是南宫婉，一位化神期的修仙前辈。你正在指导一位刚入门的道友（${cultivation?.realmName || '炼气'}期）修炼。

当前用户信息：
- 道号: ${user?.daoName || '道友'}
- 境界: ${cultivation?.realmName || '炼气'}
- 修炼天数: ${cultivation?.totalDays || 0}天
- 今日修炼: ${cultivation?.todayMinutes || 0}分钟

你的性格特点：
- 温柔智慧，有耐心
- 熟悉道德经、庄子等道家经典
- 说话带有修仙氛围（使用"道友"、"修炼"、"境界"等词）
- 会根据用户修炼情况给予鼓励或建议

回复要求：
1. 保持人设，用第一人称"我"
2. 适当引用经典（道德经、庄子等）
3. 根据用户修炼情况给予鼓励或建议
4. 回复简短精炼（50-100字）`,
          },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });
    
    const aiData: any = await npcResponse.json();
    const npcReply = aiData.choices?.[0]?.message?.content || '道友，今日修仙可好？';
    
    // 保存NPC回复
    await prisma.chatMessage.create({
      data: { userId, role: 'npc', content: npcReply },
    });
    
    res.json({ success: true, reply: npcReply });
  } catch (error: any) {
    console.error('AI对话失败:', error);
    res.status(500).json({ error: '对话失败', details: error.message });
  }
});

// 获取聊天历史
app.get('/api/chat/history', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    
    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ error: '获取历史失败', details: error.message });
  }
});

// ========== 每日总结API ==========

// 获取今日总结
app.get('/api/wisdom/today', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 查找今日是否已有总结
    const existingSummary = await prisma.dailySummary.findFirst({
      where: { userId, date: { gte: today } },
    });
    
    if (existingSummary) {
      return res.json({ success: true, summary: existingSummary });
    }
    
    // 获取用户数据
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const cultivation = await prisma.cultivation.findUnique({ where: { userId } });
    const bazi = await prisma.bazi.findUnique({ where: { userId } });
    
    // 生成总结内容（简化版，实际应调用AI）
    const summary = {
      greeting: `道友${user?.daoName}，今日辛苦了。`,
      cultivationReview: `今日修炼${cultivation?.todayMinutes || 0}分钟，在你的丹田之中，一个低熵有序的能量场正在形成。`,
      insight: '今日修炼状态平稳，意念专注度良好。继续坚持，筑基可期。',
      wisdom: '《金丹工程》云：局域负熵，乃生命之本。修炼即是抵抗熵增的过程。',
      suggestion: '明日建议：保持当前修炼节奏，注意呼吸与意念的配合。',
      goldenQuote: '合抱之木，生于毫末；九层之台，起于累土。',
    };
    
    // 保存总结
    const savedSummary = await prisma.dailySummary.create({
      data: {
        userId,
        date: new Date(),
        todayMinutes: cultivation?.todayMinutes || 0,
        expGained: 0,
        bonusApplied: 1.0,
        ...summary,
      },
    });
    
    res.json({ success: true, summary: savedSummary });
  } catch (error: any) {
    res.status(500).json({ error: '获取总结失败', details: error.message });
  }
});

// 获取历史总结
app.get('/api/wisdom/history', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const summaries = await prisma.dailySummary.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    
    res.json({ success: true, summaries });
  } catch (error: any) {
    res.status(500).json({ error: '获取历史失败', details: error.message });
  }
});

// ========== 补充前端需要的别名路由 ==========

// /api/wisdom/daily-summary -> 映射到 /api/wisdom/today
app.get('/api/wisdom/daily-summary', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 查找今日是否已有总结
    const existingSummary = await prisma.dailySummary.findFirst({
      where: { userId, date: { gte: today } },
    });
    
    if (existingSummary) {
      return res.json({ summary: existingSummary });
    }
    
    // 返回空
    res.json({ summary: null });
  } catch (error: any) {
    res.status(500).json({ error: '获取总结失败', details: error.message });
  }
});

// /api/summary/* 路由
app.get('/api/summary/today', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const summary = await prisma.dailySummary.findFirst({
      where: { userId, date: { gte: today } },
    });
    
    if (summary) {
      return res.json({ 
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
        isNew: false 
      });
    }
    
    res.json({ summary: null, isNew: false, message: '今日尚未修炼完成，暂无总结' });
  } catch (error: any) {
    res.status(500).json({ error: '获取失败', details: error.message });
  }
});

app.post('/api/summary/generate', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    if (!userId) return res.status(401).json({ error: '未认证' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 检查是否已存在
    const existing = await prisma.dailySummary.findFirst({
      where: { userId, date: { gte: today } },
    });
    
    if (existing) {
      return res.json({ 
        summary: {
          date: existing.date.toISOString().split('T')[0],
          todayMinutes: existing.todayMinutes,
          expGained: existing.expGained,
          bonusApplied: existing.bonusApplied,
          greeting: existing.greeting,
          cultivationReview: existing.cultivationReview,
          insight: existing.insight,
          wisdom: existing.wisdom,
          suggestion: existing.suggestion,
          goldenQuote: existing.goldenQuote,
        },
        isNew: false 
      });
    }
    
    // 获取用户数据生成总结
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const cultivation = await prisma.cultivation.findUnique({ where: { userId } });
    
    if (!cultivation || cultivation.todayMinutes === 0) {
      return res.status(400).json({ error: '今日无修炼记录，无法生成总结' });
    }
    
    // 生成总结内容
    const summaryData = {
      greeting: `道友${user?.daoName}，${new Date().getHours() < 12 ? '早安' : new Date().getHours() < 18 ? '午安' : '晚安'}。`,
      cultivationReview: `今日修炼${cultivation.todayMinutes}分钟，获得${cultivation.todayMinutes * 10}点经验。在你的坚持之下，灵气正在丹田中缓缓汇聚。`,
      insight: `今日${cultivation.todayMinutes >= 30 ? '修炼勤勉' : '修炼时间较短'}，${cultivation.todayMinutes >= 30 ? '丹田之中已有灵气流转，假以时日必有所成。' : '建议明日增加修炼时长，稳固根基。'}`,
      wisdom: '《金丹工程》认为：修炼的本质是建立人体局域负熵核心，通过与宇宙背景场的能量耦合，实现生命层次的跃迁。',
      suggestion: cultivation.todayMinutes >= 30 
        ? '明日建议：保持当前节奏，注意子时(23:00-1:00)为最佳修炼时辰。'
        : '明日建议：尝试修炼至少30分钟，让灵气在经脉中充分流转。',
      goldenQuote: '合抱之木，生于毫末；九层之台，起于累土。',
    };
    
    const saved = await prisma.dailySummary.create({
      data: {
        userId,
        date: new Date(),
        todayMinutes: cultivation.todayMinutes,
        expGained: cultivation.todayMinutes * 10,
        bonusApplied: 1.0,
        ...summaryData,
      },
    });
    
    res.json({
      summary: {
        date: saved.date.toISOString().split('T')[0],
        todayMinutes: saved.todayMinutes,
        expGained: saved.expGained,
        bonusApplied: saved.bonusApplied,
        greeting: saved.greeting,
        cultivationReview: saved.cultivationReview,
        insight: saved.insight,
        wisdom: saved.wisdom,
        suggestion: saved.suggestion,
        goldenQuote: saved.goldenQuote,
      },
      isNew: true,
    });
  } catch (error: any) {
    res.status(500).json({ error: '生成失败', details: error.message });
  }
});

app.get('/api/summary/history', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    const limit = parseInt(req.query.limit as string) || 7;
    
    const summaries = await prisma.dailySummary.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
    
    res.json({
      summaries: summaries.map(s => ({
        date: s.date.toISOString().split('T')[0],
        todayMinutes: s.todayMinutes,
        expGained: s.expGained,
        goldenQuote: s.goldenQuote,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: '获取失败', details: error.message });
  }
});

app.get('/api/summary/:date', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId as string;
    const dateStr = req.params.date;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    
    const summary = await prisma.dailySummary.findFirst({
      where: {
        userId,
        date: { gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) },
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
  } catch (error: any) {
    res.status(500).json({ error: '获取失败', details: error.message });
  }
});

// 错误处理
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: '服务器内部错误', details: err.message });
});

export default app;
