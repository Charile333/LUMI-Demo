// 手机与智能硬件赛道市场数据
export const smartDevicesMarkets = [
  // 新机销量
  {
    id: 101,
    title: "小米15 Ultra 首月销量是否超120万台？",
    category: "新机销量",
    probability: 65.8,
    volume: "$2,876,543",
    participants: 1567,
    endDate: "Mar 31, 2026",
    trend: "up",
    change: "+7.3%",
    description: "小米15 Ultra作为小米年度旗舰机型，搭载最新高通骁龙处理器和徕卡影像系统。此市场预测其上市首月（含预售）销量能否突破120万台。",
    resolutionCriteria: [
      "基于小米官方公布的销量数据",
      "统计时间为正式开售后的30天内",
      "包含所有版本和配置的总销量",
      "以实际发货数量为准"
    ],
    relatedMarkets: [
      "小米15系列总销量",
      "小米vs华为旗舰机对比",
      "高端手机市场份额",
      "徕卡影像手机销量"
    ]
  },
  {
    id: 102,
    title: "iPhone 17在中国市场2026年销量是否超5000万台？",
    category: "新机销量",
    probability: 58.4,
    volume: "$4,234,567",
    participants: 2345,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-3.2%",
    description: "iPhone 17系列作为苹果2026年旗舰产品，面临华为等国产品牌的强力竞争。此市场预测iPhone 17全系列在中国市场的全年销量能否达到5000万台。",
    resolutionCriteria: [
      "基于第三方市场调研机构数据（如IDC、Canalys）",
      "统计时间为2026年全年",
      "包括iPhone 17全系列所有型号",
      "以中国大陆市场销量为准"
    ],
    relatedMarkets: [
      "苹果中国市场份额",
      "iPhone vs 华为Mate对比",
      "高端手机市场格局",
      "iOS vs 鸿蒙用户数"
    ]
  },
  {
    id: 103,
    title: "华为Mate 70系列首周销量是否超200万台？",
    category: "新机销量",
    probability: 72.6,
    volume: "$3,456,789",
    participants: 1876,
    endDate: "Feb 15, 2026",
    trend: "up",
    change: "+11.4%",
    description: "华为Mate 70系列搭载麒麟芯片和鸿蒙NEXT系统，市场关注度极高。此市场预测其首周销量（含预售）能否突破200万台。",
    resolutionCriteria: [
      "基于华为官方或权威第三方数据",
      "统计时间为正式开售后的7天内",
      "包含所有Mate 70系列型号",
      "以实际发货或激活数量为准"
    ],
    relatedMarkets: [
      "华为手机市场份额",
      "麒麟芯片回归影响",
      "鸿蒙NEXT装机量",
      "华为vs苹果旗舰对比"
    ]
  },

  // 市场份额
  {
    id: 104,
    title: "2026年安卓手机在中国市场份额是否超70%？",
    category: "市场份额",
    probability: 76.3,
    volume: "$3,876,543",
    participants: 2134,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+9.7%",
    description: "随着国产手机品牌的崛起和鸿蒙系统的发展，安卓阵营在中国市场的份额持续增长。此市场预测2026年安卓手机（不含鸿蒙）的市场份额能否超过70%。",
    resolutionCriteria: [
      "基于IDC、Canalys等权威机构年度报告",
      "统计时间为2026年全年",
      "安卓系统包括原生Android及定制系统",
      "不包括鸿蒙NEXT系统设备"
    ],
    relatedMarkets: [
      "iOS市场份额趋势",
      "鸿蒙系统市场份额",
      "国产手机总体份额",
      "操作系统生态竞争"
    ]
  },
  {
    id: 105,
    title: "小米2026年全球市场份额是否进入前三？",
    category: "市场份额",
    probability: 68.9,
    volume: "$2,567,890",
    participants: 1456,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+6.8%",
    description: "小米积极拓展海外市场，在印度、欧洲等地表现强劲。此市场预测小米2026年全球手机出货量排名能否进入前三名。",
    resolutionCriteria: [
      "基于IDC、Counterpoint等机构年度排名",
      "统计时间为2026年全年",
      "以全球手机出货量为准",
      "需进入全球前三名"
    ],
    relatedMarkets: [
      "小米海外市场表现",
      "全球手机市场格局",
      "中国品牌出海趋势",
      "小米vs OPPO全球对比"
    ]
  },
  {
    id: 106,
    title: "华为中国市场份额是否在2026年重回第一？",
    category: "市场份额",
    probability: 71.2,
    volume: "$4,123,456",
    participants: 2567,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+13.5%",
    description: "华为在麒麟芯片回归和鸿蒙生态完善后，市场份额快速回升。此市场预测华为2026年在中国手机市场的份额能否重回第一。",
    resolutionCriteria: [
      "基于权威第三方市场调研机构数据",
      "统计时间为2026年全年或Q4季度",
      "以中国大陆市场出货量或销量为准",
      "需超过其他所有品牌成为第一"
    ],
    relatedMarkets: [
      "华为vs苹果中国市场",
      "华为vs小米份额对比",
      "麒麟芯片市场影响",
      "鸿蒙生态发展"
    ]
  },

  // 系统生态
  {
    id: 107,
    title: "鸿蒙NEXT用户数是否于2026年底突破2亿？",
    category: "系统生态",
    probability: 64.7,
    volume: "$3,234,567",
    participants: 1789,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+8.9%",
    description: "鸿蒙NEXT作为纯血鸿蒙系统，不再兼容Android应用。此市场预测其用户数（包括手机、平板、手表等设备）能否在2026年底突破2亿。",
    resolutionCriteria: [
      "基于华为官方公布的用户数据",
      "统计截止时间为2026年12月31日",
      "包括所有搭载鸿蒙NEXT的设备",
      "以激活用户数为准"
    ],
    relatedMarkets: [
      "鸿蒙生态应用数量",
      "华为设备销量",
      "鸿蒙vs iOS生态对比",
      "开发者支持度"
    ]
  },
  {
    id: 108,
    title: "2026年鸿蒙应用商店应用数量是否超100万？",
    category: "系统生态",
    probability: 52.3,
    volume: "$1,876,543",
    participants: 987,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+5.4%",
    description: "鸿蒙NEXT生态建设的关键在于应用数量和质量。此市场预测华为应用市场的鸿蒙原生应用数量能否在2026年底超过100万。",
    resolutionCriteria: [
      "基于华为应用市场官方数据",
      "统计截止时间为2026年12月31日",
      "仅统计鸿蒙NEXT原生应用",
      "不包括兼容层运行的Android应用"
    ],
    relatedMarkets: [
      "鸿蒙开发者数量",
      "主流应用鸿蒙版本覆盖率",
      "鸿蒙vs Android应用生态",
      "HMS生态发展"
    ]
  },
  {
    id: 109,
    title: "ColorOS用户数2026年是否超6亿？",
    category: "系统生态",
    probability: 59.8,
    volume: "$1,567,890",
    participants: 876,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+4.2%",
    description: "ColorOS作为OPPO的定制系统，在全球拥有庞大用户基础。此市场预测ColorOS全球用户数能否在2026年底达到6亿。",
    resolutionCriteria: [
      "基于OPPO官方公布的数据",
      "统计截止时间为2026年12月31日",
      "包括OPPO和一加设备用户",
      "以月活跃用户数为准"
    ],
    relatedMarkets: [
      "OPPO全球销量",
      "一加品牌发展",
      "ColorOS vs MIUI对比",
      "Android定制系统格局"
    ]
  },

  // 区域市场
  {
    id: 110,
    title: "OPPO在印尼是否连续三季度市场占比第一？",
    category: "区域市场",
    probability: 67.4,
    volume: "$2,345,678",
    participants: 1234,
    endDate: "Sep 30, 2026",
    trend: "up",
    change: "+7.1%",
    description: "OPPO在印尼市场深耕多年，拥有强大的线下渠道。此市场预测OPPO能否在2026年Q1-Q3连续三个季度保持印尼市场份额第一。",
    resolutionCriteria: [
      "基于Canalys、IDC等机构季度报告",
      "统计时间为2026年Q1、Q2、Q3",
      "以印尼市场出货量份额为准",
      "需连续三个季度排名第一"
    ],
    relatedMarkets: [
      "OPPO东南亚市场布局",
      "中国品牌印尼竞争",
      "东南亚手机市场格局",
      "线下渠道竞争力"
    ]
  },
  {
    id: 111,
    title: "小米在印度2026年市场份额是否保持第一？",
    category: "区域市场",
    probability: 71.8,
    volume: "$3,456,789",
    participants: 1678,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+9.3%",
    description: "小米在印度市场长期占据领先地位。此市场预测小米能否在2026年全年继续保持印度手机市场份额第一。",
    resolutionCriteria: [
      "基于IDC、Counterpoint年度报告",
      "统计时间为2026年全年",
      "以印度市场出货量份额为准",
      "需全年平均排名第一"
    ],
    relatedMarkets: [
      "小米印度本地化策略",
      "印度手机市场竞争",
      "中国品牌印度表现",
      "性价比市场格局"
    ]
  },
  {
    id: 112,
    title: "华为在欧洲市场2026年销量是否超500万台？",
    category: "区域市场",
    probability: 43.6,
    volume: "$1,876,543",
    participants: 789,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-4.7%",
    description: "华为在欧洲市场面临诸多挑战。此市场预测华为2026年在欧洲市场的手机销量能否达到500万台。",
    resolutionCriteria: [
      "基于欧洲市场调研机构数据",
      "统计时间为2026年全年",
      "包括欧盟及英国等主要欧洲国家",
      "以实际销量为准"
    ],
    relatedMarkets: [
      "华为海外市场策略",
      "欧洲手机市场格局",
      "中国品牌欧洲表现",
      "GMS服务影响"
    ]
  },

  // 技术创新
  {
    id: 113,
    title: "2026年是否有手机搭载自研芯片上市？（小米澎湃）",
    category: "技术创新",
    probability: 56.7,
    volume: "$2,123,456",
    participants: 1345,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+6.5%",
    description: "小米自研澎湃芯片进展备受关注。此市场预测2026年是否会有搭载小米自研旗舰芯片的手机正式上市销售。",
    resolutionCriteria: [
      "小米官方发布搭载自研芯片的手机",
      "芯片需为小米自主设计的旗舰级SoC",
      "手机需正式上市销售，不含工程机",
      "发布时间在2026年内"
    ],
    relatedMarkets: [
      "小米芯片研发进展",
      "国产芯片自主化",
      "手机芯片市场格局",
      "澎湃vs麒麟对比"
    ]
  },
  {
    id: 114,
    title: "iPhone 17 Pro起售价是否低于9999元？",
    category: "技术创新",
    probability: 38.9,
    volume: "$2,876,543",
    participants: 1567,
    endDate: "Sep 30, 2026",
    trend: "down",
    change: "-5.3%",
    description: "iPhone定价策略一直备受关注。此市场预测iPhone 17 Pro在中国市场的起售价能否低于9999元。",
    resolutionCriteria: [
      "基于苹果官方中国区定价",
      "统计iPhone 17 Pro最低配置版本",
      "以发布会公布的官方售价为准",
      "不包括任何折扣或促销活动"
    ],
    relatedMarkets: [
      "iPhone定价策略",
      "高端手机价格趋势",
      "苹果中国市场策略",
      "汇率影响分析"
    ]
  },
  {
    id: 115,
    title: "小米16发布会B站播放量是否超500万？",
    category: "技术创新",
    probability: 73.2,
    volume: "$1,567,890",
    participants: 1123,
    endDate: "Mar 31, 2026",
    trend: "up",
    change: "+10.8%",
    description: "小米发布会的关注度反映品牌影响力。此市场预测小米16系列发布会在B站的播放量（发布后7天内）能否突破500万。",
    resolutionCriteria: [
      "统计B站官方直播间的播放量",
      "统计时间为发布会结束后7天内",
      "包括直播和回放的总播放量",
      "以B站显示的数据为准"
    ],
    relatedMarkets: [
      "小米品牌影响力",
      "手机发布会热度对比",
      "年轻用户关注度",
      "社交媒体营销效果"
    ]
  },
  {
    id: 116,
    title: "2026年折叠屏手机全球销量是否超3000万台？",
    category: "技术创新",
    probability: 61.4,
    volume: "$2,456,789",
    participants: 1456,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+8.7%",
    description: "折叠屏手机市场快速增长。此市场预测2026年全球折叠屏手机（包括横折和竖折）的总销量能否达到3000万台。",
    resolutionCriteria: [
      "基于全球市场调研机构数据",
      "统计时间为2026年全年",
      "包括所有品牌的折叠屏手机",
      "横折和竖折均计入统计"
    ],
    relatedMarkets: [
      "折叠屏技术成熟度",
      "折叠屏价格趋势",
      "各品牌折叠屏布局",
      "折叠屏vs直板机市场"
    ]
  },
  {
    id: 117,
    title: "卫星通信功能2026年是否成为旗舰机标配？",
    category: "技术创新",
    probability: 48.3,
    volume: "$1,876,543",
    participants: 987,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+5.9%",
    description: "卫星通信成为手机新卖点。此市场预测2026年发布的旗舰手机中，是否有超过50%支持卫星通信功能。",
    resolutionCriteria: [
      "统计2026年发布的主流品牌旗舰机型",
      "旗舰机定义为售价5000元以上的机型",
      "支持卫星通信的机型占比需超50%",
      "以官方发布的功能参数为准"
    ],
    relatedMarkets: [
      "卫星通信技术普及",
      "应急通信需求",
      "手机功能创新趋势",
      "通信基础设施发展"
    ]
  },
  {
    id: 118,
    title: "2026年是否有手机电池容量突破7000mAh？",
    category: "技术创新",
    probability: 69.7,
    volume: "$1,678,901",
    participants: 1234,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+7.6%",
    description: "手机续航一直是用户痛点。此市场预测2026年是否会有量产手机的电池容量达到或超过7000mAh。",
    resolutionCriteria: [
      "手机需正式上市销售",
      "电池容量需达到7000mAh或以上",
      "以官方公布的电池参数为准",
      "发布时间在2026年内"
    ],
    relatedMarkets: [
      "电池技术突破",
      "手机续航竞争",
      "硅碳负极应用",
      "快充技术发展"
    ]
  }
];

// 根据ID获取市场数据
export const getSmartDeviceMarketById = (id: number) => {
  return smartDevicesMarkets.find(market => market.id === id);
};

// 获取所有市场数据
export const getAllSmartDeviceMarkets = () => {
  return smartDevicesMarkets;
};

