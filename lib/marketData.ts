// 汽车与新能源赛道市场数据
export const automotiveMarkets = [
  // 品牌月度销量
  {
    id: 1,
    title: "比亚迪宋PLUS 2026年1月销量是否超过6万辆？",
    category: "品牌月度销量",
    probability: 72.3,
    volume: "$3,247,892",
    participants: 1456,
    endDate: "Feb 1, 2026",
    trend: "up",
    change: "+8.7%",
    description: "比亚迪宋PLUS作为比亚迪SUV阵营的主力车型，在2025年全年销量表现强劲。此市场预测其在2026年1月的月度销量是否能突破6万辆大关。",
    resolutionCriteria: [
      "基于比亚迪官方公布的月度销量数据",
      "统计时间为2026年1月1日至1月31日",
      "以终端销量（上险数）为准，不包括批发数据"
    ],
    relatedMarkets: [
      "比亚迪2026年Q1总销量",
      "宋PLUS DM-i vs EV版本销量占比",
      "比亚迪SUV阵营市场份额",
      "新能源SUV市场前三名"
    ]
  },
  {
    id: 2,
    title: "特斯拉Model Y 2026年1月全球销量是否超过8万辆？",
    category: "品牌月度销量",
    probability: 68.9,
    volume: "$2,134,567",
    participants: 923,
    endDate: "Feb 1, 2026",
    trend: "up",
    change: "+5.2%",
    description: "特斯拉Model Y作为全球最畅销的纯电动SUV，其销量走势一直备受关注。此市场预测Model Y在2026年1月的全球销量能否达到8万辆。",
    resolutionCriteria: [
      "基于特斯拉官方公布的全球交付数据",
      "统计时间为2026年1月1日至1月31日",
      "包含所有版本和所有市场的总销量"
    ],
    relatedMarkets: [
      "特斯拉2026年Q1全球交付量",
      "Model Y vs Model 3销量对比",
      "特斯拉中国市场份额",
      "纯电SUV市场排名"
    ]
  },
  {
    id: 3,
    title: "理想L9 2026年1月销量是否超过1.5万辆？",
    category: "品牌月度销量",
    probability: 45.6,
    volume: "$1,456,789",
    participants: 634,
    endDate: "Feb 1, 2026",
    trend: "down",
    change: "-2.3%",
    description: "理想L9作为理想汽车的旗舰SUV车型，定位高端市场。此市场预测其在2026年1月能否维持月销1.5万辆以上的表现。",
    resolutionCriteria: [
      "基于理想汽车官方公布的月度交付数据",
      "统计时间为2026年1月1日至1月31日",
      "以实际交付数量为准"
    ],
    relatedMarkets: [
      "理想汽车2026年Q1总交付量",
      "理想L系列vs MEGA销量占比",
      "30万以上新能源SUV市场",
      "增程式电动车市场份额"
    ]
  },
  
  // 新车型表现
  {
    id: 4,
    title: "小米SU7在2026年首季度销量是否超过10万辆？",
    category: "新车型表现",
    probability: 58.7,
    volume: "$4,567,890",
    participants: 2345,
    endDate: "Mar 31, 2026",
    trend: "up",
    change: "+12.6%",
    description: "小米SU7作为小米汽车的首款车型，市场关注度极高。此市场预测其在2026年第一季度（1-3月）的累计销量能否突破10万辆。",
    resolutionCriteria: [
      "基于小米汽车官方公布的季度交付数据",
      "统计时间为2026年1月1日至3月31日",
      "包含所有配置版本的总销量"
    ],
    relatedMarkets: [
      "小米SU7年度销量预测",
      "造车新势力季度销量排名",
      "20-30万纯电轿车市场",
      "小米汽车市值预测"
    ]
  },
  {
    id: 5,
    title: "华为问界M9 2026年Q1销量是否超过5万辆？",
    category: "新车型表现",
    probability: 63.4,
    volume: "$2,876,432",
    participants: 1234,
    endDate: "Mar 31, 2026",
    trend: "up",
    change: "+9.1%",
    description: "华为问界M9作为华为与赛力斯合作的旗舰SUV，搭载鸿蒙座舱系统。此市场预测其2026年Q1季度销量能否达到5万辆。",
    resolutionCriteria: [
      "基于AITO官方公布的季度销量数据",
      "统计时间为2026年1月1日至3月31日",
      "包含增程版和纯电版所有车型"
    ],
    relatedMarkets: [
      "问界品牌2026年总销量",
      "华为汽车生态市场份额",
      "40万以上豪华SUV市场",
      "鸿蒙座舱搭载车型销量"
    ]
  },
  {
    id: 6,
    title: "蔚来ET9 2026年首季度交付量是否超过3万辆？",
    category: "新车型表现",
    probability: 41.2,
    volume: "$1,678,234",
    participants: 789,
    endDate: "Mar 31, 2026",
    trend: "down",
    change: "-3.7%",
    description: "蔚来ET9作为蔚来汽车的全新旗舰轿车，定位高端豪华市场。此市场预测其在2026年第一季度的交付量能否达到3万辆。",
    resolutionCriteria: [
      "基于蔚来汽车官方公布的月度交付数据累计",
      "统计时间为2026年1月1日至3月31日",
      "以实际交付用户的数量为准"
    ],
    relatedMarkets: [
      "蔚来2026年总交付量",
      "蔚来NT3.0平台车型占比",
      "50万以上豪华电动车市场",
      "蔚来换电站覆盖数量"
    ]
  },
  
  // 市场份额
  {
    id: 7,
    title: "中国新能源车销量占比是否在2026Q1超65%？",
    category: "市场份额",
    probability: 78.9,
    volume: "$5,234,567",
    participants: 2567,
    endDate: "Mar 31, 2026",
    trend: "up",
    change: "+15.8%",
    description: "中国新能源汽车市场渗透率持续提升。此市场预测2026年第一季度新能源车（纯电+插混）在乘用车市场的销量占比能否超过65%。",
    resolutionCriteria: [
      "基于中汽协公布的季度销量数据",
      "统计时间为2026年1月1日至3月31日",
      "新能源车包括纯电动和插电式混合动力车型",
      "占比计算基于乘用车总销量"
    ],
    relatedMarkets: [
      "2026年全年新能源车渗透率",
      "纯电vs插混市场份额对比",
      "一线城市新能源车占比",
      "新能源车出口占比"
    ]
  },
  {
    id: 8,
    title: "比亚迪全球新能源车市场份额是否在2026年超20%？",
    category: "市场份额",
    probability: 67.3,
    volume: "$3,456,789",
    participants: 1876,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+7.4%",
    description: "比亚迪作为全球最大的新能源汽车制造商，市场份额持续扩大。此市场预测其2026年在全球新能源车市场的份额能否突破20%。",
    resolutionCriteria: [
      "基于各大市场研究机构的年度销量统计",
      "统计时间为2026年全年",
      "市场份额计算基于全球新能源车总销量",
      "包括比亚迪所有新能源车型（纯电+DM混动）"
    ],
    relatedMarkets: [
      "比亚迪2026年全球销量",
      "比亚迪vs特斯拉销量对比",
      "比亚迪海外市场占比",
      "比亚迪王朝vs海洋系列销量"
    ]
  },
  {
    id: 9,
    title: "特斯拉在中国市场份额是否在2026年低于10%？",
    category: "市场份额",
    probability: 52.1,
    volume: "$2,134,567",
    participants: 987,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-4.2%",
    description: "特斯拉在中国新能源车市场面临激烈竞争。此市场预测其2026年在中国新能源车市场的份额是否会下降到10%以下。",
    resolutionCriteria: [
      "基于中汽协和特斯拉官方数据",
      "统计时间为2026年全年",
      "市场份额计算基于中国新能源乘用车总销量",
      "包括特斯拉在华销售的所有车型"
    ],
    relatedMarkets: [
      "特斯拉中国2026年销量",
      "特斯拉vs比亚迪中国市场",
      "造车新势力总体市场份额",
      "进口vs国产新能源车占比"
    ]
  },
  
  // 区域出口
  {
    id: 10,
    title: "吉利在泰国2026年销量是否超10万辆？",
    category: "区域出口",
    probability: 71.8,
    volume: "$2,876,543",
    participants: 1123,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+11.3%",
    description: "吉利汽车在泰国市场布局完善，包括本地化生产。此市场预测吉利2026年在泰国的年度销量能否突破10万辆大关。",
    resolutionCriteria: [
      "基于泰国汽车协会公布的年度销量数据",
      "统计时间为2026年全年",
      "包括吉利品牌所有在泰销售车型",
      "包含本地生产和进口车型"
    ],
    relatedMarkets: [
      "吉利2026年海外总销量",
      "中国品牌东南亚市场份额",
      "吉利vs长城泰国市场",
      "泰国新能源车市场规模"
    ]
  },
  {
    id: 11,
    title: "比亚迪在欧洲2026年销量是否超15万辆？",
    category: "区域出口",
    probability: 64.5,
    volume: "$3,567,890",
    participants: 1456,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+8.9%",
    description: "比亚迪积极拓展欧洲市场，在多个国家建立销售网络。此市场预测比亚迪2026年在欧洲市场的年度销量能否达到15万辆。",
    resolutionCriteria: [
      "基于欧洲各国汽车协会统计数据",
      "统计时间为2026年全年",
      "包括比亚迪在欧洲所有国家的销量总和",
      "统计车型包括ATTO 3、海豹、汉等所有在售车型"
    ],
    relatedMarkets: [
      "比亚迪欧洲市场份额",
      "中国品牌欧洲总销量",
      "比亚迪vs特斯拉欧洲市场",
      "欧盟对中国电动车关税影响"
    ]
  },
  {
    id: 12,
    title: "长城汽车在俄罗斯2026年销量是否超5万辆？",
    category: "区域出口",
    probability: 38.7,
    volume: "$1,234,567",
    participants: 567,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-6.1%",
    description: "长城汽车在俄罗斯市场表现稳定，哈弗品牌认知度较高。此市场预测长城2026年在俄罗斯的年度销量能否达到5万辆。",
    resolutionCriteria: [
      "基于俄罗斯汽车市场协会公布数据",
      "统计时间为2026年全年",
      "包括长城旗下所有品牌（哈弗、魏牌、坦克等）",
      "包含本地组装和整车进口"
    ],
    relatedMarkets: [
      "长城汽车海外总销量",
      "中国品牌俄罗斯市场份额",
      "哈弗vs奇瑞俄罗斯市场",
      "俄罗斯汽车市场总规模"
    ]
  },
  
  // 燃油车vs新能源
  {
    id: 13,
    title: "2026年中国燃油车销量是否低于400万辆？",
    category: "燃油车vs新能源",
    probability: 82.4,
    volume: "$4,876,543",
    participants: 2234,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+18.7%",
    description: "随着新能源车渗透率快速提升，纯燃油车市场持续萎缩。此市场预测2026年中国纯燃油乘用车的年度销量是否会下降到400万辆以下。",
    resolutionCriteria: [
      "基于中汽协公布的年度销量数据",
      "统计时间为2026年全年",
      "仅统计纯燃油车，不包括插电混动和增程式",
      "统计范围为乘用车市场"
    ],
    relatedMarkets: [
      "2026年新能源车渗透率",
      "燃油车品牌退市数量",
      "混动车型市场份额",
      "传统车企新能源转型进度"
    ]
  },
  {
    id: 14,
    title: "2026年全球燃油车销量占比是否低于60%？",
    category: "燃油车vs新能源",
    probability: 59.3,
    volume: "$3,234,567",
    participants: 1567,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+6.8%",
    description: "全球汽车市场电动化转型加速。此市场预测2026年全球纯燃油车在乘用车市场的销量占比是否会降至60%以下。",
    resolutionCriteria: [
      "基于国际汽车制造商协会等权威机构数据",
      "统计时间为2026年全年",
      "占比计算基于全球乘用车总销量",
      "纯燃油车不包括混合动力车型"
    ],
    relatedMarkets: [
      "全球新能源车销量增速",
      "欧洲/北美/中国燃油车占比",
      "各国禁售燃油车时间表",
      "石油需求趋势预测"
    ]
  },
  {
    id: 15,
    title: "2026年美国燃油车销量是否低于800万辆？",
    category: "燃油车vs新能源",
    probability: 46.8,
    volume: "$2,567,890",
    participants: 1123,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-2.9%",
    description: "美国作为全球第二大汽车市场，新能源车渗透率相对较低但正在加速。此市场预测2026年美国纯燃油车销量是否会低于800万辆。",
    resolutionCriteria: [
      "基于美国汽车协会公布的年度数据",
      "统计时间为2026年全年",
      "仅统计轻型乘用车（轿车和SUV）",
      "不包括皮卡和商用车"
    ],
    relatedMarkets: [
      "美国新能源车渗透率",
      "特斯拉vs传统车企美国市场",
      "美国充电桩建设进度",
      "拜登政府新能源政策影响"
    ]
  },
  
  // 技术创新
  {
    id: 16,
    title: "固态电池在2026年是否实现商业化量产？",
    category: "技术创新",
    probability: 34.2,
    volume: "$2,345,678",
    participants: 987,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+4.1%",
    description: "固态电池被视为下一代动力电池技术，多家车企和电池厂商加速研发。此市场预测2026年是否会有车企实现固态电池的商业化量产装车。",
    resolutionCriteria: [
      "至少有一家车企宣布搭载固态电池的量产车型",
      "必须是真正意义上的全固态或半固态电池",
      "需要有明确的量产交付计划和时间表",
      "装车数量需超过1000辆"
    ],
    relatedMarkets: [
      "固态电池成本下降速度",
      "主要电池厂商技术路线",
      "电池能量密度提升预测",
      "固态电池相关股票表现"
    ]
  },
  {
    id: 17,
    title: "800V高压平台车型在2026年占比是否超30%？",
    category: "技术创新",
    probability: 67.8,
    volume: "$1,876,543",
    participants: 756,
    endDate: "Dec 31, 2026",
    trend: "up",
    change: "+9.3%",
    description: "800V高压平台可实现更快充电速度，成为新能源车技术发展方向。此市场预测2026年搭载800V平台的新能源车型销量占比能否超过30%。",
    resolutionCriteria: [
      "基于主要新能源车企销量统计",
      "统计时间为2026年全年",
      "占比计算基于中国新能源乘用车总销量",
      "包括所有搭载800V及以上电压平台的车型"
    ],
    relatedMarkets: [
      "超充站建设数量",
      "碳化硅功率器件市场",
      "快充vs换电模式占比",
      "800V车型平均售价"
    ]
  },
  {
    id: 18,
    title: "L4级自动驾驶在2026年是否实现商业化？",
    category: "技术创新",
    probability: 28.6,
    volume: "$3,456,789",
    participants: 1345,
    endDate: "Dec 31, 2026",
    trend: "down",
    change: "-5.7%",
    description: "L4级自动驾驶代表高度自动驾驶能力。此市场预测2026年是否会有车企在量产车型上实现L4级自动驾驶的商业化应用。",
    resolutionCriteria: [
      "至少有一家车企推出搭载L4功能的量产车型",
      "必须在特定场景下真正实现无人驾驶",
      "需获得相关监管部门的许可和认证",
      "向普通消费者开放购买和使用"
    ],
    relatedMarkets: [
      "自动驾驶相关政策法规",
      "激光雷达装车量",
      "城市NOA覆盖城市数",
      "自动驾驶事故责任认定"
    ]
  }
];

// 根据ID获取市场数据
export const getMarketById = (id: number) => {
  return automotiveMarkets.find(market => market.id === id);
};

// 获取所有市场数据
export const getAllMarkets = () => {
  return automotiveMarkets;
};

