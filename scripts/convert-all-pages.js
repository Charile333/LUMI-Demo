/**
 * 将所有静态页面转换为动态页面的参考模板
 * 这个文件包含了通用的动态加载代码
 */

const dynamicPageTemplate = `'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { /* 根据分类导入相应图标 */ } from '@fortawesome/free-solid-svg-icons';

const DynamicPage = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 📊 动态数据加载
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 从 API 加载市场数据
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用统一 API，根据 categoryType 获取数据
        const response = await fetch('/api/markets?categoryType=YOUR_CATEGORY&limit=30');
        const result = await response.json();
        
        if (result.success) {
          setMarkets(result.data.markets);
          console.log(\`[页面] 成功加载 \${result.data.markets.length} 条市场数据\`);
        } else {
          setError(result.error || '加载失败');
        }
      } catch (err) {
        console.error('[页面] 加载失败:', err);
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []); // 只在组件挂载时加载一次

  // 其余代码保持不变...
  // 筛选、显示逻辑等
};

export default DynamicPage;
`;

console.log('📝 动态页面模板：\n');
console.log('这是将静态页面改为动态的关键代码\n');
console.log('主要改动：');
console.log('1. 删除：import { getAllXxxMarkets } from "lib/xxx"');
console.log('2. 添加：useState 和 useEffect 进行数据加载');
console.log('3. 使用：fetch("/api/markets?categoryType=xxx")');
console.log('\n详见：app/sports-gaming/page.tsx (参考实现)\n');










