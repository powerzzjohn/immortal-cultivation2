#!/usr/bin/env node
/**
 * 八字灵根计算测试脚本
 * 用于验证不同灵根类型的计算正确性
 */

import { calculateBazi, formatBazi } from './dist/utils/baziCalculator.js';

const testCases = [
  {
    name: '1990年5月15日 14:30',
    input: { year: 1990, month: 5, day: 15, hour: 14, minute: 30 },
  },
  {
    name: '1984年1月1日 0:00 (甲子年)',
    input: { year: 1984, month: 1, day: 1, hour: 0, minute: 0 },
  },
  {
    name: '2000年2月4日 12:00',
    input: { year: 2000, month: 2, day: 4, hour: 12, minute: 0 },
  },
  {
    name: '1995年8月15日 6:00',
    input: { year: 1995, month: 8, day: 15, hour: 6, minute: 0 },
  },
  {
    name: '2024年2月13日 23:42 (今天)',
    input: { year: 2024, month: 2, day: 13, hour: 23, minute: 42 },
  },
];

console.log('🧪 八字灵根计算测试\n');
console.log('=' .repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n[测试 ${index + 1}] ${testCase.name}`);
  console.log('-'.repeat(60));
  
  const result = calculateBazi(
    testCase.input.year,
    testCase.input.month,
    testCase.input.day,
    testCase.input.hour,
    testCase.input.minute
  );
  
  console.log(`八字: ${formatBazi(result.bazi)}`);
  console.log(`\n四柱详情:`);
  console.log(`  年柱: ${result.bazi.year.stem}${result.bazi.year.branch} [${result.bazi.year.element}]`);
  console.log(`  月柱: ${result.bazi.month.stem}${result.bazi.month.branch} [${result.bazi.month.element}]`);
  console.log(`  日柱: ${result.bazi.day.stem}${result.bazi.day.branch} [${result.bazi.day.element}]`);
  console.log(`  时柱: ${result.bazi.hour.stem}${result.bazi.hour.branch} [${result.bazi.hour.element}]`);
  
  console.log(`\n五行统计:`);
  console.log(`  金: ${result.wuxing.metal} | 木: ${result.wuxing.wood} | 水: ${result.wuxing.water} | 火: ${result.wuxing.fire} | 土: ${result.wuxing.earth}`);
  
  console.log(`\n灵根信息:`);
  console.log(`  类型: ${result.lingGen.type}`);
  console.log(`  名称: ${result.lingGen.name}`);
  console.log(`  主属性: ${result.lingGen.primaryElement}`);
  if (result.lingGen.secondaryElement) {
    console.log(`  副属性: ${result.lingGen.secondaryElement}`);
  }
  console.log(`  修炼加成: ${(result.lingGen.bonus * 100).toFixed(0)}%`);
  console.log(`  描述: ${result.lingGen.description}`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ 测试完成！');
