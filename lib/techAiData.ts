export interface TechAiMarket {
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

const techAiMarkets: TechAiMarket[] = [
  // 大模型竞争
  {
    id: 101,
    title: "百度文心大模型2026中文评测是否超越GPT？",
    category: "大模型竞争",
    probability: 58.3,
    volume: "$5,234,567",
    participants: 2134,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+12.4%",
    description: "此市场预测百度文心大模型在2026年的中文语言能力评测中是否能够超越OpenAI的GPT系列模型。结算将依据权威第三方评测机构的综合评分。",
    resolutionCriteria: [
      "数据来源：SuperCLUE、CLUE等权威中文NLP评测榜单，或国际认可的第三方AI评测机构（如Stanford HELM、LMSYS Chatbot Arena中文榜）。",
      "评测维度：综合考虑语言理解、生成质量、逻辑推理、知识问答、多轮对话等多项指标的平均得分。",
      "结算时间：2027年1月15日（或官方评测结果公布后5个工作日内）。",
      "若无明确官方评测，市场将根据多家权威科技媒体和AI研究机构的共识进行结算。"
    ],
    relatedMarkets: [
      "ChatGPT-5是否在2026年发布？",
      "阿里通义千问2026年市场份额是否超20%？",
      "国产大模型2026年总投资是否超1000亿元？"
    ]
  },
  {
    id: 102,
    title: "ChatGPT-5是否在2026年正式发布？",
    category: "大模型竞争",
    probability: 73.8,
    volume: "$8,456,789",
    participants: 3245,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+15.2%",
    description: "此市场预测OpenAI是否会在2026年内正式发布并向公众开放ChatGPT-5（或GPT-5）模型。",
    resolutionCriteria: [
      "数据来源：OpenAI官方公告、产品发布会或官方博客。",
      "发布定义：模型需正式命名为GPT-5或ChatGPT-5，并向付费用户或公众开放使用（不包括内测版本）。",
      "结算时间：2027年1月10日。",
      "若OpenAI发布的新模型未明确命名为GPT-5但官方确认为GPT-4的下一代主力模型，也视为满足条件。"
    ],
    relatedMarkets: [
      "百度文心大模型2026中文评测是否超越GPT？",
      "Google Gemini 2.0是否在2026年发布？",
      "OpenAI 2026年估值是否超1500亿美元？"
    ]
  },
  {
    id: 103,
    title: "阿里通义千问2026年国内市场份额是否超20%？",
    category: "大模型竞争",
    probability: 45.6,
    volume: "$3,678,901",
    participants: 1567,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-3.8%",
    description: "此市场预测阿里云通义千问大模型在2026年中国大模型市场的份额是否能够超过20%。",
    resolutionCriteria: [
      "数据来源：IDC、艾瑞咨询、Gartner等权威市场调研机构发布的中国大模型市场份额报告。",
      "市场份额计算：基于API调用量、付费用户数或营收规模的综合市场份额。",
      "结算时间：2027年3月31日（或权威报告发布后5个工作日内）。",
      "若无明确官方数据，市场将根据多数行业分析师和媒体报道的共识进行结算。"
    ],
    relatedMarkets: [
      "百度文心大模型2026市场份额是否第一？",
      "腾讯混元大模型2026年用户数是否破亿？",
      "中国大模型市场2026年规模是否超500亿元？"
    ]
  },

  // 芯片产业
  {
    id: 104,
    title: "华为自研7nm芯片是否在2026实现量产？",
    category: "芯片产业",
    probability: 62.7,
    volume: "$6,789,234",
    participants: 2876,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+18.3%",
    description: "此市场预测华为是否能在2026年实现7nm制程自研芯片的规模化量产（月产能超过10万片晶圆）。",
    resolutionCriteria: [
      "数据来源：华为官方公告、中芯国际或其他代工厂官方声明、权威半导体行业分析机构（如TrendForce、IC Insights）报告。",
      "量产定义：月产能达到10万片12英寸晶圆当量，且芯片已应用于华为正式发售的消费级或企业级产品中。",
      "制程标准：芯片制程需达到7nm或更先进工艺（如5nm、3nm）。",
      "结算时间：2027年2月28日（或官方数据公布后5个工作日内）。"
    ],
    relatedMarkets: [
      "中芯国际2026年7nm产能是否超50万片/月？",
      "华为Mate 80系列是否搭载自研7nm芯片？",
      "国产光刻机2026年是否突破28nm制程？"
    ]
  },
  {
    id: 105,
    title: "中芯国际2026年营收是否突破100亿美元？",
    category: "芯片产业",
    probability: 55.2,
    volume: "$4,567,890",
    participants: 1987,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+9.7%",
    description: "此市场预测中芯国际（SMIC）在2026财年的总营收是否能够突破100亿美元大关。",
    resolutionCriteria: [
      "数据来源：中芯国际官方财报、港交所或上交所公告。",
      "营收计算：以2026财年（2026年1月1日至12月31日）的总营收为准。",
      "结算时间：2027年4月30日（或年报发布后3个工作日内）。",
      "若中芯国际调整财年周期，则以覆盖2026年度的完整财年数据为准。"
    ],
    relatedMarkets: [
      "华为自研7nm芯片是否在2026实现量产？",
      "台积电2026年营收是否超800亿美元？",
      "国产半导体设备2026年自给率是否超30%？"
    ]
  },
  {
    id: 106,
    title: "国产光刻机2026年是否突破28nm制程？",
    category: "芯片产业",
    probability: 38.9,
    volume: "$2,345,678",
    participants: 1234,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-5.4%",
    description: "此市场预测中国国产光刻机（如上海微电子SMEE）是否能在2026年实现28nm或更先进制程的商业化量产能力。",
    resolutionCriteria: [
      "数据来源：上海微电子等国产光刻机厂商官方公告、工信部或科技部官方声明、权威半导体行业媒体报道。",
      "突破定义：光刻机需实现28nm或更先进制程的稳定量产能力，并已交付给至少一家晶圆厂进行商业化生产。",
      "结算时间：2027年2月28日（或官方确认后5个工作日内）。",
      "若仅完成技术验证但未实现商业化交付，则不满足条件。"
    ],
    relatedMarkets: [
      "华为自研7nm芯片是否在2026实现量产？",
      "ASML 2026年对华光刻机出口是否解禁？",
      "中国半导体设备国产化率2026年是否超25%？"
    ]
  },

  // AI手机趋势
  {
    id: 107,
    title: "2026年AI手机全球出货量是否超2亿台？",
    category: "AI手机趋势",
    probability: 68.4,
    volume: "$5,678,901",
    participants: 2456,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+14.6%",
    description: "此市场预测2026年全球搭载端侧AI能力（如AI芯片、大模型本地运行）的智能手机出货量是否能够突破2亿台。",
    resolutionCriteria: [
      "数据来源：IDC、Counterpoint Research、Canalys等权威市场调研机构的年度报告。",
      "AI手机定义：搭载专用AI芯片（如NPU）且支持端侧大模型推理、AI图像处理、AI语音助手等功能的智能手机。",
      "结算时间：2027年3月31日（或官方报告发布后5个工作日内）。",
      "若多家机构数据存在差异，以IDC数据为准。"
    ],
    relatedMarkets: [
      "小米15 Ultra首月销量是否超120万台？",
      "iPhone 17是否全系搭载端侧AI功能？",
      "高通骁龙8 Gen 4 AI性能是否提升100%？"
    ]
  },
  {
    id: 108,
    title: "iPhone 17是否全系搭载端侧AI大模型？",
    category: "AI手机趋势",
    probability: 81.2,
    volume: "$7,890,123",
    participants: 3567,
    endDate: "Sep 30, 2026",
    trend: "up",
    change: "+11.8%",
    description: "此市场预测苹果在2026年发布的iPhone 17系列是否会全系标配端侧AI大模型能力（支持本地运行大语言模型）。",
    resolutionCriteria: [
      "数据来源：苹果官方发布会、产品页面或官方技术白皮书。",
      "端侧AI定义：iPhone 17全系机型均支持在设备本地运行大语言模型（如Apple Intelligence升级版），无需依赖云端服务器进行核心AI推理。",
      "结算时间：iPhone 17正式发布后3个工作日内。",
      "若仅部分机型（如Pro系列）支持，则不满足条件。"
    ],
    relatedMarkets: [
      "2026年AI手机全球出货量是否超2亿台？",
      "苹果A18芯片AI性能是否超骁龙8 Gen 4？",
      "iPhone 17在中国市场2026年销量是否超5000万台？"
    ]
  },
  {
    id: 109,
    title: "高通骁龙8 Gen 4 AI性能是否提升100%？",
    category: "AI手机趋势",
    probability: 52.7,
    volume: "$3,456,789",
    participants: 1678,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+7.3%",
    description: "此市场预测高通骁龙8 Gen 4相比前代（骁龙8 Gen 3）的AI性能（NPU算力）提升幅度是否达到或超过100%。",
    resolutionCriteria: [
      "数据来源：高通官方发布会数据、AnandTech、Tom's Hardware等权威科技媒体的实测数据。",
      "AI性能定义：以NPU（神经网络处理单元）的TOPS（每秒万亿次运算）算力为准。",
      "提升计算：(骁龙8 Gen 4 NPU算力 - 骁龙8 Gen 3 NPU算力) / 骁龙8 Gen 3 NPU算力 ≥ 100%。",
      "结算时间：骁龙8 Gen 4正式发布并有权威第三方实测数据后5个工作日内。"
    ],
    relatedMarkets: [
      "2026年AI手机全球出货量是否超2亿台？",
      "联发科天玑9400 AI性能是否超骁龙8 Gen 4？",
      "小米15系列是否首发骁龙8 Gen 4？"
    ]
  },

  // A股板块表现
  {
    id: 110,
    title: "科创50指数2026年涨幅是否超20%？",
    category: "A股板块表现",
    probability: 48.3,
    volume: "$4,567,890",
    participants: 2134,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-6.2%",
    description: "此市场预测科创50指数在2026年全年的涨幅是否能够超过20%（以2025年12月31日收盘价为基准）。",
    resolutionCriteria: [
      "数据来源：上海证券交易所官方数据、Wind资讯、同花顺等权威金融数据平台。",
      "涨幅计算：(2026年12月31日收盘点位 - 2025年12月31日收盘点位) / 2025年12月31日收盘点位 × 100%。",
      "结算时间：2027年1月5日（2026年最后一个交易日收盘后）。",
      "若遇到指数调整或停牌，以实际最后交易日收盘价为准。"
    ],
    relatedMarkets: [
      "创业板指2026年涨幅是否超科创50？",
      "中证人工智能主题指数2026年涨幅是否超30%？",
      "科创板2026年IPO数量是否超200家？"
    ]
  },
  {
    id: 111,
    title: "中证人工智能主题指数2026年涨幅是否超30%？",
    category: "A股板块表现",
    probability: 42.6,
    volume: "$3,234,567",
    participants: 1567,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+8.9%",
    description: "此市场预测中证人工智能主题指数（931071）在2026年全年的涨幅是否能够超过30%。",
    resolutionCriteria: [
      "数据来源：中证指数公司官方数据、Wind资讯等权威金融数据平台。",
      "涨幅计算：(2026年12月31日收盘点位 - 2025年12月31日收盘点位) / 2025年12月31日收盘点位 × 100%。",
      "结算时间：2027年1月5日（2026年最后一个交易日收盘后）。",
      "若指数成分股调整，以调整后的连续数据为准。"
    ],
    relatedMarkets: [
      "科创50指数2026年涨幅是否超20%？",
      "ChatGPT-5是否在2026年正式发布？",
      "百度文心大模型2026中文评测是否超越GPT？"
    ]
  },
  {
    id: 112,
    title: "半导体ETF（512480）2026年涨幅是否超25%？",
    category: "A股板块表现",
    probability: 51.8,
    volume: "$5,123,456",
    participants: 2345,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+10.4%",
    description: "此市场预测国内规模最大的半导体ETF（512480）在2026年全年的涨幅是否能够超过25%。",
    resolutionCriteria: [
      "数据来源：上海证券交易所官方数据、基金公司官网、Wind资讯等权威平台。",
      "涨幅计算：(2026年12月31日收盘净值 - 2025年12月31日收盘净值) / 2025年12月31日收盘净值 × 100%。",
      "结算时间：2027年1月5日（2026年最后一个交易日收盘后）。",
      "若ETF发生份额拆分或合并，以复权后的连续数据为准。"
    ],
    relatedMarkets: [
      "华为自研7nm芯片是否在2026实现量产？",
      "中芯国际2026年营收是否突破100亿美元？",
      "科创50指数2026年涨幅是否超20%？"
    ]
  },

  // 政策与投资
  {
    id: 113,
    title: "中国2026年AI产业政策补贴是否超1000亿元？",
    category: "政策与投资",
    probability: 56.4,
    volume: "$2,890,123",
    participants: 1234,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+13.7%",
    description: "此市场预测中国各级政府在2026年针对AI产业（大模型、AI芯片、AI应用等）的直接财政补贴总额是否超过1000亿元人民币。",
    resolutionCriteria: [
      "数据来源：工信部、科技部、各地方政府官方公告、权威财经媒体统计报道。",
      "补贴范围：包括研发补贴、税收优惠、产业基金、人才引进补贴等直接财政支持。",
      "结算时间：2027年3月31日（或权威统计数据发布后5个工作日内）。",
      "若无官方统计，以多家权威媒体和研究机构的共识数据为准。"
    ],
    relatedMarkets: [
      "百度文心大模型2026中文评测是否超越GPT？",
      "科创50指数2026年涨幅是否超20%？",
      "中国大模型企业2026年融资总额是否超500亿元？"
    ]
  },
  {
    id: 114,
    title: "OpenAI 2026年估值是否超1500亿美元？",
    category: "政策与投资",
    probability: 64.7,
    volume: "$6,789,012",
    participants: 2987,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+16.3%",
    description: "此市场预测OpenAI在2026年内完成的任何一轮融资或估值评估中，公司估值是否达到或超过1500亿美元。",
    resolutionCriteria: [
      "数据来源：OpenAI官方公告、领投方（如微软、红杉资本等）官方声明、Bloomberg、WSJ等权威财经媒体报道。",
      "估值定义：以2026年内任何一轮融资的投后估值（Post-money Valuation）为准。",
      "结算时间：2027年1月15日（或最新融资消息确认后3个工作日内）。",
      "若2026年内OpenAI未进行融资，以权威媒体报道的最新估值为准。"
    ],
    relatedMarkets: [
      "ChatGPT-5是否在2026年正式发布？",
      "微软2026年在AI领域投资是否超200亿美元？",
      "Anthropic（Claude）2026年估值是否超500亿美元？"
    ]
  },
  {
    id: 115,
    title: "中国大模型企业2026年融资总额是否超500亿元？",
    category: "政策与投资",
    probability: 59.2,
    volume: "$4,123,456",
    participants: 1876,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+11.5%",
    description: "此市场预测中国大模型相关企业（如百度、阿里、腾讯、智谱AI、月之暗面等）在2026年获得的融资总额是否超过500亿元人民币。",
    resolutionCriteria: [
      "数据来源：企业官方公告、36氪、IT桔子、投中网等权威创投数据平台。",
      "融资范围：包括股权融资、战略投资、并购交易等，不包括债权融资和政府补贴。",
      "结算时间：2027年2月28日（或年度融资统计报告发布后5个工作日内）。",
      "若企业未披露具体融资金额，以权威创投平台估算的金额为准。"
    ],
    relatedMarkets: [
      "百度文心大模型2026中文评测是否超越GPT？",
      "阿里通义千问2026年国内市场份额是否超20%？",
      "中国2026年AI产业政策补贴是否超1000亿元？"
    ]
  }
];

export const getAllTechAiMarkets = (): TechAiMarket[] => {
  return techAiMarkets;
};

export const getTechAiMarketById = (id: number): TechAiMarket | undefined => {
  return techAiMarkets.find(market => market.id === id);
};

