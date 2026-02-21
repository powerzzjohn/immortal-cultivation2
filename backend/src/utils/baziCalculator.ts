import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  MONTH_BRANCHES,
  TIME_RANGES,
  getMonthStemStart,
  getHourStemStart,
  LingGenType,
  LingGenInfo,
  LINGGEN_BONUS,
  LINGGEN_NAMES,
  WuXingType,
  BRANCH_HIDDEN_STEMS,
} from './wuxing.js';

// ==================== 类型定义 ====================
export interface Pillar {
  stem: string;      // 天干
  branch: string;    // 地支
  element: WuXingType; // 五行
}

export interface BaziData {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface WuXingStats {
  metal: number;   // 金
  wood: number;    // 木
  water: number;   // 水
  fire: number;    // 火
  earth: number;   // 土
}

export interface LingGen {
  type: LingGenType;
  name: string;
  primaryElement: WuXingType;
  secondaryElement?: WuXingType;
  bonus: number;
  description: string;
}

export interface BaziResult {
  bazi: BaziData;
  wuxing: WuXingStats;
  lingGen: LingGen;
}

// ==================== 核心计算函数 ====================

/**
 * 计算完整八字
 * @param year 出生年
 * @param month 出生月 (1-12)
 * @param day 出生日
 * @param hour 出生小时 (0-23)
 * @param minute 出生分钟 (可选)
 * @param timezone 时区 (可选，默认 Asia/Shanghai)
 */
export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute?: number,
  timezone?: string
): BaziResult {
  // 计算四柱
  const yearPillar = calculateYearPillar(year);
  const monthPillar = calculateMonthPillar(yearPillar.stem, month);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(dayPillar.stem, hour);

  const bazi: BaziData = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };

  // 统计五行
  const wuxing = calculateWuXingStats(bazi);

  // 判定灵根
  const lingGen = determineLingGen(wuxing);

  return {
    bazi,
    wuxing,
    lingGen,
  };
}

/**
 * 计算年柱
 * 公式：(年份 - 4) % 10 得天干，%12 得地支
 * 1984年是甲子年
 */
export function calculateYearPillar(year: number): Pillar {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  return {
    stem,
    branch,
    element: STEM_ELEMENTS[stem] as WuXingType,
  };
}

/**
 * 计算月柱
 * 月支固定：正月建寅，依次类推
 * 月干由年干推算（五虎遁）
 */
export function calculateMonthPillar(yearStem: string, month: number): Pillar {
  // 月支
  const branch = MONTH_BRANCHES[month - 1];
  
  // 月干由年干推算（五虎遁）
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  const monthStemStart = getMonthStemStart(yearStemIndex);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  const stemIndex = (monthStemStart + branchIndex) % 10;
  const stem = HEAVENLY_STEMS[stemIndex];
  
  return {
    stem,
    branch,
    element: STEM_ELEMENTS[stem] as WuXingType,
  };
}

/**
 * 计算日柱
 * 基于1900-01-31为甲子日的基准日
 */
export function calculateDayPillar(year: number, month: number, day: number): Pillar {
  // 1900-01-31 是甲子日
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const stemIndex = ((diffDays % 10) + 10) % 10;
  const branchIndex = ((diffDays % 12) + 12) % 12;
  
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  return {
    stem,
    branch,
    element: STEM_ELEMENTS[stem] as WuXingType,
  };
}

/**
 * 计算时柱
 * 根据小时确定时支
 * 时干由日干推算（五鼠遁）
 */
export function calculateHourPillar(dayStem: string, hour: number): Pillar {
  // 确定时支
  let branchIndex: number;
  if (hour >= 23 || hour < 1) branchIndex = 0;       // 子 (23-1)
  else if (hour >= 1 && hour < 3) branchIndex = 1;  // 丑 (1-3)
  else if (hour >= 3 && hour < 5) branchIndex = 2;  // 寅 (3-5)
  else if (hour >= 5 && hour < 7) branchIndex = 3;  // 卯 (5-7)
  else if (hour >= 7 && hour < 9) branchIndex = 4;  // 辰 (7-9)
  else if (hour >= 9 && hour < 11) branchIndex = 5; // 巳 (9-11)
  else if (hour >= 11 && hour < 13) branchIndex = 6; // 午 (11-13)
  else if (hour >= 13 && hour < 15) branchIndex = 7; // 未 (13-15)
  else if (hour >= 15 && hour < 17) branchIndex = 8; // 申 (15-17)
  else if (hour >= 17 && hour < 19) branchIndex = 9; // 酉 (17-19)
  else if (hour >= 19 && hour < 21) branchIndex = 10; // 戌 (19-21)
  else branchIndex = 11; // 亥 (21-23)
  
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  // 时干由日干推算（五鼠遁）
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const hourStemStart = getHourStemStart(dayStemIndex);
  const stemIndex = (hourStemStart + branchIndex) % 10;
  const stem = HEAVENLY_STEMS[stemIndex];
  
  return {
    stem,
    branch,
    element: STEM_ELEMENTS[stem] as WuXingType,
  };
}

/**
 * 统计五行数量
 * 基础版本：只计算天干和地支的主五行
 */
export function calculateWuXingStats(bazi: BaziData): WuXingStats {
  const stats: WuXingStats = {
    metal: 0,
    wood: 0,
    water: 0,
    fire: 0,
    earth: 0,
  };
  
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  
  // 统计天干五行
  pillars.forEach(pillar => {
    const element = STEM_ELEMENTS[pillar.stem] as WuXingType;
    stats[elementToKey(element)]++;
  });
  
  // 统计地支主五行
  pillars.forEach(pillar => {
    const element = BRANCH_ELEMENTS[pillar.branch] as WuXingType;
    stats[elementToKey(element)]++;
  });
  
  return stats;
}

/**
 * 统计五行数量（进阶版：包含地支藏干）
 */
export function calculateWuXingStatsAdvanced(bazi: BaziData): WuXingStats {
  const stats: WuXingStats = {
    metal: 0,
    wood: 0,
    water: 0,
    fire: 0,
    earth: 0,
  };
  
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  
  // 天干五行（权重1）
  pillars.forEach(pillar => {
    const element = STEM_ELEMENTS[pillar.stem] as WuXingType;
    stats[elementToKey(element)] += 1;
  });
  
  // 地支主五行（权重1）
  pillars.forEach(pillar => {
    const element = BRANCH_ELEMENTS[pillar.branch] as WuXingType;
    stats[elementToKey(element)] += 1;
  });
  
  // 地支藏干（权重0.5）
  pillars.forEach(pillar => {
    const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.branch] || [];
    hiddenStems.forEach(stem => {
      const element = STEM_ELEMENTS[stem] as WuXingType;
      stats[elementToKey(element)] += 0.5;
    });
  });
  
  return stats;
}

/**
 * 五行名称转换
 */
function elementToKey(element: WuXingType): keyof WuXingStats {
  const map: Record<WuXingType, keyof WuXingStats> = {
    '金': 'metal',
    '木': 'wood',
    '水': 'water',
    '火': 'fire',
    '土': 'earth',
  };
  return map[element];
}

/**
 * 判定灵根类型
 */
export function determineLingGen(wuxing: WuXingStats): LingGen {
  const values = Object.values(wuxing);
  const entries = Object.entries(wuxing) as [keyof WuXingStats, number][];
  
  // 按数量排序
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0][1];
  const nonZeroCount = values.filter(v => v > 0).length;
  
  // 主属性
  const primaryElement = keyToElement(sorted[0][0]);
  const secondaryElement = sorted[1][1] > 0 ? keyToElement(sorted[1][0]) : undefined;
  
  // 检查是否满足特殊组合（变异灵根）
  const variantCheck = checkVariantLingGen(wuxing);
  if (variantCheck) {
    return variantCheck;
  }
  
  // 天灵根：单一五行 ≥ 4
  if (maxCount >= 4 && nonZeroCount === 1) {
    return {
      type: 'tian',
      name: `${LINGGEN_NAMES.tian}·${primaryElement}`,
      primaryElement,
      bonus: LINGGEN_BONUS.tian,
      description: `${primaryElement}行独盛，万年难遇的修仙奇才，修炼${primaryElement}系功法事半功倍`,
    };
  }
  
  // 双灵根：两种五行各 ≥ 2，其余为0
  if (sorted[0][1] >= 2 && sorted[1][1] >= 2 && sorted[2][1] === 0) {
    return {
      type: 'shuang',
      name: `${LINGGEN_NAMES.shuang}·${primaryElement}${secondaryElement}`,
      primaryElement,
      secondaryElement,
      bonus: LINGGEN_BONUS.shuang,
      description: `${primaryElement}${secondaryElement}双灵根，两种属性相辅相成，修炼${primaryElement}系和${secondaryElement}系功法有加成`,
    };
  }
  
  // 三灵根：三种五行各 1-2
  if (nonZeroCount === 3) {
    const thirdElement = keyToElement(sorted[2][0]);
    return {
      type: 'san',
      name: `${LINGGEN_NAMES.san}·${primaryElement}${secondaryElement}${thirdElement}`,
      primaryElement,
      secondaryElement,
      bonus: LINGGEN_BONUS.san,
      description: `${primaryElement}${secondaryElement}${thirdElement}三灵根，属性平衡，修炼速度正常`,
    };
  }
  
  // 四灵根：四种五行各 1
  if (nonZeroCount === 4) {
    return {
      type: 'si',
      name: `${LINGGEN_NAMES.si}·${primaryElement}为主`,
      primaryElement,
      bonus: LINGGEN_BONUS.si,
      description: `四灵根，属性驳杂，修炼进度较慢，需要更多资源`,
    };
  }
  
  // 五灵根：五行俱全
  return {
    type: 'wu',
    name: LINGGEN_NAMES.wu,
    primaryElement,
    bonus: LINGGEN_BONUS.wu,
    description: '伪灵根，五行俱全却无一精通，修炼艰难，但若能大成可修五行神通',
  };
}

/**
 * 检查变异灵根（特殊组合）
 */
function checkVariantLingGen(wuxing: WuXingStats): LingGen | null {
  // 金水相生 → 冰灵根
  if (wuxing.metal >= 2 && wuxing.water >= 2 && wuxing.wood === 0 && wuxing.fire === 0) {
    return {
      type: 'bianyi',
      name: '变异灵根·冰',
      primaryElement: '水',
      bonus: LINGGEN_BONUS.bianyi,
      description: '金水相生，变异为冰灵根，修炼冰系功法威力倍增',
    };
  }
  
  // 木火相生 → 雷灵根
  if (wuxing.wood >= 2 && wuxing.fire >= 2 && wuxing.metal === 0 && wuxing.water === 0) {
    return {
      type: 'bianyi',
      name: '变异灵根·雷',
      primaryElement: '火',
      bonus: LINGGEN_BONUS.bianyi,
      description: '木火相生，变异为雷灵根，修炼雷系功法威力倍增',
    };
  }
  
  // 火土相生 → 炎灵根
  if (wuxing.fire >= 2 && wuxing.earth >= 2 && wuxing.metal === 0 && wuxing.water === 0) {
    return {
      type: 'bianyi',
      name: '变异灵根·炎',
      primaryElement: '火',
      bonus: LINGGEN_BONUS.bianyi,
      description: '火土相生，变异为炎灵根，修炼火系功法威力倍增',
    };
  }
  
  // 土金相生 → 磁灵根
  if (wuxing.earth >= 2 && wuxing.metal >= 2 && wuxing.wood === 0 && wuxing.water === 0) {
    return {
      type: 'bianyi',
      name: '变异灵根·磁',
      primaryElement: '金',
      bonus: LINGGEN_BONUS.bianyi,
      description: '土金相生，变异为磁灵根，修炼金系功法威力倍增',
    };
  }
  
  // 水木相生 → 风灵根
  if (wuxing.water >= 2 && wuxing.wood >= 2 && wuxing.metal === 0 && wuxing.fire === 0) {
    return {
      type: 'bianyi',
      name: '变异灵根·风',
      primaryElement: '木',
      bonus: LINGGEN_BONUS.bianyi,
      description: '水木相生，变异为风灵根，修炼木系功法威力倍增',
    };
  }
  
  return null;
}

/**
 * 键名转五行
 */
function keyToElement(key: keyof WuXingStats): WuXingType {
  const map: Record<keyof WuXingStats, WuXingType> = {
    metal: '金',
    wood: '木',
    water: '水',
    fire: '火',
    earth: '土',
  };
  return map[key];
}

// ==================== 辅助函数 ====================

/**
 * 格式化八字为字符串
 */
export function formatBazi(bazi: BaziData): string {
  return `${bazi.year.stem}${bazi.year.branch} ${bazi.month.stem}${bazi.month.branch} ${bazi.day.stem}${bazi.day.branch} ${bazi.hour.stem}${bazi.hour.branch}`;
}

/**
 * 获取时辰名称
 */
export function getShiChen(hour: number): string {
  const index = TIME_RANGES.findIndex(
    range => (hour >= range.start && hour < range.end) || (range.start > range.end && (hour >= range.start || hour < range.end))
  );
  return index >= 0 ? TIME_RANGES[index].branch : '子';
}

/**
 * 验证日期是否有效
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}

/**
 * 八字计算器（用于调试和测试）
 */
export function debugBazi(year: number, month: number, day: number, hour: number): void {
  const result = calculateBazi(year, month, day, hour);
  console.log('=== 八字计算结果 ===');
  console.log(`出生时间: ${year}年${month}月${day}日 ${hour}时`);
  console.log(`八字: ${formatBazi(result.bazi)}`);
  console.log(`五行统计: 金${result.wuxing.metal} 木${result.wuxing.wood} 水${result.wuxing.water} 火${result.wuxing.fire} 土${result.wuxing.earth}`);
  console.log(`灵根: ${result.lingGen.name}`);
  console.log(`修炼加成: ${(result.lingGen.bonus * 100).toFixed(0)}%`);
  console.log(`描述: ${result.lingGen.description}`);
}
