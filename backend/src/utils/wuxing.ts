// ==================== 天干地支常量 ====================
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ==================== 五行对应 ====================
export const STEM_ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

export const BRANCH_ELEMENTS: Record<string, string> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
};

// ==================== 五行属性 ====================
export const WUXING_NAMES = {
  metal: '金',
  wood: '木',
  water: '水',
  fire: '火',
  earth: '土',
} as const;

export type WuXingType = '金' | '木' | '水' | '火' | '土';

// ==================== 时辰表 ====================
export const TIME_RANGES = [
  { branch: '子', start: 23, end: 1 },
  { branch: '丑', start: 1, end: 3 },
  { branch: '寅', start: 3, end: 5 },
  { branch: '卯', start: 5, end: 7 },
  { branch: '辰', start: 7, end: 9 },
  { branch: '巳', start: 9, end: 11 },
  { branch: '午', start: 11, end: 13 },
  { branch: '未', start: 13, end: 15 },
  { branch: '申', start: 15, end: 17 },
  { branch: '酉', start: 17, end: 19 },
  { branch: '戌', start: 19, end: 21 },
  { branch: '亥', start: 21, end: 23 },
];

// ==================== 月支表（正月建寅）====================
export const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

// ==================== 五虎遁（年干推月干）====================
// 甲己之年丙作首，乙庚之岁戊为头
// 丙辛之岁寻庚上，丁壬壬位顺行流
// 若问戊癸何处起，甲寅之上好追求
export function getMonthStemStart(yearStemIndex: number): number {
  if ([0, 5].includes(yearStemIndex)) return 2;      // 甲己 -> 丙(2)
  if ([1, 6].includes(yearStemIndex)) return 4;      // 乙庚 -> 戊(4)
  if ([2, 7].includes(yearStemIndex)) return 6;      // 丙辛 -> 庚(6)
  if ([3, 8].includes(yearStemIndex)) return 8;      // 丁壬 -> 壬(8)
  return 0;                                           // 戊癸 -> 甲(0)
}

// ==================== 五鼠遁（日干推时干）====================
// 甲己还加甲，乙庚丙作初
// 丙辛从戊起，丁壬庚子居
// 戊癸何方发，壬子是真途
export function getHourStemStart(dayStemIndex: number): number {
  if ([0, 5].includes(dayStemIndex)) return 0;       // 甲己 -> 甲(0)
  if ([1, 6].includes(dayStemIndex)) return 2;       // 乙庚 -> 丙(2)
  if ([2, 7].includes(dayStemIndex)) return 4;       // 丙辛 -> 戊(4)
  if ([3, 8].includes(dayStemIndex)) return 6;       // 丁壬 -> 庚(6)
  return 8;                                           // 戊癸 -> 壬(8)
}

// ==================== 灵根类型定义 ====================
export type LingGenType = 'tian' | 'shuang' | 'san' | 'si' | 'wu' | 'bianyi';

export interface LingGenInfo {
  type: LingGenType;
  name: string;
  primaryElement: WuXingType;
  secondaryElement?: WuXingType;
  bonus: number;
  description: string;
}

// ==================== 灵根修炼加成 ====================
export const LINGGEN_BONUS: Record<LingGenType, number> = {
  tian: 1.5,     // 天灵根 +50%
  shuang: 1.2,   // 双灵根 +20%
  san: 1.0,      // 三灵根 +0%
  si: 0.9,       // 四灵根 -10%
  wu: 0.8,       // 五灵根 -20%
  bianyi: 1.3,   // 变异灵根 +30%
};

// ==================== 灵根名称映射 ====================
export const LINGGEN_NAMES: Record<LingGenType, string> = {
  tian: '天灵根',
  shuang: '双灵根',
  san: '三灵根',
  si: '四灵根',
  wu: '五灵根',
  bianyi: '变异灵根',
};

// ==================== 地支藏干（用于更精确的五行计算）====================
export const BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};
