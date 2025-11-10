'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faTimes, 
  faClock, 
  faFire, 
  faChartBar,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { getSupabase } from '@/lib/supabase-client';

const supabase = getSupabase();

interface SearchResult {
  id: number;
  title: string;
  main_category: string;
  sub_category: string;
  volume: number;
  participants: number;
}

interface SmartSearchBarProps {
  onResultClick?: (marketId: number) => void;
  className?: string;
}

export default function SmartSearchBar({ onResultClick, className = '' }: SmartSearchBarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hotSearches, setHotSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 加载最近搜索和热门搜索
  useEffect(() => {
    loadRecentSearches();
    loadHotSearches();
  }, []);

  // 点击外部关闭搜索建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 监听搜索输入变化
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      // 使用防抖，避免频繁请求
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // 加载最近搜索（从localStorage）
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('lumi_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('加载最近搜索失败:', error);
    }
  };

  // 加载热门搜索（从数据库统计）
  const loadHotSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('title')
        .order('volume', { ascending: false })
        .limit(5);

      if (data) {
        const keywords = data.map(m => {
          // 提取关键词（取标题的前几个词）
          const words = m.title.split(' ').slice(0, 3).join(' ');
          return words;
        });
        setHotSearches(keywords);
      }
    } catch (error) {
      console.error('加载热门搜索失败:', error);
    }
  };

  // 执行搜索
  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('id, title, main_category, sub_category, volume, participants')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,main_category.ilike.%${query}%`)
        .order('volume', { ascending: false })
        .limit(8);

      if (data) {
        setSearchResults(data);
      } else if (error) {
        console.error('搜索失败:', error);
      }
    } catch (error) {
      console.error('搜索错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存搜索到历史
  const saveToRecentSearches = (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('lumi_recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  };

  // 处理搜索提交
  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveToRecentSearches(query.trim());
      setIsFocused(false);
      setSearchQuery('');
      // 可以跳转到搜索结果页面
      router.push(`/markets?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    saveToRecentSearches(searchQuery);
    setIsFocused(false);
    setSearchQuery('');
    
    if (onResultClick) {
      onResultClick(result.id);
    } else {
      router.push(`/market/${result.id}`);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  // 清除历史记录
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('lumi_recent_searches');
  };

  // 高亮关键词
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === keyword.toLowerCase() ? (
            <span key={index} className="bg-amber-400/30 text-amber-400 font-semibold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // 显示建议面板
  const showSuggestions = isFocused && (searchQuery.trim().length > 0 || recentSearches.length > 0);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'ring-2 ring-amber-400/50' : ''
      }`}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <FontAwesomeIcon 
            icon={faSearch} 
            className={`transition-colors ${
              isFocused ? 'text-amber-400' : 'text-gray-500'
            }`}
          />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchQuery);
            }
            if (e.key === 'Escape') {
              setIsFocused(false);
            }
          }}
          placeholder={t('common.searchMarkets') || '搜索市场...'}
          className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg 
                     text-white placeholder-gray-500 
                     focus:outline-none focus:bg-white/10 focus:border-amber-400/50
                     transition-all duration-300"
        />

        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 
                       transition-colors p-1"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}

        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* 搜索建议面板 */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl 
                        shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* 搜索结果 */}
          {searchQuery.trim().length > 0 && (
            <div>
              {searchResults.length > 0 ? (
                <div>
                  <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      <FontAwesomeIcon icon={faChartBar} />
                      搜索结果 ({searchResults.length})
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 hover:bg-white/5 transition-colors text-left 
                                   border-b border-white/5 last:border-0 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium mb-1 group-hover:text-amber-400 transition-colors">
                              {highlightKeyword(result.title, searchQuery)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-0.5 bg-white/5 rounded">
                                {t(`categories.${result.main_category}`) || result.main_category}
                              </span>
                              <span className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faChartLine} className="w-3 h-3" />
                                ${result.volume || 0}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            查看 →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : !loading && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="text-sm">未找到相关市场</div>
                  <div className="text-xs text-gray-600 mt-1">试试其他关键词</div>
                </div>
              )}
            </div>
          )}

          {/* 最近搜索 */}
          {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} />
                  最近搜索
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                >
                  清除
                </button>
              </div>
              <div className="py-2">
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(query);
                      performSearch(query);
                    }}
                    className="w-full px-4 py-2 hover:bg-white/5 transition-colors text-left 
                               flex items-center gap-3 group"
                  >
                    <FontAwesomeIcon icon={faClock} className="text-gray-600 w-4" />
                    <span className="flex-1 text-sm text-gray-300 group-hover:text-white transition-colors">
                      {query}
                    </span>
                    <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      搜索 →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 热门搜索 */}
          {searchQuery.trim().length === 0 && hotSearches.length > 0 && (
            <div className="border-t border-white/10">
              <div className="px-4 py-2 bg-white/5">
                <span className="text-xs text-gray-400 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFire} />
                  热门搜索
                </span>
              </div>
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {hotSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(query);
                      performSearch(query);
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-amber-400/10 border border-white/10 
                               hover:border-amber-400/30 rounded-lg text-xs text-gray-300 
                               hover:text-amber-400 transition-all duration-200 flex items-center gap-1"
                  >
                    <span className="text-amber-400">🔥</span>
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 自定义滚动条样式 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.5);
        }
      `}</style>
    </div>
  );
}

