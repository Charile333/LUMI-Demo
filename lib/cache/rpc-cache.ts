/**
 * 🌐 RPC 连接缓存系统
 * 缓存 RPC 连接状态，避免重复尝试失败的端点
 */

interface RPCStatus {
  url: string;
  isAvailable: boolean;
  lastChecked: number;
  latency: number;
  consecutiveFailures: number;
}

export class RPCCache {
  private rpcStatus: Map<string, RPCStatus> = new Map();
  private readonly CHECK_INTERVAL = 60 * 1000; // 1分钟后重新检查失败的端点
  private readonly MAX_FAILURES = 3; // 3次失败后暂时禁用

  /**
   * 标记 RPC 端点可用
   */
  markAvailable(url: string, latency: number): void {
    this.rpcStatus.set(url, {
      url,
      isAvailable: true,
      lastChecked: Date.now(),
      latency,
      consecutiveFailures: 0
    });
  }

  /**
   * 标记 RPC 端点不可用
   */
  markUnavailable(url: string): void {
    const status = this.rpcStatus.get(url);
    const failures = status ? status.consecutiveFailures + 1 : 1;
    
    this.rpcStatus.set(url, {
      url,
      isAvailable: false,
      lastChecked: Date.now(),
      latency: 0,
      consecutiveFailures: failures
    });
    
    if (failures >= this.MAX_FAILURES) {
      console.warn(`⚠️ RPC ${url} 连续失败 ${failures} 次，暂时禁用`);
    }
  }

  /**
   * 检查 RPC 是否应该尝试
   */
  shouldTry(url: string): boolean {
    const status = this.rpcStatus.get(url);
    
    if (!status) {
      return true; // 未测试过，应该尝试
    }
    
    // 如果可用，直接返回 true
    if (status.isAvailable) {
      return true;
    }
    
    // 如果连续失败次数过多，检查是否过了冷却时间
    if (status.consecutiveFailures >= this.MAX_FAILURES) {
      const cooldownTime = this.CHECK_INTERVAL * status.consecutiveFailures;
      return Date.now() - status.lastChecked > cooldownTime;
    }
    
    // 普通失败，1分钟后可重试
    return Date.now() - status.lastChecked > this.CHECK_INTERVAL;
  }

  /**
   * 获取最佳 RPC 端点
   */
  getBestRPC(urls: string[]): string | null {
    const available = urls
      .map(url => ({
        url,
        status: this.rpcStatus.get(url)
      }))
      .filter(({ status }) => 
        !status || (status.isAvailable && status.consecutiveFailures === 0)
      )
      .sort((a, b) => {
        // 按延迟排序
        const latencyA = a.status?.latency || Infinity;
        const latencyB = b.status?.latency || Infinity;
        return latencyA - latencyB;
      });
    
    return available.length > 0 ? available[0].url : null;
  }

  /**
   * 获取所有可尝试的 RPC 端点
   */
  getTriableRPCs(urls: string[]): string[] {
    return urls.filter(url => this.shouldTry(url));
  }

  /**
   * 获取状态统计
   */
  getStats() {
    const stats = {
      total: 0,
      available: 0,
      unavailable: 0,
      details: [] as RPCStatus[]
    };
    
    this.rpcStatus.forEach(status => {
      stats.total++;
      if (status.isAvailable) {
        stats.available++;
      } else {
        stats.unavailable++;
      }
      stats.details.push(status);
    });
    
    return stats;
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.rpcStatus.clear();
  }
}

/**
 * 全局 RPC 缓存实例
 */
export const rpcCache = new RPCCache();

























