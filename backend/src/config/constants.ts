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

// ==================== 节气表（1900-2100）====================
// 简化版节气数据，实际应使用天文算法计算
export const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

// ==================== 时辰表 ====================
export const TIME_RANGES = [
  { branch: '子', start: 23, end: 1, meridian: '胆经', element: '木', yinYang: '阳' },
  { branch: '丑', start: 1, end: 3, meridian: '肝经', element: '木', yinYang: '阴' },
  { branch: '寅', start: 3, end: 5, meridian: '肺经', element: '金', yinYang: '阴' },
  { branch: '卯', start: 5, end: 7, meridian: '大肠经', element: '金', yinYang: '阳' },
  { branch: '辰', start: 7, end: 9, meridian: '胃经', element: '土', yinYang: '阳' },
  { branch: '巳', start: 9, end: 11, meridian: '脾经', element: '土', yinYang: '阴' },
  { branch: '午', start: 11, end: 13, meridian: '心经', element: '火', yinYang: '阴' },
  { branch: '未', start: 13, end: 15, meridian: '小肠经', element: '火', yinYang: '阳' },
  { branch: '申', start: 15, end: 17, meridian: '膀胱经', element: '水', yinYang: '阳' },
  { branch: '酉', start: 17, end: 19, meridian: '肾经', element: '水', yinYang: '阴' },
  { branch: '戌', start: 19, end: 21, meridian: '心包经', element: '火', yinYang: '阴' },
  { branch: '亥', start: 21, end: 23, meridian: '三焦经', element: '火', yinYang: '阳' },
];

// ==================== 五运六气 ====================
export const YEAR_LUCK: Record<string, { element: string; type: string }> = {
  '甲': { element: '土', type: '太宫' },
  '己': { element: '土', type: '少宫' },
  '乙': { element: '金', type: '太商' },
  '庚': { element: '金', type: '少商' },
  '丙': { element: '水', type: '太羽' },
  '辛': { element: '水', type: '少羽' },
  '丁': { element: '木', type: '太角' },
  '壬': { element: '木', type: '少角' },
  '戊': { element: '火', type: '太徵' },
  '癸': { element: '火', type: '少徵' },
};

export const MAIN_QI = [
  { name: '厥阴风木', element: '木', period: ['大寒', '立春', '雨水', '惊蛰'] },
  { name: '少阴君火', element: '火', period: ['春分', '清明', '谷雨', '立夏'] },
  { name: '少阳相火', element: '火', period: ['小满', '芒种', '夏至', '小暑'] },
  { name: '太阴湿土', element: '土', period: ['大暑', '立秋', '处暑', '白露'] },
  { name: '阳明燥金', element: '金', period: ['秋分', '寒露', '霜降', '立冬'] },
  { name: '太阳寒水', element: '水', period: ['小雪', '大雪', '冬至', '小寒'] },
];

export const GUEST_QI: Record<string, { siTian: string; zaiQuan: string }> = {
  '子': { siTian: '少阴君火', zaiQuan: '阳明燥金' },
  '午': { siTian: '少阴君火', zaiQuan: '阳明燥金' },
  '丑': { siTian: '太阴湿土', zaiQuan: '太阳寒水' },
  '未': { siTian: '太阴湿土', zaiQuan: '太阳寒水' },
  '寅': { siTian: '少阳相火', zaiQuan: '厥阴风木' },
  '申': { siTian: '少阳相火', zaiQuan: '厥阴风木' },
  '卯': { siTian: '阳明燥金', zaiQuan: '少阴君火' },
  '酉': { siTian: '阳明燥金', zaiQuan: '少阴君火' },
  '辰': { siTian: '太阳寒水', zaiQuan: '太阴湿土' },
  '戌': { siTian: '太阳寒水', zaiQuan: '太阴湿土' },
  '巳': { siTian: '厥阴风木', zaiQuan: '少阳相火' },
  '亥': { siTian: '厥阴风木', zaiQuan: '少阳相火' },
};

// ==================== 月相加成 ====================
export const MOON_PHASES = [
  { name: '新月(朔)', range: [0, 0.05], bonus: 1.0, desc: '阴阳交替，适宜静养' },
  { name: '娥眉月', range: [0.05, 0.2], bonus: 1.05, desc: '阳气初生，修炼渐佳' },
  { name: '上弦月', range: [0.2, 0.3], bonus: 1.08, desc: '阳气增长，修炼顺利' },
  { name: '盈凸月', range: [0.3, 0.45], bonus: 1.12, desc: '月华充盈，能量上升' },
  { name: '满月(望)', range: [0.45, 0.55], bonus: 1.15, desc: '月华最盛，修炼最佳时机' },
  { name: '亏凸月', range: [0.55, 0.7], bonus: 1.10, desc: '阴气渐生，适宜收摄' },
  { name: '下弦月', range: [0.7, 0.8], bonus: 1.05, desc: '阴阳平衡，修炼平稳' },
  { name: '残月', range: [0.8, 0.95], bonus: 0.98, desc: '月华内敛，适宜温养' },
  { name: '晦月', range: [0.95, 1.0], bonus: 1.0, desc: '月终复始，静待新机' },
];

// ==================== 境界设定 ====================
export const REALMS = [
  { level: 1, name: '炼气', maxExp: 100, icon: '🌱', description: '引气入体，打熬身体' },
  { level: 2, name: '筑基', maxExp: 500, icon: '🌿', description: '凝气成液，筑就道基' },
  { level: 3, name: '金丹', maxExp: 2000, icon: '💎', description: '凝液成丹，脱胎换骨' },
  { level: 4, name: '元婴', maxExp: 8000, icon: '👶', description: '丹破婴生，神识大成' },
  { level: 5, name: '化神', maxExp: 30000, icon: '✨', description: '婴化元神，通天彻地' },
];

// 根据境界等级获取配置
export function getRealmByLevel(level: number) {
  return REALMS.find(r => r.level === level);
}
