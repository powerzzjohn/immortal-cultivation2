import axios from 'axios';
import {
  YEAR_LUCK,
  MAIN_QI,
  GUEST_QI,
  TIME_RANGES,
  MOON_PHASES,
} from '../config/constants.js';
import type { ElementStats } from './baziService.js';

export interface CelestialData {
  weather: WeatherData;
  wuYunLiuQi: WuYunLiuQiData;
  ziWuLiuZhu: ZiWuLiuZhuData;
  moonPhase: MoonPhaseData;
  bonus: CultivationBonus;
}

export interface WeatherData {
  temperature: number;
  weather: string;
  humidity: number;
  windDirection: string;
  windScale: string;
  pressure: number;
  visibility: number;
  airQuality?: number;
}

export interface WuYunLiuQiData {
  yearLuck: { element: string; type: string };
  mainQi: { name: string; element: string };
  guestQi: { siTian: string; zaiQuan: string };
  currentSolarTerm: string;
}

export interface ZiWuLiuZhuData {
  hour: number;
  endHour: number;
  branch: string;
  meridian: string;
  element: string;
  yinYang: string;
}

export interface MoonPhaseData {
  name: string;
  phase: number;
  bonus: number;
  desc: string;
}

export interface CultivationBonus {
  total: number;
  details: {
    weather: BonusDetail;
    temperature: BonusDetail;
    wuYun: BonusDetail;
    ziWu: BonusDetail;
    hour: BonusDetail;
    moon: BonusDetail;
  };
}

interface BonusDetail {
  factor: string;
  value: number;
  desc: string;
}

/**
 * 获取用户定位
 */
export async function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  // 注意：实际使用时需要在前端获取并通过API传递
  // 这里返回默认值作为示例
  return { latitude: 39.9042, longitude: 116.4074 }; // 北京
}

/**
 * 根据坐标获取城市代码
 */
export async function getCityCode(lat: number, lon: number): Promise<string> {
  try {
    // 使用高德地图API（需要配置KEY）
    const response = await axios.get(
      `https://restapi.amap.com/v3/geocode/regeo?location=${lon},${lat}&key=${process.env.GAODE_KEY}`
    );
    return response.data.regeocode.addressComponent.adcode;
  } catch (error) {
    console.error('获取城市代码失败:', error);
    return '110000'; // 默认北京
  }
}

/**
 * 获取天气数据
 */
export async function getWeather(cityCode: string): Promise<WeatherData> {
  try {
    // 使用和风天气API（需要配置KEY）
    const response = await axios.get(
      `https://devapi.qweather.com/v7/weather/now?location=${cityCode}&key=${process.env.QWEATHER_KEY}`
    );
    const data = response.data.now;
    return {
      temperature: parseInt(data.temp),
      weather: data.text,
      humidity: parseInt(data.humidity),
      windDirection: data.windDir,
      windScale: data.windScale,
      pressure: parseInt(data.pressure),
      visibility: parseInt(data.vis),
    };
  } catch (error) {
    console.error('获取天气失败:', error);
    // 返回默认值
    return {
      temperature: 20,
      weather: '晴',
      humidity: 50,
      windDirection: '东北',
      windScale: '2',
      pressure: 1013,
      visibility: 10,
    };
  }
}

/**
 * 计算五运六气
 */
export function calculateWuYunLiuQi(year: number, month: number, day: number): WuYunLiuQiData {
  // 获取年干
  const yearStem = getYearStem(year);
  const yearBranch = getYearBranch(year);
  
  // 年运
  const yearLuck = YEAR_LUCK[yearStem];
  
  // 当前节气
  const solarTerm = getCurrentSolarTerm(month, day);
  
  // 主气
  const mainQi = MAIN_QI.find(qi => qi.period.includes(solarTerm)) || MAIN_QI[0];
  
  // 客气
  const guestQi = GUEST_QI[yearBranch];
  
  return {
    yearLuck,
    mainQi: { name: mainQi.name, element: mainQi.element },
    guestQi,
    currentSolarTerm: solarTerm,
  };
}

/**
 * 获取年干
 */
function getYearStem(year: number): string {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  return stems[(year - 4) % 10];
}

/**
 * 获取年支
 */
function getYearBranch(year: number): string {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return branches[(year - 4) % 12];
}

/**
 * 获取当前节气（简化版）
 */
function getCurrentSolarTerm(month: number, day: number): string {
  // 简化的节气判断，实际应使用天文算法
  const termDays = [6, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7]; // 各月节气大致日期
  const terms = [
    ['小寒', '大寒'], ['立春', '雨水'], ['惊蛰', '春分'],
    ['清明', '谷雨'], ['立夏', '小满'], ['芒种', '夏至'],
    ['小暑', '大暑'], ['立秋', '处暑'], ['白露', '秋分'],
    ['寒露', '霜降'], ['立冬', '小雪'], ['大雪', '冬至']
  ];
  
  if (day < termDays[month - 1]) {
    return terms[month - 1][0];
  } else {
    return terms[month - 1][1];
  }
}

/**
 * 计算子午流注
 */
export function calculateZiWuLiuZhu(hour: number): ZiWuLiuZhuData {
  const timeRange = TIME_RANGES.find(t => 
    (t.start <= t.end && hour >= t.start && hour < t.end) ||
    (t.start > t.end && (hour >= t.start || hour < t.end))
  ) || TIME_RANGES[0];
  
  return {
    hour: timeRange.start,
    endHour: timeRange.end,
    branch: timeRange.branch,
    meridian: timeRange.meridian,
    element: timeRange.element,
    yinYang: timeRange.yinYang,
  };
}

/**
 * 计算月相
 * 使用简化天文算法
 */
export function calculateMoonPhase(date: Date = new Date()): MoonPhaseData {
  // 计算从2000年1月6日（已知新月）起的天数
  const knownNewMoon = new Date(2000, 0, 6);
  const diffTime = date.getTime() - knownNewMoon.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // 朔望月周期约29.53天
  const synodicMonth = 29.53058867;
  const phase = (diffDays % synodicMonth) / synodicMonth;
  const normalizedPhase = phase < 0 ? phase + 1 : phase;
  
  // 查找对应的月相
  const moonPhase = MOON_PHASES.find(
    p => normalizedPhase >= p.range[0] && normalizedPhase < p.range[1]
  ) || MOON_PHASES[0];
  
  return {
    name: moonPhase.name,
    phase: normalizedPhase,
    bonus: moonPhase.bonus,
    desc: moonPhase.desc,
  };
}

/**
 * 计算修炼加成
 */
export function calculateCultivationBonus(
  userElement: string,
  weather: WeatherData,
  wuYunLiuQi: WuYunLiuQiData,
  ziWuLiuZhu: ZiWuLiuZhuData,
  hour: number,
  moonPhase: MoonPhaseData
): CultivationBonus {
  // 天气加成
  const weatherBonus = getWeatherBonus(weather.weather);
  
  // 温度加成
  const tempBonus = getTemperatureBonus(weather.temperature);
  
  // 五运六气加成
  const qiBonus = getQiBonus(userElement, wuYunLiuQi.mainQi.element);
  
  // 子午流注加成
  const meridianBonus = getMeridianBonus(userElement, ziWuLiuZhu.element);
  
  // 时辰加成
  const hourBonus = getHourBonus(hour);
  
  // 月相加成
  const moonBonus = moonPhase.bonus;
  
  // 加权计算（调整权重：天气15% + 温度10% + 五运六气25% + 子午流注20% + 时辰10% + 月相20%）
  const totalBonus = 
    weatherBonus * 0.15 +
    tempBonus * 0.10 +
    qiBonus * 0.25 +
    meridianBonus * 0.20 +
    hourBonus * 0.10 +
    moonBonus * 0.20;
  
  return {
    total: parseFloat(totalBonus.toFixed(2)),
    details: {
      weather: { factor: '天气', value: weatherBonus, desc: weather.weather },
      temperature: { factor: '温度', value: tempBonus, desc: `${weather.temperature}°C` },
      wuYun: { factor: '五运六气', value: qiBonus, desc: wuYunLiuQi.mainQi.name },
      ziWu: { factor: '子午流注', value: meridianBonus, desc: `${ziWuLiuZhu.branch}时 ${ziWuLiuZhu.meridian}` },
      hour: { factor: '时辰', value: hourBonus, desc: getHourName(hour) },
      moon: { factor: '月相', value: moonBonus, desc: moonPhase.name },
    },
  };
}

/**
 * 获取天气加成
 */
function getWeatherBonus(weather: string): number {
  const bonusMap: Record<string, number> = {
    '晴': 1.10,
    '多云': 1.05,
    '阴': 1.00,
    '小雨': 0.95,
    '中雨': 0.90,
    '大雨': 0.85,
    '雪': 0.80,
    '雾霾': 0.75,
    '雷暴': 1.15,
  };
  return bonusMap[weather] || 1.00;
}

/**
 * 获取温度加成
 */
function getTemperatureBonus(temp: number): number {
  if (temp >= 15 && temp <= 25) return 1.05; // 适宜
  if (temp < 0 || temp > 35) return 0.90; // 极寒极热
  return 0.98; // 偏冷或偏热
}

/**
 * 获取五运六气加成
 */
function getQiBonus(userElement: string, qiElement: string): number {
  // 五行相生相克关系
  const generates: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
  };
  const overcomes: Record<string, string> = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
  };
  
  if (generates[userElement] === qiElement) return 1.15; // 相生，加成
  if (overcomes[userElement] === qiElement) return 0.85; // 相克，减成
  return 1.00;
}

/**
 * 获取子午流注加成
 */
function getMeridianBonus(userElement: string, meridianElement: string): number {
  const generates: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
  };
  const overcomes: Record<string, string> = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
  };
  
  if (generates[userElement] === meridianElement) return 1.12;
  if (overcomes[userElement] === meridianElement) return 0.88;
  return 1.00;
}

/**
 * 获取时辰加成
 */
function getHourBonus(hour: number): number {
  const hourBonuses: Record<number, number> = {
    23: 1.10, 0: 1.10,   // 子时
    1: 1.05, 2: 1.05,     // 丑时
    3: 1.08, 4: 1.08,     // 寅时
    5: 1.10, 6: 1.10,     // 卯时
    7: 1.05, 8: 1.05,     // 辰时
    9: 1.00, 10: 1.00,    // 巳时
    11: 0.95, 12: 0.95,   // 午时
    13: 0.98, 14: 0.98,   // 未时
    15: 1.02, 16: 1.02,   // 申时
    17: 1.05, 18: 1.05,   // 酉时
    19: 1.08, 20: 1.08,   // 戌时
    21: 1.10, 22: 1.10,   // 亥时
  };
  return hourBonuses[hour] || 1.00;
}

/**
 * 获取时辰名称
 */
function getHourName(hour: number): string {
  const hourNames: Record<number, string> = {
    23: '子时(23-1)', 0: '子时(23-1)',
    1: '丑时(1-3)', 2: '丑时(1-3)',
    3: '寅时(3-5)', 4: '寅时(3-5)',
    5: '卯时(5-7)', 6: '卯时(5-7)',
    7: '辰时(7-9)', 8: '辰时(7-9)',
    9: '巳时(9-11)', 10: '巳时(9-11)',
    11: '午时(11-13)', 12: '午时(11-13)',
    13: '未时(13-15)', 14: '未时(13-15)',
    15: '申时(15-17)', 16: '申时(15-17)',
    17: '酉时(17-19)', 18: '酉时(17-19)',
    19: '戌时(19-21)', 20: '戌时(19-21)',
    21: '亥时(21-23)', 22: '亥时(21-23)',
  };
  return hourNames[hour] || '未知';
}

/**
 * 获取完整的天时数据
 */
export async function getCelestialData(
  userElement: string,
  lat: number,
  lon: number
): Promise<CelestialData> {
  const now = new Date();
  const hour = now.getHours();
  
  // 获取城市代码
  const cityCode = await getCityCode(lat, lon);
  
  // 获取天气
  const weather = await getWeather(cityCode);
  
  // 计算五运六气
  const wuYunLiuQi = calculateWuYunLiuQi(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  // 计算子午流注
  const ziWuLiuZhu = calculateZiWuLiuZhu(hour);
  
  // 计算月相
  const moonPhase = calculateMoonPhase(now);
  
  // 计算加成
  const bonus = calculateCultivationBonus(
    userElement,
    weather,
    wuYunLiuQi,
    ziWuLiuZhu,
    hour,
    moonPhase
  );
  
  return {
    weather,
    wuYunLiuQi,
    ziWuLiuZhu,
    moonPhase,
    bonus,
  };
}
