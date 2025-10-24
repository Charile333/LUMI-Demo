import { useState, useEffect } from 'react';
import { Market, CategoryType } from '../types/market';

interface UseMarketsOptions {
  categoryType?: CategoryType;
  isActive?: boolean;
  autoLoad?: boolean;
}

export function useMarkets(options: UseMarketsOptions = {}) {
  const { categoryType, isActive = true, autoLoad = true } = options;
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (categoryType) params.append('categoryType', categoryType);
      if (isActive !== undefined) params.append('isActive', String(isActive));

      const response = await fetch(`/api/markets?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setMarkets(result.data.markets);
      } else {
        setError(result.error || '加载失败');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadMarkets();
    }
  }, [categoryType, isActive, autoLoad]);

  return {
    markets,
    loading,
    error,
    refetch: loadMarkets,
  };
}


