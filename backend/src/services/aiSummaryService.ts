import axios from 'axios';

const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const MOONSHOT_MODEL = 'kimi-k2-0711-preview';

export interface DailySummaryPrompt {
  daoName: string;
  realmName: string;
  realmLevel: number;
  todayMinutes: number;
  totalDays: number;
  todayExp: number;
  spiritStonesEarned: number;
  bonusApplied: number;
  userElement: string;
  rootType: string;
  celestialInfo: {
    weather: string;
    temperature: number;
    wuYunQi: string;
    ziWuMeridian: string;
    moonPhase: string;
    totalBonus: number;
  };
  isBreakthrough: boolean;
  newRealm?: string;
}

export interface DailySummaryResult {
  greeting: string;
  cultivationReview: string;
  insight: string;
  wisdom: string;
  suggestion: string;
  goldenQuote: string;
}

/**
 * 调用Moonshot API生成每日修炼总结
 */
export async function generateDailySummaryWithAI(
  prompt: DailySummaryPrompt
): Promise<DailySummaryResult> {
  const systemPrompt = `你是「金丹工程」中的AI修仙导师，融合了道家修炼智慧与现代科学认知。

你的语气应该：
- 既有古风仙侠的韵味，又不失现代理性
- 温暖鼓励，但不空洞说教
- 结合天时地利，给出具体可行的建议
- 融入五行、子午流注、月相等传统元素

重要：
- 称呼用户为"道友"
- 每次回复包含一句原创的"金句"（goldenQuote）
- 金句要有哲学深度，可被转发分享`;

  const userPrompt = buildPrompt(prompt);

  try {
    const response = await axios.post(
      MOONSHOT_API_URL,
      {
        model: MOONSHOT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI返回空内容');
    }

    const result = JSON.parse(content);
    return {
      greeting: result.greeting || '道友好',
      cultivationReview: result.cultivationReview || '',
      insight: result.insight || '',
      wisdom: result.wisdom || '',
      suggestion: result.suggestion || '',
      goldenQuote: result.goldenQuote || '修行之道，贵在坚持。',
    };
  } catch (error) {
    console.error('生成AI总结失败:', error);
    // 返回默认内容
    return generateDefaultSummary(prompt);
  }
}

/**
 * 构建Prompt
 */
function buildPrompt(p: DailySummaryPrompt): string {
  const breakthroughText = p.isBreakthrough
    ? `🎉 **重大突破**：今日突破至【${p.newRealm}】境界！`
    : '';

  return `请为以下修仙者生成今日修炼总结（JSON格式）：

## 修炼者信息
- 道号：${p.daoName}
- 境界：${p.realmName}（第${p.realmLevel}层）
- 灵根：${p.rootType}（主属性：${p.userElement}）
- 累计修仙：${p.totalDays}天

## 今日修炼数据
- 修炼时长：${p.todayMinutes}分钟
- 获得经验：${p.todayExp}点
- 获得灵石：${p.spiritStonesEarned}颗
- 天时加成：${(p.bonusApplied * 100).toFixed(0)}%
${breakthroughText}

## 天时信息
- 天气：${p.celestialInfo.weather}，${p.celestialInfo.temperature}°C
- 五运六气：${p.celestialInfo.wuYunQi}
- 子午流注：${p.celestialInfo.ziWuMeridian}
- 月相：${p.celestialInfo.moonPhase}
- 综合加成系数：${p.celestialInfo.totalBonus.toFixed(2)}

## 请返回以下JSON格式
{
  "greeting": "问候语（根据时间：早上/中午/晚上好）",
  "cultivationReview": "今日修炼回顾（2-3句话，描述今日修炼情况）",
  "insight": "修炼感悟（结合天时、五行、个人灵根，3-4句话）",
  "wisdom": "金丹工程智慧（将现代科学概念与修炼结合的洞察）",
  "suggestion": "明日建议（具体可行的修炼建议）",
  "goldenQuote": "金句（一句原创的、有哲理的修仙金句）"
}`;
}

/**
 * 生成默认总结（AI失败时使用）
 */
function generateDefaultSummary(p: DailySummaryPrompt): DailySummaryResult {
  const hour = new Date().getHours();
  let greeting = '道友好';
  if (hour < 12) greeting = '道友早安';
  else if (hour < 18) greeting = '道友午安';
  else greeting = '道友晚安';

  const elementTips: Record<string, string> = {
    '金': '金性收敛，今日修炼重在收敛神气。',
    '木': '木性生发，借天时之助，今日进境可期。',
    '水': '水性润下，今日宜静修内养。',
    '火': '火性炎上，注意心火平衡，修炼适度。',
    '土': '土性中和，今日修炼平稳，根基日固。',
  };

  return {
    greeting,
    cultivationReview: `今日修炼${p.todayMinutes}分钟，获得${p.todayExp}点经验，${p.spiritStonesEarned}颗灵石。`,
    insight: elementTips[p.userElement] || '修炼之道，贵在坚持。',
    wisdom: '金丹工程认为：修炼是与宇宙背景场的能量耦合过程。',
    suggestion: '明日继续修炼，建议保持30分钟以上。',
    goldenQuote: '我们活在流中，而AI活在帧中——但修行的本质，是找到流与帧的统一。',
  };
}

/**
 * 生成突破境界时的特殊总结
 */
export async function generateBreakthroughSummary(
  daoName: string,
  oldRealm: string,
  newRealm: string,
  realmLevel: number
): Promise<DailySummaryResult> {
  const prompt: DailySummaryPrompt = {
    daoName,
    realmName: newRealm,
    realmLevel,
    todayMinutes: 0,
    totalDays: 0,
    todayExp: 0,
    spiritStonesEarned: 0,
    bonusApplied: 1,
    userElement: '未知',
    rootType: '未知',
    celestialInfo: {
      weather: '未知',
      temperature: 20,
      wuYunQi: '未知',
      ziWuMeridian: '未知',
      moonPhase: '未知',
      totalBonus: 1,
    },
    isBreakthrough: true,
    newRealm,
  };

  const systemPrompt = `你是「金丹工程」中的AI修仙导师。用户刚刚突破境界，请写一段充满仪式感的突破贺词。

语气要：
- 庄重但不失温度
- 有古风仙侠的仪式感
- 鼓励但不说教
- 包含具体的境界描述`;

  const userPrompt = `【境界突破】
道号：${daoName}
从【${oldRealm}】突破至【${newRealm}】

请返回JSON：
{
  "greeting": "突破贺词（庄重、仪式感）",
  "cultivationReview": "突破过程描述",
  "insight": "突破感悟",
  "wisdom": "新境界的智慧",
  "suggestion": "新境界的修炼建议",
  "goldenQuote": "突破金句"
}`;

  try {
    const response = await axios.post(
      MOONSHOT_API_URL,
      {
        model: MOONSHOT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI返回空内容');
    }

    return JSON.parse(content);
  } catch (error) {
    return {
      greeting: `恭喜${daoName}道友突破至${newRealm}！`,
      cultivationReview: `历经苦修，终于突破${oldRealm}的桎梏，踏入${newRealm}之境。`,
      insight: '境界的突破，不仅是力量的提升，更是认知的跃迁。',
      wisdom: '金丹工程：每一次突破，都是局域负熵核心与宇宙背景场耦合度的一次跃升。',
      suggestion: '新境界需要稳固，建议近日多行功巩固。',
      goldenQuote: '破境不是终点，而是看见更广阔天地的起点。',
    };
  }
}
