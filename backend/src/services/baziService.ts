import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
} from '../config/constants.js';

export interface BaziResult {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  elementStats: ElementStats;
  spiritualRoot: SpiritualRoot;
}

export interface Pillar {
  stem: string;
  branch: string;
  element: string;
}

export interface ElementStats {
  金: number;
  木: number;
  水: number;
  火: number;
  土: number;
}

export interface SpiritualRoot {
  type: 'tian' | 'double' | 'triple' | 'four' | 'five' | 'variant';
  name: string;
  primaryElement: string;
  secondaryElement?: string;
  variantType?: string;
  bonus: number;
  description: string;
}

/**
 * 计算八字
 * @param year 出生年
 * @param month 出生月
 * @param day 出生日
 * @param hour 出生小时（0-23）
 */
export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number
): BaziResult {
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(yearPillar.stem, month, day, hour);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = getHourPillar(dayPillar.stem, hour);

  const elementStats = calculateElementStats([
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
  ]);

  const spiritualRoot = determineSpiritualRoot(elementStats, [
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
  ]);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    elementStats,
    spiritualRoot,
  };
}

/**
 * 计算年柱
 * 公式：(年份 - 4) % 10 得天干，%12 得地支
 */
function getYearPillar(year: number): Pillar {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  return {
    stem,
    branch,
    element: STEM_ELEMENTS[stem],
  };
}

/**
 * 计算月柱
 * 使用简化算法（实际应考虑节气）
 */
function getMonthPillar(
  yearStem: string,
  month: number,
  _day: number,
  _hour: number
): Pillar {
  // 月支固定（正月建寅）
  const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  const branch = monthBranches[month - 1];
  
  // 月干由年干推算（五虎遁）
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  let monthStemStart: number;
  
  if ([0, 5].includes(yearStemIndex)) monthStemStart = 2;      // 甲己 -> 丙
  else if ([1, 6].includes(yearStemIndex)) monthStemStart = 4; // 乙庚 -> 戊
  else if ([2, 7].includes(yearStemIndex)) monthStemStart = 6; // 丙辛 -> 庚
  else if ([3, 8].includes(yearStemIndex)) monthStemStart = 8; // 丁壬 -> 壬
  else monthStemStart = 0;                                      // 戊癸 -> 甲
  
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  const stemIndex = (monthStemStart + branchIndex) % 10;
  const stem = HEAVENLY_STEMS[stemIndex];
  
  return {
    stem,
    branch,
    element: STEM_ELEMENTS[stem],
  };
}

/**
 * 计算日柱
 * 基于1900-01-31为甲子的基准日
 */
function getDayPillar(year: number, month: number, day: number): Pillar {
  const baseDate = new Date(1900, 0, 31);  // 1900-01-31 是甲子日
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const stemIndex = (diffDays + 0) % 10;
  const branchIndex = (diffDays + 0) % 12;
  
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  return {
    stem,
    branch,
    element: STEM_ELEMENTS[stem],
  };
}

/**
 * 计算时柱
 * 十二时辰对照 + 五鼠遁
 */
function getHourPillar(dayStem: string, hour: number): Pillar {
  // 确定时支
  let branchIndex: number;
  if (hour >= 23 || hour < 1) branchIndex = 0;      // 子
  else if (hour >= 1 && hour < 3) branchIndex = 1;  // 丑
  else if (hour >= 3 && hour < 5) branchIndex = 2;  // 寅
  else if (hour >= 5 && hour < 7) branchIndex = 3;  // 卯
  else if (hour >= 7 && hour < 9) branchIndex = 4;  // 辰
  else if (hour >= 9 && hour < 11) branchIndex = 5; // 巳
  else if (hour >= 11 && hour < 13) branchIndex = 6; // 午
  else if (hour >= 13 && hour < 15) branchIndex = 7; // 未
  else if (hour >= 15 && hour < 17) branchIndex = 8; // 申
  else if (hour >= 17 && hour < 19) branchIndex = 9; // 酉
  else if (hour >= 19 && hour < 21) branchIndex = 10; // 戌
  else branchIndex = 11; // 亥
  
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  // 时干由日干推算（五鼠遁）
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  let hourStemStart: number;
  
  if ([0, 5].includes(dayStemIndex)) hourStemStart = 0;      // 甲己 -> 甲
  else if ([1, 6].includes(dayStemIndex)) hourStemStart = 2; // 乙庚 -> 丙
  else if ([2, 7].includes(dayStemIndex)) hourStemStart = 4; // 丙辛 -> 戊
  else if ([3, 8].includes(dayStemIndex)) hourStemStart = 6; // 丁壬 -> 庚
  else hourStemStart = 8;                                     // 戊癸 -> 壬
  
  const stemIndex = (hourStemStart + branchIndex) % 10;
  const stem = HEAVENLY_STEMS[stemIndex];
  
  return {
    stem,
    branch,
    element: STEM_ELEMENTS[stem],
  };
}

/**
 * 统计五行
 */
function calculateElementStats(pillars: Pillar[]): ElementStats {
  const stats: ElementStats = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  
  pillars.forEach(pillar => {
    // 天干五行
    stats[STEM_ELEMENTS[pillar.stem] as keyof ElementStats]++;
    // 地支五行
    stats[BRANCH_ELEMENTS[pillar.branch] as keyof ElementStats]++;
  });
  
  return stats;
}

/**
 * 判定灵根类型
 */
function determineSpiritualRoot(
  elements: ElementStats,
  pillars: Pillar[]
): SpiritualRoot {
  const values = Object.values(elements);
  const maxCount = Math.max(...values);
  const nonZeroCount = values.filter(v => v > 0).length;
  
  // 找出最多的五行
  const sortedElements = Object.entries(elements)
    .sort((a, b) => b[1] - a[1]);
  const primaryElement = sortedElements[0][0];
  const secondaryElement = sortedElements[1][0];
  
  // 检查变异灵根（地支三会局）
  const variant = checkVariantRoot(pillars);
  if (variant) {
    return {
      type: 'variant',
      name: `${variant}灵根`,
      primaryElement,
      variantType: variant,
      bonus: 1.8,
      description: `${variant}属性变异，兼具两种特性，修炼天赋异禀`,
    };
  }
  
  // 天灵根（单一属性≥5）
  if (maxCount >= 5 && nonZeroCount === 1) {
    return {
      type: 'tian',
      name: `天灵根-${primaryElement}`,
      primaryElement,
      bonus: 2.0,
      description: '单一属性极盛，万年难遇的修仙奇才',
    };
  }
  
  // 双灵根
  if (sortedElements[0][1] >= 3 && sortedElements[1][1] >= 2 && sortedElements[2][1] === 0) {
    return {
      type: 'double',
      name: `双灵根-${primaryElement}${secondaryElement}`,
      primaryElement,
      secondaryElement,
      bonus: 1.5,
      description: '两种属性相辅，修炼天赋上佳',
    };
  }
  
  // 三灵根
  if (nonZeroCount === 3) {
    return {
      type: 'triple',
      name: `三灵根-${primaryElement}${secondaryElement}${sortedElements[2][0]}`,
      primaryElement,
      secondaryElement,
      bonus: 1.2,
      description: '三属性平衡，中规中矩的修炼资质',
    };
  }
  
  // 四灵根
  if (nonZeroCount === 4) {
    return {
      type: 'four',
      name: `四灵根-${primaryElement}为主`,
      primaryElement,
      bonus: 0.8,
      description: '属性驳杂，修炼进度较慢',
    };
  }
  
  // 伪灵根（五行俱全）
  return {
    type: 'five',
    name: '伪灵根',
    primaryElement,
    bonus: 0.5,
    description: '五行俱全却无一精通，修炼艰难，但大成后可修五行神通',
  };
}

/**
 * 检查变异灵根（地支三会局）
 */
function checkVariantRoot(pillars: Pillar[]): string | null {
  const branches = pillars.map(p => p.branch);
  
  // 寅卯辰会木局 -> 风
  if (['寅', '卯', '辰'].every(b => branches.includes(b))) {
    return '风';
  }
  // 巳午未会火局 -> 雷
  if (['巳', '午', '未'].every(b => branches.includes(b))) {
    return '雷';
  }
  // 申酉戌会金局 -> 冰
  if (['申', '酉', '戌'].every(b => branches.includes(b))) {
    return '冰';
  }
  // 辰戌丑未会土局 -> 磁
  const earthBranches = ['辰', '戌', '丑', '未'];
  const earthCount = branches.filter(b => earthBranches.includes(b)).length;
  if (earthCount >= 3) {
    return '磁';
  }
  
  return null;
}

/**
 * 生成道号
 */
export function generateDaoName(): string {
  const prefixes = ['清', '明', '玄', '真', '太', '玉', '金', '紫', '青', '虚', '灵', '妙'];
  const suffixes = ['虚子', '真人', '散人', '道人', '居士', '子', '生', '客', '翁', '仙'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return prefix + suffix;
}
