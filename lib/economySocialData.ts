export interface EconomySocialMarket {
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

const economySocialMarkets: EconomySocialMarket[] = [
  // 电商
  {
    id: 401,
    title: "天猫双十一2026年GMV是否突破6500亿元？",
    category: "电商",
    probability: 58.7,
    volume: "$7,890,123",
    participants: 4567,
    endDate: "Nov 12, 2026",
    trend: "up",
    change: "+12.4%",
    description: "此市场预测2026年天猫双十一购物节（11月1日至11月11日）的GMV（商品交易总额）是否能够突破6500亿元人民币。",
    resolutionCriteria: [
      "数据来源：阿里巴巴集团官方公告、天猫官方发布的双十一战报。",
      "GMV定义：2026年11月1日00:00至11月11日23:59期间，天猫平台的商品交易总额（含预售）。",
      "结算时间：2026年11月12日（或官方数据公布后3个工作日内）。",
      "若阿里巴巴调整双十一活动周期，以官方公布的活动周期为准。"
    ],
    relatedMarkets: [
      "京东双十一2026年GMV是否超4000亿？",
      "拼多多双十一2026年GMV是否超2000亿？",
      "2026年双十一全网GMV是否破万亿？"
    ]
  },
  {
    id: 402,
    title: "京东双十一2026年GMV是否超4000亿元？",
    category: "电商",
    probability: 52.3,
    volume: "$4,567,890",
    participants: 2987,
    endDate: "Nov 12, 2026",
    trend: "up",
    change: "+9.8%",
    description: "此市场预测京东2026年双十一购物节期间的GMV是否能够突破4000亿元人民币。",
    resolutionCriteria: [
      "数据来源：京东集团官方公告。",
      "GMV定义：京东官方公布的双十一活动期间（通常为11月1日至11日）的商品交易总额。",
      "结算时间：2026年11月12日（或官方数据公布后3个工作日内）。"
    ],
    relatedMarkets: [
      "天猫双十一2026年GMV是否突破6500亿元？",
      "京东2026年全年GMV是否超3万亿？",
      "京东物流2026年日均订单是否超5000万？"
    ]
  },

  // 出海平台
  {
    id: 403,
    title: "Shopee印尼2026年GMV是否超250亿美元？",
    category: "出海平台",
    probability: 64.5,
    volume: "$5,234,567",
    participants: 3456,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+14.6%",
    description: "此市场预测东南亚电商平台Shopee在印度尼西亚市场2026年全年的GMV是否能够突破250亿美元。",
    resolutionCriteria: [
      "数据来源：Shopee母公司Sea Limited财报、权威第三方市场调研机构（如Momentum Works、iPrice）报告。",
      "GMV定义：2026年1月1日至12月31日期间，Shopee印尼站的商品交易总额（美元计价）。",
      "结算时间：2027年3月31日（或官方财报发布后5个工作日内）。",
      "若无官方数据，以权威第三方机构的估算为准。"
    ],
    relatedMarkets: [
      "Shopee越南2026年GMV是否超150亿美元？",
      "TikTok Shop印尼2026年GMV是否超Shopee？",
      "Lazada印尼2026年市场份额是否超20%？"
    ]
  },
  {
    id: 404,
    title: "TikTok Shop东南亚2026年GMV是否超500亿美元？",
    category: "出海平台",
    probability: 71.2,
    volume: "$6,789,012",
    participants: 4123,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+18.3%",
    description: "此市场预测TikTok Shop在东南亚地区（包括印尼、泰国、越南、菲律宾、马来西亚、新加坡）2026年全年的GMV总和是否超过500亿美元。",
    resolutionCriteria: [
      "数据来源：字节跳动官方公告、权威第三方市场调研机构报告。",
      "GMV定义：2026年全年TikTok Shop在东南亚六国的商品交易总额（美元计价）。",
      "结算时间：2027年3月31日（或官方数据公布后5个工作日内）。",
      "若无官方数据，以多家权威机构的平均估算为准。"
    ],
    relatedMarkets: [
      "Shopee印尼2026年GMV是否超250亿美元？",
      "TikTok Shop印尼2026年GMV是否超Shopee？",
      "TikTok Shop 2026年全球GMV是否破千亿美元？"
    ]
  },

  // 房价
  {
    id: 405,
    title: "深圳2026年平均房价是否上涨超5%？",
    category: "房价",
    probability: 38.6,
    volume: "$8,456,789",
    participants: 5234,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-8.7%",
    description: "此市场预测深圳市2026年全年的平均房价相比2025年底是否上涨超过5%。",
    resolutionCriteria: [
      "数据来源：国家统计局、深圳市住建局官方数据、中国房价行情网等权威平台。",
      "平均房价定义：深圳市新建商品住宅的平均成交价格（元/平方米）。",
      "涨幅计算：(2026年12月均价 - 2025年12月均价) / 2025年12月均价 × 100%。",
      "结算时间：2027年1月31日（或官方数据公布后5个工作日内）。",
      "若官方数据存在差异，以国家统计局数据为准。"
    ],
    relatedMarkets: [
      "北京2026年平均房价是否上涨？",
      "上海2026年平均房价是否上涨超3%？",
      "深圳2026年二手房成交量是否超10万套？"
    ]
  },
  {
    id: 406,
    title: "北京2026年平均房价是否下跌？",
    category: "房价",
    probability: 42.8,
    volume: "$6,234,567",
    participants: 3987,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+6.5%",
    description: "此市场预测北京市2026年全年的平均房价相比2025年底是否出现下跌（跌幅大于0%）。",
    resolutionCriteria: [
      "数据来源：国家统计局、北京市住建委官方数据。",
      "平均房价定义：北京市新建商品住宅的平均成交价格。",
      "下跌定义：2026年12月均价低于2025年12月均价。",
      "结算时间：2027年1月31日（或官方数据公布后5个工作日内）。"
    ],
    relatedMarkets: [
      "深圳2026年平均房价是否上涨超5%？",
      "北京2026年二手房成交量是否超15万套？",
      "北京2026年新房供应是否超8万套？"
    ]
  },

  // 汇率
  {
    id: 407,
    title: "人民币兑美元汇率2026年是否跌破7.3？",
    category: "汇率",
    probability: 48.3,
    volume: "$9,123,456",
    participants: 6789,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-5.2%",
    description: "此市场预测人民币兑美元汇率在2026年内是否会跌破7.3（即1美元兑换超过7.3元人民币）。",
    resolutionCriteria: [
      "数据来源：中国外汇交易中心（CFETS）官方数据、中国人民银行公布的人民币中间价。",
      "汇率定义：在岸人民币兑美元即期汇率（USD/CNY）。",
      "跌破定义：2026年任何一个交易日的收盘价或中间价超过7.3000。",
      "结算时间：2027年1月5日（或首次跌破后的第二个工作日）。",
      "若2026年内未跌破7.3，市场解析为'否'。"
    ],
    relatedMarkets: [
      "人民币兑美元汇率2026年底是否低于7.0？",
      "美元指数2026年是否突破110？",
      "人民币兑欧元汇率2026年是否升值？"
    ]
  },
  {
    id: 408,
    title: "人民币兑美元汇率2026年底是否低于7.0？",
    category: "汇率",
    probability: 32.5,
    volume: "$5,678,901",
    participants: 3876,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+8.9%",
    description: "此市场预测人民币兑美元汇率在2026年12月31日是否低于7.0（即1美元兑换少于7.0元人民币，人民币升值）。",
    resolutionCriteria: [
      "数据来源：中国外汇交易中心官方数据。",
      "汇率定义：2026年12月31日的人民币兑美元中间价。",
      "低于7.0定义：中间价小于7.0000。",
      "结算时间：2027年1月2日。"
    ],
    relatedMarkets: [
      "人民币兑美元汇率2026年是否跌破7.3？",
      "中国外汇储备2026年底是否超3.2万亿美元？",
      "美联储2026年是否降息？"
    ]
  },

  // 短视频
  {
    id: 409,
    title: "抖音全球月活用户2026年是否突破30亿？",
    category: "短视频",
    probability: 56.8,
    volume: "$4,890,123",
    participants: 3234,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+13.7%",
    description: "此市场预测抖音（含海外版TikTok）的全球月活跃用户数（MAU）在2026年底是否能够突破30亿。",
    resolutionCriteria: [
      "数据来源：字节跳动官方公告、Sensor Tower、data.ai等权威第三方数据平台。",
      "MAU定义：2026年12月的全球月活跃用户数（抖音+TikTok合计）。",
      "结算时间：2027年2月28日（或官方数据公布后5个工作日内）。",
      "若无官方数据，以多家权威第三方机构的平均估算为准。"
    ],
    relatedMarkets: [
      "快手2026年MAU是否超6亿？",
      "YouTube Shorts 2026年MAU是否超20亿？",
      "抖音2026年全球日均使用时长是否超100分钟？"
    ]
  },
  {
    id: 410,
    title: "快手2026年MAU是否超6亿？",
    category: "短视频",
    probability: 48.2,
    volume: "$2,567,890",
    participants: 1987,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-4.3%",
    description: "此市场预测快手App的月活跃用户数在2026年底是否能够突破6亿。",
    resolutionCriteria: [
      "数据来源：快手科技财报、QuestMobile等权威数据平台。",
      "MAU定义：2026年12月的快手App月活跃用户数（仅中国大陆）。",
      "结算时间：2027年3月31日（或财报发布后5个工作日内）。"
    ],
    relatedMarkets: [
      "抖音全球月活用户2026年是否突破30亿？",
      "快手2026年电商GMV是否超1.5万亿？",
      "快手2026年日均使用时长是否超120分钟？"
    ]
  },

  // 其他经济指标
  {
    id: 411,
    title: "中国GDP 2026年增速是否超5%？",
    category: "宏观经济",
    probability: 68.5,
    volume: "$12,345,678",
    participants: 7890,
    endDate: "Jan 20, 2027",
    trend: "up",
    change: "+7.8%",
    description: "此市场预测中国2026年全年GDP（国内生产总值）实际增速是否超过5%。",
    resolutionCriteria: [
      "数据来源：国家统计局官方公布的2026年GDP数据。",
      "增速定义：2026年GDP实际增长率（扣除价格因素）。",
      "结算时间：2027年1月20日（或国家统计局公布年度数据后3个工作日内）。",
      "若数据后续修正，以首次公布的数据为准。"
    ],
    relatedMarkets: [
      "中国2026年CPI涨幅是否超2%？",
      "中国2026年社会消费品零售总额是否超50万亿？",
      "中国2026年进出口总额是否超40万亿？"
    ]
  },
  {
    id: 412,
    title: "中国2026年新能源汽车渗透率是否超40%？",
    category: "产业趋势",
    probability: 72.3,
    volume: "$5,456,789",
    participants: 3567,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+15.2%",
    description: "此市场预测中国2026年新能源汽车（含纯电动和插电混动）在乘用车市场的渗透率是否超过40%。",
    resolutionCriteria: [
      "数据来源：中国汽车工业协会（CAAM）、乘联会（CPCA）官方数据。",
      "渗透率定义：2026年全年新能源乘用车销量 / 乘用车总销量 × 100%。",
      "结算时间：2027年1月15日（或官方数据公布后5个工作日内）。"
    ],
    relatedMarkets: [
      "比亚迪2026年销量是否超400万辆？",
      "特斯拉中国2026年销量是否超100万辆？",
      "中国2026年新能源汽车出口是否超200万辆？"
    ]
  },
  {
    id: 413,
    title: "美团2026年日均订单是否超1亿单？",
    category: "本地生活",
    probability: 54.7,
    volume: "$3,789,012",
    participants: 2456,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+10.5%",
    description: "此市场预测美团平台2026年的日均订单量是否能够突破1亿单。",
    resolutionCriteria: [
      "数据来源：美团财报、美团官方公告。",
      "日均订单定义：2026年全年总订单量 / 365天。",
      "结算时间：2027年3月31日（或年报发布后5个工作日内）。",
      "订单包含外卖、到店、酒旅等所有业务线。"
    ],
    relatedMarkets: [
      "饿了么2026年市场份额是否超30%？",
      "美团2026年营收是否超3000亿元？",
      "美团外卖2026年日均订单是否超6000万？"
    ]
  },
  {
    id: 414,
    title: "中国2026年出生人口是否低于800万？",
    category: "人口趋势",
    probability: 62.8,
    volume: "$4,567,890",
    participants: 3123,
    endDate: "Feb 28, 2027",
    trend: "up",
    change: "+9.3%",
    description: "此市场预测中国2026年的出生人口数量是否低于800万人。",
    resolutionCriteria: [
      "数据来源：国家统计局官方公布的2026年人口数据。",
      "出生人口定义：2026年1月1日至12月31日期间的新生儿数量。",
      "结算时间：2027年2月28日（或国家统计局公布数据后5个工作日内）。"
    ],
    relatedMarkets: [
      "中国2026年结婚登记数是否低于600万对？",
      "中国2026年人口总数是否低于14亿？",
      "中国2026年65岁以上人口占比是否超15%？"
    ]
  }
];

export const getAllEconomySocialMarkets = (): EconomySocialMarket[] => {
  return economySocialMarkets;
};

export const getEconomySocialMarketById = (id: number): EconomySocialMarket | undefined => {
  return economySocialMarkets.find(market => market.id === id);
};

