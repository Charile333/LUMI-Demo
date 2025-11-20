// 🔮 UMA 预言机状态管理 Context
// 监控市场结算状态、挑战期倒计时等

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase-client';
import { ethers } from 'ethers';

// ==================== 类型定义 ====================

export type OracleState = 
  | 'active'      // 交易中
  | 'ended'       // 已到期，等待结算
  | 'requested'   // 已请求预言机
  | 'proposed'    // 有人提案了结果
  | 'disputed'    // 结果被争议
  | 'resolved';   // 已最终结算

export interface OracleStatus {
  state: OracleState;
  settlementDeadline?: Date;      // 市场截止时间
  challengePeriodEnd?: Date;       // 挑战期结束时间
  proposedResult?: 'YES' | 'NO';   // 提案的结果
  finalResult?: 'YES' | 'NO' | 'INVALID'; // 最终结果
  canSettle: boolean;               // 是否可以发起结算
  canResolve: boolean;              // 是否可以最终确认
  canRedeem: boolean;               // 是否可以赎回
  requestedAt?: Date;               // 请求时间
  resolvedAt?: Date;                // 结算时间
}

interface UMAOracleContextValue {
  getOracleStatus: (marketId: number) => OracleStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

// ==================== Context ====================

const UMAOracleContext = createContext<UMAOracleContextValue | null>(null);

export function UMAOracleProvider({ 
  children,
  marketIds 
}: { 
  children: React.ReactNode;
  marketIds: number[];
}) {
  const [statusMap, setStatusMap] = useState<Map<number, OracleStatus>>(new Map());
  const [loading, setLoading] = useState(true);

  // 🔥 批量获取 UMA 状态
  const fetchOracleStatuses = useCallback(async () => {
    if (marketIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      
      // 查询市场基础信息
      const { data: markets, error } = await supabase
        .from('markets')
        .select(`
          id,
          end_date,
          blockchain_status,
          settlement_requested_at,
          settlement_resolved_at,
          settlement_result,
          question_id
        `)
        .in('id', marketIds);

      if (error) throw error;

      const newMap = new Map<number, OracleStatus>();

      markets?.forEach(market => {
        const now = new Date();
        const endDate = market.end_date ? new Date(market.end_date) : null;
        const requestedAt = market.settlement_requested_at 
          ? new Date(market.settlement_requested_at) 
          : null;
        const resolvedAt = market.settlement_resolved_at 
          ? new Date(market.settlement_resolved_at) 
          : null;

        // 计算挑战期结束时间（请求后2小时）
        const challengePeriodEnd = requestedAt 
          ? new Date(requestedAt.getTime() + 2 * 60 * 60 * 1000)
          : null;

        // 判断状态
        let state: OracleState = 'active';
        let canSettle = false;
        let canResolve = false;
        let canRedeem = false;

        if (market.settlement_result) {
          // 已结算
          state = 'resolved';
          canRedeem = true;
        } else if (requestedAt && challengePeriodEnd && now > challengePeriodEnd) {
          // 挑战期已过，可以最终确认
          state = 'proposed';
          canResolve = true;
        } else if (requestedAt) {
          // 结算请求中，等待挑战期
          state = 'requested';
        } else if (endDate && now > endDate) {
          // 市场已到期，可以发起结算
          state = 'ended';
          canSettle = true;
        } else {
          // 交易中
          state = 'active';
        }

        newMap.set(market.id, {
          state,
          settlementDeadline: endDate || undefined,
          challengePeriodEnd: challengePeriodEnd || undefined,
          finalResult: market.settlement_result || undefined,
          canSettle,
          canResolve,
          canRedeem,
          requestedAt: requestedAt || undefined,
          resolvedAt: resolvedAt || undefined
        });
      });

      setStatusMap(newMap);
      setLoading(false);

      console.log(`🔮 UMA 预言机状态已加载 (${newMap.size} 个市场)`);

    } catch (err) {
      console.error('❌ 获取预言机状态失败:', err);
      setLoading(false);
    }
  }, [marketIds.join(',')]);

  // 🔥 实时监听市场结算状态变化
  useEffect(() => {
    if (marketIds.length === 0) return;

    const supabase = getSupabase();

    // 订阅 markets 表的结算相关字段变化
    const channel = supabase
      .channel('oracle_status_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
          filter: `id=in.(${marketIds.join(',')})`
        },
        (payload) => {
          const updated = payload.new as any;
          console.log(`🔮 市场 ${updated.id} 预言机状态更新`);

          // 重新计算状态
          fetchOracleStatuses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketIds.join(','), fetchOracleStatuses]);

  // 初始加载
  useEffect(() => {
    fetchOracleStatuses();
  }, [fetchOracleStatuses]);

  const getOracleStatus = useCallback((marketId: number) => {
    return statusMap.get(marketId) || null;
  }, [statusMap]);

  return (
    <UMAOracleContext.Provider value={{
      getOracleStatus,
      loading,
      refresh: fetchOracleStatuses
    }}>
      {children}
    </UMAOracleContext.Provider>
  );
}

// ==================== Hook ====================

export function useOracleStatus(marketId: number) {
  const context = useContext(UMAOracleContext);
  
  if (!context) {
    throw new Error('useOracleStatus must be used within UMAOracleProvider');
  }
  
  return {
    status: context.getOracleStatus(marketId),
    loading: context.loading,
    refresh: context.refresh
  };
}


































