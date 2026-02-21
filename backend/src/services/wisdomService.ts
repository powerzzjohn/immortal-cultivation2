import { PrismaClient } from '@prisma/client';
import { getDailyQuote, getRandomQuote, ALL_QUOTES, type WisdomQuote } from '../config/wisdom.js';

const prisma = new PrismaClient();

export interface DailyWisdom {
  quote: WisdomQuote;
  isFirstView: boolean;
  totalViews: number;
}

export interface DailySummary {
  date: string;
  cultivationMinutes: number;
  expGained: number;
  realmProgress: number;
  spiritStonesEarned: number;
  dailyQuote: WisdomQuote;
  cultivationTip: string;
  celestialInfo?: {
    weather: string;
    moonPhase: string;
    bestCultivationTime: string;
  };
}

/**
 * 获取用户当日箴言
 * 每人每天看到相同的箴言，与日期绑定
 */
export async function getUserDailyWisdom(
  userId: string,
  userElement?: string
): Promise<DailyWisdom> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 检查今天是否已记录箴言
  let dailyRecord = await prisma.dailyWisdom.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  const quote = getDailyQuote(today, userElement);
  let isFirstView = false;

  if (!dailyRecord) {
    // 首次查看，创建记录
    dailyRecord = await prisma.dailyWisdom.create({
      data: {
        userId,
        date: today,
        quoteId: quote.id,
        viewCount: 1,
      },
    });
    isFirstView = true;
  } else {
    // 增加查看次数
    dailyRecord = await prisma.dailyWisdom.update({
      where: { id: dailyRecord.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return {
    quote,
    isFirstView,
    totalViews: dailyRecord.viewCount,
  };
}

/**
 * 获取随机箴言（刷新/探索用）
 */
export function getRandomWisdom(
  category?: WisdomQuote['category'],
  element?: string
): WisdomQuote {
  return getRandomQuote(category, element);
}

/**
 * 获取箴言集合
 */
export function getWisdomCollection(
  category?: WisdomQuote['category'],
  element?: string
): WisdomQuote[] {
  let pool = ALL_QUOTES;
  if (category) {
    pool = pool.filter((q) => q.category === category);
  }
  if (element) {
    pool = pool.filter((q) => q.element === element);
  }
  return pool;
}

/**
 * 生成每日总结
 */
export async function generateDailySummary(
  userId: string,
  date: Date = new Date()
): Promise<DailySummary | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 获取用户修炼记录
  const cultivation = await prisma.cultivation.findUnique({
    where: { userId },
  });

  if (!cultivation) {
    return null;
  }

  // 获取用户八字信息
  const bazi = await prisma.bazi.findUnique({
    where: { userId },
  });

  const userElement = bazi?.primaryElement || undefined;

  // 获取今日修炼统计（从修炼日志中计算）
  const cultivationLogs = await prisma.cultivationLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const todayMinutes = cultivationLogs.reduce((sum, log) => sum + log.minutes, 0);
  const todayExp = cultivationLogs.reduce((sum, log) => sum + log.expGained, 0);

  // 获取资源变动
  const resourceChanges = await prisma.resourceLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      type: 'reward',
    },
  });

  const spiritStonesEarned = resourceChanges
    .filter((log) => log.resourceType === 'spiritStones')
    .reduce((sum, log) => sum + log.amount, 0);

  // 计算境界进度
  const currentRealm = cultivation.realm;
  // 从constants导入境界配置
  const { getRealmByLevel } = await import('../config/constants.js');
  const realmConfig = getRealmByLevel(currentRealm);
  const realmProgress = realmConfig
    ? Math.round((cultivation.currentExp / realmConfig.maxExp) * 100)
    : 0;

  // 获取当日箴言
  const dailyQuote = getDailyQuote(date, userElement);

  // 生成修炼建议
  const cultivationTip = generateCultivationTip(userElement, todayMinutes);

  return {
    date: startOfDay.toISOString().split('T')[0],
    cultivationMinutes: todayMinutes,
    expGained: todayExp,
    realmProgress,
    spiritStonesEarned,
    dailyQuote,
    cultivationTip,
  };
}

/**
 * 生成修炼建议
 */
function generateCultivationTip(userElement?: string, todayMinutes: number = 0): string {
  const tips: Record<string, string[]> = {
    金: [
      '金属性主收敛，今日宜静坐内观，收敛神气。',
      '金气肃杀，修炼时注意呼吸绵长，如金属般坚韧。',
      '西方属金，今日面向西方修炼效果更佳。',
    ],
    木: [
      '木主生发，今日宜早起修炼，借朝阳生发之气。',
      '木性条达，修炼时保持心情舒畅，忌抑郁。',
      '东方属木，今日面向东方吸纳生发之气。',
    ],
    水: [
      '水性润下，今日修炼宜静不宜动，重在内养。',
      '水主智慧，修炼时可多体悟心法，少行气功。',
      '北方属水，子时修炼效果最佳。',
    ],
    火: [
      '火性炎上，今日修炼注意清心降火，勿急躁。',
      '火主神明，今日可多冥想，炼神还虚。',
      '南方属火，午时阳气最盛，适度修炼。',
    ],
    土: [
      '土性中和，今日修炼平稳进行，不急不躁。',
      '土主脾胃，修炼前后注意饮食调养。',
      '中央属土，任何时辰修炼皆宜。',
    ],
  };

  // 根据修炼时长给出建议
  if (todayMinutes < 30) {
    return '今日修炼时间较短，建议明日至少修炼30分钟以上，方能稳固根基。';
  } else if (todayMinutes > 120) {
    return '今日修炼勤勉，但需注意劳逸结合，过度修炼恐伤身。';
  }

  if (userElement && tips[userElement]) {
    return tips[userElement][Math.floor(Math.random() * tips[userElement].length)];
  }

  return '修炼之道，贵在坚持。保持平常心，日日精进。';
}

/**
 * 记录用户箴言感悟
 */
export async function recordWisdomInsight(
  userId: string,
  quoteId: string,
  insight: string
): Promise<void> {
  await prisma.wisdomInsight.create({
    data: {
      userId,
      quoteId,
      insight,
    },
  });
}

/**
 * 获取用户箴言感悟历史
 */
export async function getUserWisdomInsights(
  userId: string,
  limit: number = 10
): Promise<Array<{ quote: WisdomQuote; insight: string; createdAt: Date }>> {
  const insights = await prisma.wisdomInsight.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return insights.map((i) => ({
    quote: ALL_QUOTES.find((q) => q.id === i.quoteId) || ALL_QUOTES[0],
    insight: i.insight,
    createdAt: i.createdAt,
  }));
}
