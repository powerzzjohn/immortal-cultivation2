// ==================== 用户相关 ====================
export interface User {
  id: string
  email: string
  daoName: string
  createdAt: string
  lastLoginAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

// ==================== 八字与灵根 ====================
export interface Bazi {
  userId: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  birthMinute: number
  timezone: string
  
  yearPillar: Pillar
  monthPillar: Pillar
  dayPillar: Pillar
  hourPillar: Pillar
  
  elementStats: ElementStats
  spiritualRoot: SpiritualRoot
  calculatedAt: string
}

export interface Pillar {
  stem: string
  branch: string
  element: string
}

export interface ElementStats {
  金: number
  木: number
  水: number
  火: number
  土: number
}

export interface SpiritualRoot {
  type: 'tian' | 'double' | 'triple' | 'four' | 'five' | 'variant'
  name: string
  primaryElement: string
  secondaryElement?: string
  variantType?: string
  bonus: number
  description: string
}

// ==================== 修炼系统 ====================
export interface Cultivation {
  userId: string
  currentExp: number
  totalExp: number
  realm: number
  realmName: string
  totalDays: number
  todayMinutes: number
  lastCultivateAt: string | null
  isCultivating: boolean
  cultivateStartAt: string | null
}

export interface CultivationBonus {
  total: number
  details: {
    weather: BonusDetail
    temperature: BonusDetail
    wuYun: BonusDetail
    ziWu: BonusDetail
    hour: BonusDetail
    moon: BonusDetail
  }
}

export interface BonusDetail {
  factor: string
  value: number
  desc: string
}

// ==================== 天时系统 ====================
export interface Weather {
  temperature: number
  weather: string
  humidity: number
  windDirection: string
  windScale: string
  pressure: number
  visibility: number
}

export interface WuYunLiuQi {
  yearLuck: YearLuck
  mainQi: MainQi
  guestQi: GuestQi
  currentSolarTerm: string
}

export interface YearLuck {
  element: string
  type: string
}

export interface MainQi {
  name: string
  element: string
  period: string[]
}

export interface GuestQi {
  siTian: string
  zaiQuan: string
}

export interface ZiWuLiuZhu {
  hour: number
  endHour: number
  branch: string
  meridian: string
  element: string
  yinYang: string
}

export interface MoonPhase {
  name: string
  phase: number
  bonus: number
  desc: string
}

export interface CelestialData {
  weather: Weather
  wuYunLiuQi: WuYunLiuQi
  ziWuLiuZhu: ZiWuLiuZhu
  moonPhase: MoonPhase
  bonus: CultivationBonus
}

// ==================== 每日总结 ====================
export interface DailySummary {
  id: string
  userId: string
  date: string
  todayMinutes: number
  expGained: number
  bonusApplied: number
  content: {
    greeting: string
    cultivationReview: string
    insight: string
    wisdom: string
    suggestion: string
    goldenQuote: string
  }
  generatedAt: string
}

// ==================== 箴言系统 ====================
export interface Wisdom {
  id: string
  content: string
  source: string
  element: '金' | '木' | '水' | '火' | '土'
  interpretation: string
  createdAt: string
}

export interface DailyWisdomData {
  wisdom: Wisdom
  date: string
  elementColor: string
}

export interface WisdomInsight {
  id: string
  userId: string
  wisdomId: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface CreateInsightRequest {
  wisdomId: string
  content: string
}

export interface WisdomDailySummary {
  date: string
  wisdom: Wisdom
  cultivationStats: {
    todayMinutes: number
    expGained: number
    spiritStones: number
  }
  realmProgress: {
    currentRealm: string
    currentExp: number
    nextRealmExp: number
    progress: number
  }
  suggestion: string
}

// ==================== NPC对话 ====================
export interface ChatMessage {
  id: string
  userId: string
  role: 'user' | 'npc'
  content: string
  timestamp: string
}

// ==================== 资源系统 ====================
export interface Resources {
  userId: string
  spiritStones: number
}

export interface Treasure {
  id: string
  userId: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  effect?: string
  acquiredAt: string
}
