export interface SportsGamingMarket {
  id: number;
  title: string;
  category: string;
  probability: number;
  volume: string;
  participants: number;
  endDate: string;
  trend: 'up' | 'down';
  change: string;
  description: string;
  resolutionCriteria: string[];
  relatedMarkets: string[];
}

const sportsGamingMarkets: SportsGamingMarket[] = [
  // 篮球
  {
    id: 301,
    title: "CBA 2025-2026赛季总冠军是否为辽宁队？",
    category: "篮球",
    probability: 42.8,
    volume: "$3,456,789",
    participants: 2345,
    endDate: "May 15, 2026",
    trend: "up",
    change: "+8.3%",
    description: "此市场预测中国男子篮球职业联赛（CBA）2025-2026赛季的总冠军是否为辽宁本钢队。",
    resolutionCriteria: [
      "数据来源：CBA联赛官方公告、总决赛官方结果。",
      "冠军定义：在2025-2026赛季总决赛中获胜的球队。",
      "结算时间：总决赛结束后的第二个工作日。",
      "若赛季因不可抗力因素取消或延期，市场将相应调整结算时间。"
    ],
    relatedMarkets: [
      "广东宏远是否获得CBA 2025-2026赛季冠军？",
      "新疆广汇是否进入CBA 2025-2026赛季总决赛？",
      "CBA 2025-2026赛季MVP是否来自辽宁队？"
    ]
  },
  {
    id: 302,
    title: "广东宏远是否获得CBA 2025-2026赛季冠军？",
    category: "篮球",
    probability: 38.5,
    volume: "$2,890,123",
    participants: 1987,
    endDate: "May 15, 2026",
    trend: "down",
    change: "-4.2%",
    description: "此市场预测广东宏远华南虎队是否能够在CBA 2025-2026赛季夺得总冠军。",
    resolutionCriteria: [
      "数据来源：CBA联赛官方公告。",
      "冠军定义：在2025-2026赛季总决赛中获胜的球队。",
      "结算时间：总决赛结束后的第二个工作日。"
    ],
    relatedMarkets: [
      "CBA 2025-2026赛季总冠军是否为辽宁队？",
      "易建联是否在2026年退役？",
      "CBA 2026年总决赛场均观众是否超1.5万人？"
    ]
  },

  // 足球
  {
    id: 303,
    title: "中国男足是否晋级2026世界杯？",
    category: "足球",
    probability: 18.3,
    volume: "$8,234,567",
    participants: 5678,
    endDate: "Nov 30, 2025",
    trend: "down",
    change: "-12.5%",
    description: "此市场预测中国国家男子足球队是否能够晋级2026年FIFA世界杯决赛圈（在美国、加拿大、墨西哥举办）。",
    resolutionCriteria: [
      "数据来源：FIFA官方公告、亚足联官方公告。",
      "晋级定义：中国男足需通过亚洲区预选赛，获得2026年世界杯决赛圈参赛资格。",
      "结算时间：亚洲区预选赛结束后的5个工作日内（预计2025年11月）。",
      "若预选赛赛制调整，以调整后的规则为准。"
    ],
    relatedMarkets: [
      "中国男足2026年亚洲排名是否进入前8？",
      "日本是否晋级2026世界杯？",
      "韩国是否晋级2026世界杯？"
    ]
  },
  {
    id: 304,
    title: "中超联赛2026赛季冠军是否为上海海港？",
    category: "足球",
    probability: 35.7,
    volume: "$2,345,678",
    participants: 1678,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+6.8%",
    description: "此市场预测中国足球协会超级联赛（中超）2026赛季的冠军是否为上海海港队。",
    resolutionCriteria: [
      "数据来源：中国足球协会官方公告、中超联赛官方结果。",
      "冠军定义：2026赛季中超联赛积分榜第一名的球队。",
      "结算时间：2026赛季结束后的第二个工作日。"
    ],
    relatedMarkets: [
      "山东泰山是否获得中超2026赛季冠军？",
      "中超2026赛季场均观众是否超2万人？",
      "中超2026赛季是否有球队破产？"
    ]
  },

  // 电竞 - 王者荣耀
  {
    id: 305,
    title: "王者荣耀世界冠军杯2026是否由中国战队夺冠？",
    category: "电竞",
    probability: 78.5,
    volume: "$5,678,901",
    participants: 4567,
    endDate: "Aug 31, 2026",
    trend: "up",
    change: "+15.2%",
    description: "此市场预测2026年王者荣耀世界冠军杯（KIC）的冠军是否来自中国赛区（KPL）的战队。",
    resolutionCriteria: [
      "数据来源：王者荣耀官方赛事公告、KIC官方结果。",
      "中国战队定义：参加中国大陆KPL（王者荣耀职业联赛）的战队。",
      "结算时间：KIC总决赛结束后的第二个工作日。",
      "若赛事因故取消或延期，市场将相应调整。"
    ],
    relatedMarkets: [
      "成都AG超玩会是否获得KPL 2026春季赛冠军？",
      "王者荣耀2026年全球MAU是否超2亿？",
      "KIC 2026总决赛奖金是否超500万美元？"
    ]
  },
  {
    id: 306,
    title: "成都AG超玩会是否获得KPL 2026春季赛冠军？",
    category: "电竞",
    probability: 32.4,
    volume: "$2,456,789",
    participants: 2123,
    endDate: "Jun 30, 2026",
    trend: "up",
    change: "+9.7%",
    description: "此市场预测成都AG超玩会战队是否能够获得王者荣耀职业联赛（KPL）2026春季赛冠军。",
    resolutionCriteria: [
      "数据来源：KPL官方赛事公告。",
      "冠军定义：在KPL 2026春季赛总决赛中获胜的战队。",
      "结算时间：春季赛总决赛结束后的第二个工作日。"
    ],
    relatedMarkets: [
      "王者荣耀世界冠军杯2026是否由中国战队夺冠？",
      "重庆狼队是否进入KPL 2026春季赛总决赛？",
      "KPL 2026春季赛总决赛观看人数是否破亿？"
    ]
  },

  // 国际电竞 - 英雄联盟
  {
    id: 307,
    title: "Faker是否在2026年获得LCK春季赛MVP？",
    category: "国际电竞",
    probability: 45.8,
    volume: "$4,123,456",
    participants: 3456,
    endDate: "Apr 30, 2026",
    trend: "up",
    change: "+11.3%",
    description: "此市场预测韩国电竞选手Faker（李相赫）是否能够在2026年LCK（韩国英雄联盟职业联赛）春季赛中获得MVP（最有价值选手）称号。",
    resolutionCriteria: [
      "数据来源：LCK官方赛事公告、Riot Games官方声明。",
      "MVP定义：LCK官方评选的2026春季赛常规赛MVP。",
      "结算时间：LCK 2026春季赛常规赛结束后的5个工作日内。",
      "若Faker未参加2026春季赛，市场解析为'否'。"
    ],
    relatedMarkets: [
      "T1是否获得LCK 2026春季赛冠军？",
      "Faker是否参加2026年英雄联盟全球总决赛？",
      "LCK 2026年是否有新战队夺冠？"
    ]
  },
  {
    id: 308,
    title: "T1是否获得英雄联盟2026全球总决赛冠军？",
    category: "国际电竞",
    probability: 28.6,
    volume: "$6,789,012",
    participants: 5234,
    endDate: "Nov 30, 2026",
    trend: "down",
    change: "-6.4%",
    description: "此市场预测韩国T1战队是否能够获得2026年英雄联盟全球总决赛（Worlds）冠军。",
    resolutionCriteria: [
      "数据来源：Riot Games官方公告、英雄联盟全球总决赛官方结果。",
      "冠军定义：在2026年英雄联盟全球总决赛决赛中获胜的战队。",
      "结算时间：全球总决赛决赛结束后的第二个工作日。"
    ],
    relatedMarkets: [
      "Faker是否在2026年获得LCK春季赛MVP？",
      "中国LPL战队是否获得Worlds 2026冠军？",
      "Worlds 2026总决赛观看人数是否破5000万？"
    ]
  },
  {
    id: 309,
    title: "中国LPL战队是否获得Worlds 2026冠军？",
    category: "国际电竞",
    probability: 52.3,
    volume: "$5,456,789",
    participants: 4123,
    endDate: "Nov 30, 2026",
    trend: "up",
    change: "+13.7%",
    description: "此市场预测来自中国LPL（英雄联盟职业联赛）的战队是否能够获得2026年英雄联盟全球总决赛冠军。",
    resolutionCriteria: [
      "数据来源：Riot Games官方公告。",
      "LPL战队定义：参加中国大陆LPL联赛的战队。",
      "结算时间：全球总决赛决赛结束后的第二个工作日。"
    ],
    relatedMarkets: [
      "T1是否获得英雄联盟2026全球总决赛冠军？",
      "JDG是否进入Worlds 2026四强？",
      "LPL 2026年是否有新战队夺冠？"
    ]
  },

  // 东南亚电竞 - Mobile Legends
  {
    id: 310,
    title: "Mobile Legends东南亚杯2026冠军是否来自印尼？",
    category: "东南亚电竞",
    probability: 56.7,
    volume: "$3,234,567",
    participants: 2678,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+10.8%",
    description: "此市场预测2026年Mobile Legends东南亚杯（MSC）的冠军战队是否来自印度尼西亚。",
    resolutionCriteria: [
      "数据来源：Mobile Legends官方赛事公告、MSC官方结果。",
      "印尼战队定义：代表印度尼西亚赛区参赛的战队。",
      "结算时间：MSC总决赛结束后的第二个工作日。",
      "若赛事因故取消，市场将根据官方声明进行结算。"
    ],
    relatedMarkets: [
      "菲律宾战队是否获得MSC 2026冠军？",
      "Mobile Legends 2026年东南亚MAU是否超1.5亿？",
      "MSC 2026总决赛奖金是否超100万美元？"
    ]
  },
  {
    id: 311,
    title: "菲律宾战队是否获得MSC 2026冠军？",
    category: "东南亚电竞",
    probability: 38.2,
    volume: "$2,567,890",
    participants: 1987,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-5.3%",
    description: "此市场预测来自菲律宾的Mobile Legends战队是否能够获得2026年东南亚杯冠军。",
    resolutionCriteria: [
      "数据来源：Mobile Legends官方赛事公告。",
      "菲律宾战队定义：代表菲律宾赛区参赛的战队。",
      "结算时间：MSC总决赛结束后的第二个工作日。"
    ],
    relatedMarkets: [
      "Mobile Legends东南亚杯2026冠军是否来自印尼？",
      "马来西亚战队是否进入MSC 2026四强？",
      "菲律宾MPL 2026年冠军是哪支战队？"
    ]
  },

  // 其他体育
  {
    id: 312,
    title: "中国女排是否获得2026世界女排联赛冠军？",
    category: "排球",
    probability: 42.5,
    volume: "$2,890,123",
    participants: 1876,
    endDate: "Jul 31, 2026",
    trend: "up",
    change: "+8.6%",
    description: "此市场预测中国国家女子排球队是否能够获得2026年世界女排联赛（VNL）总决赛冠军。",
    resolutionCriteria: [
      "数据来源：国际排联（FIVB）官方公告。",
      "冠军定义：在2026年VNL总决赛中获胜的国家队。",
      "结算时间：总决赛结束后的第二个工作日。"
    ],
    relatedMarkets: [
      "中国女排是否进入2026世界女排联赛四强？",
      "巴西女排是否获得VNL 2026冠军？",
      "中国女排2026年世界排名是否保持前三？"
    ]
  },
  {
    id: 313,
    title: "苏炳添是否在2026年跑进10秒大关？",
    category: "田径",
    probability: 24.8,
    volume: "$1,678,901",
    participants: 1234,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-7.2%",
    description: "此市场预测中国短跑运动员苏炳添是否能够在2026年任何一场正式比赛中，男子100米成绩跑进10秒大关（即成绩小于10.00秒）。",
    resolutionCriteria: [
      "数据来源：国际田联（World Athletics）官方认证成绩、中国田径协会官方数据。",
      "成绩定义：在2026年1月1日至12月31日期间，任何一场官方认证的比赛中，苏炳添的男子100米成绩小于10.00秒（含电计时）。",
      "结算时间：2027年1月15日。",
      "若苏炳添2026年未参加任何比赛，市场解析为'否'。"
    ],
    relatedMarkets: [
      "苏炳添是否参加2026年亚运会？",
      "中国男子4x100米接力是否进入2026年世界前八？",
      "谢震业是否在2026年跑进10秒？"
    ]
  },
  {
    id: 314,
    title: "中国队是否获得2026年杭州亚运会金牌榜第一？",
    category: "综合赛事",
    probability: 88.3,
    volume: "$4,567,890",
    participants: 3456,
    endDate: "Oct 15, 2026",
    trend: "up",
    change: "+5.7%",
    description: "此市场预测中国代表团是否能够在2026年杭州亚运会上获得金牌榜第一名。",
    resolutionCriteria: [
      "数据来源：亚洲奥林匹克理事会（OCA）官方金牌榜。",
      "金牌榜第一定义：中国代表团获得的金牌总数在所有参赛国家/地区中排名第一。",
      "结算时间：亚运会闭幕式后的第二个工作日。",
      "若金牌数相同，以银牌数、铜牌数依次比较。"
    ],
    relatedMarkets: [
      "日本是否获得杭州亚运会金牌榜前三？",
      "韩国是否获得杭州亚运会金牌榜前三？",
      "中国队金牌总数是否超150枚？"
    ]
  }
];

export const getAllSportsGamingMarkets = (): SportsGamingMarket[] => {
  return sportsGamingMarkets;
};

export const getSportsGamingMarketById = (id: number): SportsGamingMarket | undefined => {
  return sportsGamingMarkets.find(market => market.id === id);
};

