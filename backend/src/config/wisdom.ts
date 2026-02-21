// ==================== 每日箴言数据 ====================
// 来源：《渔樵问对》邵雍 + 宇宙意识论修仙哲学

export interface WisdomQuote {
  id: string;
  content: string;
  source: string;  // 来源
  category: 'philosophy' | 'cultivation' | 'universe' | 'mind' | 'nature';
  element?: string; // 关联五行：金木水火土
  context?: string; // 原文上下文/解读
}

// 《渔樵问对》核心语录
export const YU_QIAO_QUOTES: WisdomQuote[] = [
  {
    id: 'yq001',
    content: '天地之道，阴阳而已；阴阳之道，动静而已。',
    source: '《渔樵问对》',
    category: 'universe',
    element: '土',
    context: '宇宙的本质是阴阳二气的运化，动静相生，此为大道之根本。'
  },
  {
    id: 'yq002',
    content: '鱼可钓而取，亦可网而取；钓可一鱼，网可千鱼。',
    source: '《渔樵问对》',
    category: 'philosophy',
    element: '水',
    context: '方法不同，所得各异。修道亦然，法门万千，贵在选择适合自己的道路。'
  },
  {
    id: 'yq003',
    content: '无心则无意，无意则无我，无我则与天地合其德。',
    source: '《渔樵问对》',
    category: 'mind',
    element: '木',
    context: '放下执念，达到无我之境，方能与天地同频，感应大道。'
  },
  {
    id: 'yq004',
    content: '万物皆有理，顺之则吉，逆之则凶。',
    source: '《渔樵问对》',
    category: 'philosophy',
    element: '金',
    context: '天地运行有其规律，修道者当顺应天道，不可强求逆势而为。'
  },
  {
    id: 'yq005',
    content: '日往则月来，月往则日来，日月相推而明生焉。',
    source: '《渔樵问对》',
    category: 'nature',
    element: '火',
    context: '阴阳交替，循环往复。修炼亦需动静结合，张弛有度。'
  },
  {
    id: 'yq006',
    content: '观乎天文，以察时变；观乎人文，以化成天下。',
    source: '《渔樵问对》',
    category: 'cultivation',
    element: '土',
    context: '上观天象以知时运，下察己心以修心性，内外兼修，方得大道。'
  },
  {
    id: 'yq007',
    content: '一阴一阳之谓道，继之者善也，成之者性也。',
    source: '《渔樵问对》',
    category: 'universe',
    element: '土',
    context: '阴阳调和即为道，顺应天道为善，成就本性为真。'
  },
  {
    id: 'yq008',
    content: '形而上者谓之道，形而下者谓之器。',
    source: '《渔樵问对》',
    category: 'philosophy',
    element: '金',
    context: '道是无形之理，器是有形之物。修炼重在心悟，非止于形。'
  },
  {
    id: 'yq009',
    content: '天地之大德曰生，圣人之大宝曰位。',
    source: '《渔樵问对》',
    category: 'nature',
    element: '木',
    context: '天地以生养万物为德，修行者当惜生、养生、生生不息。'
  },
  {
    id: 'yq010',
    content: '穷理尽性，以至于命。',
    source: '《渔樵问对》',
    category: 'cultivation',
    element: '火',
    context: '穷尽事物之理，尽己之性，方能通达天命，此为修真三要。'
  },
  {
    id: 'yq011',
    content: '物物而不物于物，则神全矣。',
    source: '《渔樵问对》',
    category: 'mind',
    element: '水',
    context: '驾驭外物而不被外物所困，精神方能完满，不为俗事所累。'
  },
  {
    id: 'yq012',
    content: '天地与我并生，而万物与我为一。',
    source: '《渔樵问对》',
    category: 'universe',
    element: '土',
    context: '天人合一之境，破除我执，与宇宙意识相连，万法归一。'
  },
  {
    id: 'yq013',
    content: '静而与阴同德，动而与阳同波。',
    source: '《渔樵问对》',
    category: 'cultivation',
    element: '土',
    context: '静时如阴般柔顺，动时如阳般刚健，动静合宜，阴阳调和。'
  },
  {
    id: 'yq014',
    content: '道者，万物之所系，而众生之所由也。',
    source: '《渔樵问对》',
    category: 'universe',
    element: '金',
    context: '道是万物的根源，众生皆由道而生，回归本源即是修真。'
  },
  {
    id: 'yq015',
    content: '知止而后有定，定而后能静，静而后能安。',
    source: '《渔樵问对》',
    category: 'mind',
    element: '水',
    context: '知道止境方能坚定，坚定方能宁静，宁静方能安稳，此为修心次第。'
  },
  {
    id: 'yq016',
    content: '气者，神之母；神者，气之子。',
    source: '《渔樵问对》',
    category: 'cultivation',
    element: '火',
    context: '气为神之本，神为气之用。炼气养神，相辅相成，不可偏废。'
  },
  {
    id: 'yq017',
    content: '五行之理，相生相克，循环无端。',
    source: '《渔樵问对》',
    category: 'universe',
    element: '土',
    context: '金木水火土相生相克，如环无端。修真当明五行之理，调和体内之气。'
  },
  {
    id: 'yq018',
    content: '至虚极，守静笃，万物并作，吾以观复。',
    source: '《渔樵问对》',
    category: 'mind',
    element: '水',
    context: '达到虚无之境，守住宁静之本，观万物循环往复，此乃入定之法。'
  },
  {
    id: 'yq019',
    content: '日出而作，日入而息，逍遥于天地之间。',
    source: '《渔樵问对》',
    category: 'nature',
    element: '木',
    context: '顺应自然规律，与天地同步，此为养生之要，亦是修真之法。'
  },
  {
    id: 'yq020',
    content: '大智若愚，大巧若拙，大音希声，大象无形。',
    source: '《渔樵问对》',
    category: 'philosophy',
    element: '金',
    context: '真正的智慧看似愚钝，真正的灵巧看似笨拙。大道至简，返璞归真。'
  }
];

// 宇宙意识论修仙箴言
export const COSMIC_QUOTES: WisdomQuote[] = [
  {
    id: 'cq001',
    content: '宇宙即意识，意识即宇宙。修行非向外求，乃是向内归。',
    source: '《宇宙意识论》',
    category: 'universe',
    element: '土',
    context: '万物皆由宇宙意识所化，修真即是与宇宙本源意识重新连接。'
  },
  {
    id: 'cq002',
    content: '灵根非天赋，乃心识之频率。调频者，可与天地共振。',
    source: '《宇宙意识论》',
    category: 'cultivation',
    element: '木',
    context: '灵根不是先天注定，而是心识状态。修心即是修灵根。'
  },
  {
    id: 'cq003',
    content: '丹田者，能量之漩涡也。呼吸之间，宇宙能量聚于此。',
    source: '《宇宙意识论》',
    category: 'cultivation',
    element: '火',
    context: '丹田是身体能量中心，通过呼吸吐纳吸收宇宙能量。'
  },
  {
    id: 'cq004',
    content: '境由心造，界由识分。破识见界，方入化神。',
    source: '《宇宙意识论》',
    category: 'mind',
    element: '水',
    context: '境界的界限来自于意识的分辨。超越分辨心，方能突破境界。'
  },
  {
    id: 'cq005',
    content: '日月精华，天地之馈赠。子时练功，事半功倍。',
    source: '《宇宙意识论》',
    category: 'cultivation',
    element: '火',
    context: '子时一阳初生，是修炼的最佳时机，顺应天时效率倍增。'
  },
  {
    id: 'cq006',
    content: '五行相生，如环无端。体内五行调和，则百病不侵。',
    source: '《宇宙意识论》',
    category: 'universe',
    element: '土',
    context: '体内五行能量平衡是健康与修炼的基础。'
  },
  {
    id: 'cq007',
    content: '因果非天定，乃心识之轨迹。改变心识，即改因果。',
    source: '《宇宙意识论》',
    category: 'philosophy',
    element: '金',
    context: '因果不是宿命，而是心识运行的规律。修真可改命。'
  },
  {
    id: 'cq008',
    content: '呼吸是桥梁，连接有形与无形。调息即是调心。',
    source: '《宇宙意识论》',
    category: 'cultivation',
    element: '木',
    context: '呼吸是连接身体与能量的桥梁，调息是修炼的基础。'
  },
  {
    id: 'cq009',
    content: '执念如锁，放下即钥匙。无我无相，方见真我。',
    source: '《宇宙意识论》',
    category: 'mind',
    element: '水',
    context: '放下执念才能解脱束缚，见到真正的自己。'
  },
  {
    id: 'cq010',
    content: '大道至简，复归于朴。返璞归真，便是成仙。',
    source: '《宇宙意识论》',
    category: 'philosophy',
    element: '土',
    context: '最高的道理最简单，回归质朴即是得道。'
  }
];

// 所有箴言汇总
export const ALL_QUOTES: WisdomQuote[] = [...YU_QIAO_QUOTES, ...COSMIC_QUOTES];

// 按分类获取箴言
export function getQuotesByCategory(category: WisdomQuote['category']): WisdomQuote[] {
  return ALL_QUOTES.filter(q => q.category === category);
}

// 按五行获取箴言
export function getQuotesByElement(element: string): WisdomQuote[] {
  return ALL_QUOTES.filter(q => q.element === element);
}

// 随机获取一条箴言
export function getRandomQuote(category?: WisdomQuote['category'], element?: string): WisdomQuote {
  let pool = ALL_QUOTES;
  if (category) {
    pool = pool.filter(q => q.category === category);
  }
  if (element) {
    pool = pool.filter(q => q.element === element);
  }
  if (pool.length === 0) pool = ALL_QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// 根据日期获取当日箴言（确定性随机）
export function getDailyQuote(date: Date = new Date(), userElement?: string): WisdomQuote {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  let pool = ALL_QUOTES;
  if (userElement) {
    // 优先选择同属性或相生属性的箴言
    const generatedBy: Record<string, string> = {
      '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
    };
    const preferredElement = generatedBy[userElement];
    const preferred = pool.filter(q => q.element === userElement || q.element === preferredElement);
    if (preferred.length > 0) {
      pool = preferred;
    }
  }
  
  const index = dayOfYear % pool.length;
  return pool[index];
}
