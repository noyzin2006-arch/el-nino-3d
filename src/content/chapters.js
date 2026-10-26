/* 中文科学文案。所有表述为“典型倾向”，不编造无出处数字。 */

export const CHAPTERS = [
  {
    id: 'normal',
    number: '01',
    title: '正常年份的海洋',
    body: [
      '在通常状态下，赤道信风由东向西吹，把表层暖水推向西太平洋。东部较浅的温跃层让较冷、富营养的海水容易上涌。',
      '暖湿空气在西太平洋附近上升，构成沃克环流的一部分：高空空气向东回流，在东部下沉。',
    ],
    facts: [
      { label: '信风强度', value: '强，稳定向西' },
      { label: '温跃层形态', value: '西部深，东部浅' },
      { label: '东部上升流', value: '活跃' },
      { label: '主要雨带位置', value: '西部暖池上空' },
    ],
    srSummary:
      '第一幕正常年份：信风把暖水吹向西太平洋，东部温跃层浅、冷水上涌活跃，降雨集中在西部。',
    impactHighlights: [],
  },
  {
    id: 'el-nino',
    number: '02',
    title: '暖水东移：厄尔尼诺形成',
    body: [
      '当信风持续减弱，原先被推往西部的暖水向中东太平洋扩展。东太平洋温跃层加深，冷水上涌受到抑制；暖海水也改变上方对流和降雨的位置。',
      '海洋与大气相互反馈，这就是厄尔尼诺发展中的关键链条。',
    ],
    facts: [
      { label: '信风强度', value: '明显减弱' },
      { label: '温跃层形态', value: '坡度变缓，东部加深' },
      { label: '东部上升流', value: '受抑制' },
      { label: '主要雨带位置', value: '移向中东部' },
    ],
    srSummary:
      '第二幕厄尔尼诺形成：信风减弱，暖水向东扩展，东部温跃层加深、上升流受抑制，雨带东移。',
    impactHighlights: [],
  },
  {
    id: 'impact',
    number: '03',
    title: '全球影响：改变的是概率',
    body: [
      '厄尔尼诺改变的是区域天气的概率倾向，而不是某一天的晴雨。海气耦合的能量通过大气环流传递到很远的地方，让一些地区更湿润，另一些地区更干燥。',
      '下方四张卡片列出四类典型影响。每一次事件的强度、位置和具体影响并不完全相同。',
    ],
    facts: [
      { label: '南美西岸', value: '降水偏多风险上升' },
      { label: '印尼 / 澳大利亚', value: '偏旱风险上升' },
      { label: '中国冬季', value: '总体偏暖概率上升' },
      { label: '秘鲁近海渔业', value: '上升流减弱，渔获易受影响' },
    ],
    srSummary:
      '第三幕全球影响：厄尔尼诺改变区域天气概率，南美西岸洪涝风险、印尼澳大利亚干旱风险、中国暖冬概率、秘鲁渔业均可能受影响，但都不是必然。',
    impactHighlights: ['rain-east', 'impact-cards'],
  },
];

export const IMPACT_CARDS = [
  {
    id: 'peru-flood',
    region: '秘鲁 / 厄瓜多尔沿岸',
    headline: '降水与洪涝风险上升',
    detail:
      '厄尔尼诺期间，中东太平洋海温升高使对流增强，南美西岸部分沿岸地区降水偏多、洪涝风险上升。',
    caveat: '典型倾向，并非每次必然发生；影响程度随事件强度与位置而变化。',
    sourceUrl: 'https://www.noaa.gov/understanding-el-nino',
  },
  {
    id: 'peru-fishery',
    region: '秘鲁近海渔业',
    headline: '上升流减弱，渔获易受影响',
    detail:
      '东部上升流减弱使富含营养盐的冷水难以上泛，浮游生物与鱼类资源分布改变，传统渔场渔获可能明显波动。',
    caveat: '典型倾向，并非每次必然发生；渔业还受捕捞管理与海洋生态共同影响。',
    sourceUrl: 'https://www.noaa.gov/jetstream/tropical/enso/enso-patterns',
  },
  {
    id: 'indonesia-drought',
    region: '印度尼西亚 / 澳大利亚部分地区',
    headline: '偏旱风险增加',
    detail:
      '暖水东移后，西部暖池对流减弱，印尼与澳大利亚部分地区降雨偏少、干旱风险增加，森林火险也可能升高。',
    caveat: '典型倾向，并非每次必然发生；区域与季节差异显著。',
    sourceUrl: 'https://www.noaa.gov/jetstream/tropical/enso/enso-patterns',
  },
  {
    id: 'china-warm-winter',
    region: '中国',
    headline: '部分冬季总体偏暖概率上升',
    detail:
      '在某些厄尔尼诺成熟期，东亚冬季风可能偏弱，中国部分地区冬季总体偏暖的概率增加；但寒潮与区域差异仍然存在。',
    caveat: '典型概率倾向，不决定某次寒潮是否发生，更不意味着“今年必暖”。',
    sourceUrl: 'https://www.szlhq.gov.cn/gkmlpt/content/12/12971/post_12971044.html',
  },
];

export const SOURCES = [
  {
    label: 'NOAA：Understanding El Niño',
    url: 'https://www.noaa.gov/understanding-el-nino',
    purpose: 'ENSO 机制与影响的官方解释',
  },
  {
    label: 'NOAA JetStream：ENSO Patterns',
    url: 'https://www.noaa.gov/jetstream/tropical/enso/enso-patterns',
    purpose: '正常态与厄尔尼诺态的海气格局',
  },
  {
    label: 'NASA：El Niño 科普',
    url: 'https://science.nasa.gov/earth/explore/el-nino/',
    purpose: '厄尔尼诺的观测与全球影响',
  },
  {
    label: 'NOAA PMEL：ENSO 示意图',
    url: 'https://www.pmel.noaa.gov/elnino/schematic-diagrams/',
    purpose: '三态对比图解（本页剖面语法的参照）',
  },
];
