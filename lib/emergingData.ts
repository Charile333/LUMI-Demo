export interface EmergingMarket {
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

const emergingMarkets: EmergingMarket[] = [
  // 教育
  {
    id: 501,
    title: "北京2026年高考一本线是否超600分？",
    category: "教育",
    probability: 42.5,
    volume: "$3,456,789",
    participants: 2678,
    endDate: "Jun 25, 2026",
    trend: "down",
    change: "-6.8%",
    description: "此市场预测北京市2026年高考普通类本科一批录取控制分数线（理科或物理类）是否超过600分。",
    resolutionCriteria: [
      "数据来源：北京市教育考试院官方公告。",
      "分数线定义：2026年北京市高考普通类本科一批录取控制分数线（若实行新高考改革，以物理类或选考物理的分数线为准）。",
      "结算时间：2026年6月25日（或官方公布分数线后的第二个工作日）。",
      "若北京高考政策调整导致无一本线概念，以特殊类型招生控制线为准。"
    ],
    relatedMarkets: [
      "上海2026年高考本科线是否超400分？",
      "全国高考2026年报名人数是否超1300万？",
      "北京2026年高考报名人数是否超7万？"
    ]
  },
  {
    id: 502,
    title: "新东方2026年营收是否超300亿元？",
    category: "教育",
    probability: 56.8,
    volume: "$2,890,123",
    participants: 1987,
    endDate: "Apr 30, 2027",
    trend: "up",
    change: "+12.3%",
    description: "此市场预测新东方教育科技集团2026财年（2025年6月1日至2026年5月31日）的总营收是否超过300亿元人民币。",
    resolutionCriteria: [
      "数据来源：新东方官方财报（港交所或SEC公告）。",
      "营收定义：2026财年的总营收（以人民币计价，若以美元公布则按财报发布日汇率换算）。",
      "结算时间：2027年4月30日（或年报发布后5个工作日内）。"
    ],
    relatedMarkets: [
      "好未来2026年营收是否超新东方？",
      "中国K12教培市场2026年规模是否超5000亿？",
      "新东方东方甄选2026年GMV是否超300亿？"
    ]
  },

  // 健康
  {
    id: 503,
    title: "Keep用户数2026年是否突破3亿？",
    category: "健康",
    probability: 62.3,
    volume: "$4,567,890",
    participants: 3234,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+15.7%",
    description: "此市场预测运动健身App Keep的注册用户总数在2026年底是否能够突破3亿。",
    resolutionCriteria: [
      "数据来源：Keep官方公告、Keep母公司财报。",
      "用户数定义：截至2026年12月31日的累计注册用户总数。",
      "结算时间：2027年3月31日（或官方数据公布后5个工作日内）。",
      "若Keep未公布用户数，以权威第三方机构（如QuestMobile、易观）的估算为准。"
    ],
    relatedMarkets: [
      "Keep 2026年MAU是否超5000万？",
      "Keep 2026年会员数是否超1000万？",
      "中国健身市场2026年规模是否超2000亿？"
    ]
  },
  {
    id: 504,
    title: "中国2026年健身房数量是否超10万家？",
    category: "健康",
    probability: 48.6,
    volume: "$2,345,678",
    participants: 1678,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-4.2%",
    description: "此市场预测中国大陆地区2026年底的健身房（含健身工作室）总数量是否超过10万家。",
    resolutionCriteria: [
      "数据来源：三体云动、美团点评等行业数据平台，或国家体育总局相关统计。",
      "健身房定义：提供健身器械、团课等服务的商业健身场所（含连锁品牌和独立健身房）。",
      "结算时间：2027年2月28日（或权威数据公布后5个工作日内）。"
    ],
    relatedMarkets: [
      "Keep用户数2026年是否突破3亿？",
      "乐刻健身2026年门店数是否超3000家？",
      "中国健身人口渗透率2026年是否超5%？"
    ]
  },

  // 饮食
  {
    id: 505,
    title: "喜茶2026年销量是否超10亿杯？",
    category: "饮食",
    probability: 58.7,
    volume: "$5,678,901",
    participants: 3876,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+13.5%",
    description: "此市场预测喜茶品牌2026年全年的饮品销量是否能够突破10亿杯。",
    resolutionCriteria: [
      "数据来源：喜茶官方公告、喜茶年度报告。",
      "销量定义：2026年1月1日至12月31日期间，喜茶所有门店（含直营和加盟）的饮品总销量。",
      "结算时间：2027年2月28日（或官方数据公布后5个工作日内）。",
      "若喜茶未公布销量数据，以权威媒体报道或行业分析师估算为准。"
    ],
    relatedMarkets: [
      "瑞幸咖啡2026年门店数是否超2万家？",
      "蜜雪冰城2026年全球门店是否超5万家？",
      "中国新茶饮市场2026年规模是否超2000亿？"
    ]
  },
  {
    id: 506,
    title: "瑞幸咖啡2026年门店数是否超2万家？",
    category: "饮食",
    probability: 72.4,
    volume: "$4,890,123",
    participants: 3234,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+16.8%",
    description: "此市场预测瑞幸咖啡（Luckin Coffee）在中国大陆地区的门店总数在2026年底是否超过2万家。",
    resolutionCriteria: [
      "数据来源：瑞幸咖啡财报、官方公告。",
      "门店数定义：截至2026年12月31日的门店总数（含直营和加盟）。",
      "结算时间：2027年3月31日（或财报发布后5个工作日内）。"
    ],
    relatedMarkets: [
      "喜茶2026年销量是否超10亿杯？",
      "星巴克中国2026年门店数是否超7000家？",
      "瑞幸咖啡2026年营收是否超300亿元？"
    ]
  },
  {
    id: 507,
    title: "蜜雪冰城2026年全球门店是否超5万家？",
    category: "饮食",
    probability: 68.9,
    volume: "$3,567,890",
    participants: 2567,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+14.2%",
    description: "此市场预测蜜雪冰城品牌在全球范围内的门店总数在2026年底是否超过5万家。",
    resolutionCriteria: [
      "数据来源：蜜雪冰城官方公告、招股书或年报。",
      "门店数定义：截至2026年12月31日的全球门店总数（含中国大陆及海外）。",
      "结算时间：2027年2月28日（或官方数据公布后5个工作日内）。"
    ],
    relatedMarkets: [
      "喜茶2026年销量是否超10亿杯？",
      "蜜雪冰城2026年海外门店是否超5000家？",
      "蜜雪冰城是否在2026年完成IPO？"
    ]
  },

  // 旅游
  {
    id: 508,
    title: "2026年春节三亚游客量是否超120万人？",
    category: "旅游",
    probability: 54.3,
    volume: "$4,234,567",
    participants: 2890,
    endDate: "Feb 18, 2026",
    trend: "up",
    change: "+9.7%",
    description: "此市场预测2026年春节假期（大年初一至初七）期间，海南省三亚市的接待游客总量是否超过120万人次。",
    resolutionCriteria: [
      "数据来源：三亚市旅游和文化广电体育局官方数据、海南省统计局公告。",
      "游客量定义：2026年2月12日至2月18日（大年初一至初七）期间，三亚市接待的过夜游客和一日游游客总数。",
      "结算时间：2026年2月20日（或官方数据公布后3个工作日内）。"
    ],
    relatedMarkets: [
      "海南2026年春节旅游收入是否超200亿？",
      "三亚2026年全年游客量是否超3000万？",
      "2026年春节国内旅游人次是否超4亿？"
    ]
  },
  {
    id: 509,
    title: "携程2026年GMV是否超1.5万亿元？",
    category: "旅游",
    probability: 62.8,
    volume: "$5,123,456",
    participants: 3456,
    endDate: "Mar 31, 2027",
    trend: "up",
    change: "+12.6%",
    description: "此市场预测携程集团2026年全年的GMV（交易总额）是否超过1.5万亿元人民币。",
    resolutionCriteria: [
      "数据来源：携程集团财报（港交所或纳斯达克公告）。",
      "GMV定义：2026年全年通过携程平台预订的酒店、机票、火车票、门票等所有旅游产品的交易总额。",
      "结算时间：2027年3月31日（或年报发布后5个工作日内）。"
    ],
    relatedMarkets: [
      "飞猪2026年GMV是否超5000亿？",
      "美团酒旅2026年间夜量是否超10亿？",
      "中国在线旅游市场2026年规模是否超2万亿？"
    ]
  },

  // 出行
  {
    id: 510,
    title: "京沪高铁票价2026年是否上涨超10%？",
    category: "出行",
    probability: 38.5,
    volume: "$6,789,012",
    participants: 4567,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-7.3%",
    description: "此市场预测京沪高铁（北京南至上海虹桥）二等座票价在2026年相比2025年底是否上涨超过10%。",
    resolutionCriteria: [
      "数据来源：12306官网、中国国家铁路集团官方公告。",
      "票价定义：京沪高铁G字头列车（北京南-上海虹桥）二等座全价票价格。",
      "涨幅计算：(2026年12月31日票价 - 2025年12月31日票价) / 2025年12月31日票价 × 100%。",
      "结算时间：2027年1月5日。",
      "若票价实行浮动定价，以最常见的标准价格为准。"
    ],
    relatedMarkets: [
      "京沪高铁2026年客运量是否超2亿人次？",
      "中国高铁运营里程2026年是否超4.5万公里？",
      "京沪高铁2026年是否开通新线路？"
    ]
  },
  {
    id: 511,
    title: "滴滴出行2026年日均订单是否超5000万？",
    category: "出行",
    probability: 52.7,
    volume: "$4,567,890",
    participants: 3123,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+8.9%",
    description: "此市场预测滴滴出行平台2026年的日均订单量是否超过5000万单。",
    resolutionCriteria: [
      "数据来源：滴滴出行官方公告、财报数据。",
      "日均订单定义：2026年全年总订单量 / 365天。",
      "订单范围：包括快车、专车、顺风车、代驾等所有业务线。",
      "结算时间：2027年3月31日（或官方数据公布后5个工作日内）。"
    ],
    relatedMarkets: [
      "高德打车2026年市场份额是否超20%？",
      "T3出行2026年日均订单是否超1000万？",
      "中国网约车市场2026年规模是否超4000亿？"
    ]
  },

  // 生活方式
  {
    id: 512,
    title: "小红书2026年MAU是否突破3亿？",
    category: "生活方式",
    probability: 68.4,
    volume: "$5,890,123",
    participants: 3987,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+16.5%",
    description: "此市场预测小红书App的月活跃用户数（MAU）在2026年底是否能够突破3亿。",
    resolutionCriteria: [
      "数据来源：小红书官方公告、QuestMobile、易观等权威数据平台。",
      "MAU定义：2026年12月的小红书App月活跃用户数。",
      "结算时间：2027年2月28日（或官方数据公布后5个工作日内）。"
    ],
    relatedMarkets: [
      "小红书2026年电商GMV是否超1000亿？",
      "小红书2026年广告收入是否超200亿？",
      "小红书是否在2026年完成IPO？"
    ]
  },
  {
    id: 513,
    title: "泡泡玛特2026年营收是否超150亿元？",
    category: "生活方式",
    probability: 58.9,
    volume: "$3,456,789",
    participants: 2345,
    endDate: "Mar 31, 2027",
    trend: "up",
    change: "+12.8%",
    description: "此市场预测潮玩品牌泡泡玛特2026年全年营收是否超过150亿元人民币。",
    resolutionCriteria: [
      "数据来源：泡泡玛特财报（港交所公告）。",
      "营收定义：2026年1月1日至12月31日的总营收。",
      "结算时间：2027年3月31日（或年报发布后5个工作日内）。"
    ],
    relatedMarkets: [
      "泡泡玛特2026年海外营收占比是否超30%？",
      "泡泡玛特2026年门店数是否超500家？",
      "中国潮玩市场2026年规模是否超500亿？"
    ]
  },
  {
    id: 514,
    title: "露营经济2026年市场规模是否超500亿元？",
    category: "生活方式",
    probability: 64.7,
    volume: "$2,890,123",
    participants: 1987,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+14.3%",
    description: "此市场预测中国露营经济（含露营装备、露营地、露营服务等）2026年的市场规模是否超过500亿元人民币。",
    resolutionCriteria: [
      "数据来源：艾瑞咨询、易观、中国露营协会等权威机构的行业报告。",
      "市场规模定义：2026年露营相关产品和服务的总交易额（含装备销售、营地消费、露营活动等）。",
      "结算时间：2027年3月31日（或权威报告发布后5个工作日内）。"
    ],
    relatedMarkets: [
      "迪卡侬中国2026年营收是否超200亿？",
      "中国露营地数量2026年是否超2万个？",
      "户外运动市场2026年规模是否超3000亿？"
    ]
  },
  {
    id: 515,
    title: "盒马鲜生2026年门店数是否超500家？",
    category: "生活方式",
    probability: 56.3,
    volume: "$3,234,567",
    participants: 2234,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+10.5%",
    description: "此市场预测阿里巴巴旗下新零售品牌盒马鲜生在中国大陆地区的门店总数在2026年底是否超过500家。",
    resolutionCriteria: [
      "数据来源：盒马官方公告、阿里巴巴财报。",
      "门店数定义：截至2026年12月31日的盒马鲜生门店总数（含盒马鲜生、盒马X会员店等业态）。",
      "结算时间：2027年2月28日（或官方数据公布后5个工作日内）。"
    ],
    relatedMarkets: [
      "山姆会员店中国2026年门店是否超60家？",
      "永辉超市2026年门店数是否超1000家？",
      "中国新零售市场2026年规模是否超2万亿？"
    ]
  }
];

export const getAllEmergingMarkets = (): EmergingMarket[] => {
  return emergingMarkets;
};

export const getEmergingMarketById = (id: number): EmergingMarket | undefined => {
  return emergingMarkets.find(market => market.id === id);
};

