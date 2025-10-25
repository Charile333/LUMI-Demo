'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface TerminalAlert {
  id: string;
  timestamp: string;
  asset: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  change: number;
  price?: number;
}

interface SystemStats {
  uptime: number;
  alertsTotal: number;
  alertsCritical: number;
  assetsMonitored: number;
  wsConnected: boolean;
}

export default function BlackSwanTerminal() {
  const [alerts, setAlerts] = useState<TerminalAlert[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    uptime: 0,
    alertsTotal: 0,
    alertsCritical: 0,
    assetsMonitored: 0,
    wsConnected: false
  });
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<string>('ALL');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ASCII Art Banner
  const asciiArt = `
  ╔══════════════════════════════════════════════════════════════════╗
  ║                                                                  ║
  ║   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗    ███████╗██╗    ██╗║
  ║   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝    ██╔════╝██║    ██║║
  ║   ██████╔╝██║     ███████║██║     █████╔╝     ███████╗██║ █╗ ██║║
  ║   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗     ╚════██║██║███╗██║║
  ║   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗    ███████║╚███╔███╔╝║
  ║   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚══════╝ ╚══╝╚══╝ ║
  ║                                                                  ║
  ║              REAL-TIME MARKET ANOMALY DETECTION SYSTEM           ║
  ║                    黑天鹅事件实时监控终端                         ║
  ╚══════════════════════════════════════════════════════════════════╝
  `;

  // 连接 WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;
    let uptimeInterval: NodeJS.Timeout;

    // 启动时间计数器
    const startTime = Date.now();
    uptimeInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);

    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:3000/ws/alerts');

        ws.onopen = () => {
          setStats(prev => ({ ...prev, wsConnected: true }));
          addSystemMessage('WebSocket connection established', 'SUCCESS');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'alert' && data.data) {
              const alert = data.data;
              let change = 0;
              if (alert.details && alert.details.price_change) {
                change = alert.details.price_change * 100;
              }
              
              let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
              if (Math.abs(change) > 5) severity = 'CRITICAL';
              else if (Math.abs(change) > 2) severity = 'HIGH';
              else if (Math.abs(change) > 1) severity = 'MEDIUM';
              else severity = 'LOW';
              
              const newAlert: TerminalAlert = {
                id: Date.now().toString(),
                timestamp: new Date(alert.timestamp).toISOString(),
                asset: alert.symbol.replace('USDT', '/USDT'),
                severity: severity,
                message: alert.message,
                change: change,
                price: alert.details?.current_price
              };
              
              setAlerts(prev => [newAlert, ...prev].slice(0, 100));
              setStats(prev => ({
                ...prev,
                alertsTotal: prev.alertsTotal + 1,
                alertsCritical: severity === 'CRITICAL' ? prev.alertsCritical + 1 : prev.alertsCritical
              }));
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          setStats(prev => ({ ...prev, wsConnected: false }));
          addSystemMessage('WebSocket disconnected. Reconnecting...', 'WARNING');
          reconnectTimer = setTimeout(connectWebSocket, 5000);
        };

      } catch (error) {
        console.error('Connection failed:', error);
        reconnectTimer = setTimeout(connectWebSocket, 5000);
      }
    };

    // 加载历史数据
    const fetchHistoricalAlerts = async () => {
      try {
        const response = await fetch('/api/alerts');
        const result = await response.json();
        
        if (result.success && result.data) {
          const historicalAlerts: TerminalAlert[] = result.data.map((item: any) => {
            let change = 0;
            if (item.details && item.details.price_change) {
              change = item.details.price_change * 100;
            }
            
            let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
            if (Math.abs(change) > 5) severity = 'CRITICAL';
            else if (Math.abs(change) > 2) severity = 'HIGH';
            else if (Math.abs(change) > 1) severity = 'MEDIUM';
            else severity = 'LOW';
            
            return {
              id: item.timestamp,
              timestamp: new Date(item.timestamp).toISOString(),
              asset: item.symbol.replace('USDT', '/USDT'),
              severity: severity,
              message: item.message,
              change: change,
              price: item.details?.current_price
            };
          });
          
          setAlerts(historicalAlerts);
          setStats(prev => ({
            ...prev,
            alertsTotal: historicalAlerts.length,
            alertsCritical: historicalAlerts.filter(a => a.severity === 'CRITICAL').length,
            assetsMonitored: new Set(historicalAlerts.map(a => a.asset)).size
          }));
        }
      } catch (error) {
        addSystemMessage('Failed to load historical data', 'ERROR');
      }
    };

    addSystemMessage('Initializing Black Swan Detection System...', 'INFO');
    addSystemMessage('Loading modules: price_jump, whale_transfer, funding_spike', 'INFO');
    fetchHistoricalAlerts();
    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (uptimeInterval) clearInterval(uptimeInterval);
    };
  }, []);

  // 添加系统消息
  const addSystemMessage = (message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR') => {
    const systemAlert: TerminalAlert = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toISOString(),
      asset: 'SYSTEM',
      severity: type === 'ERROR' ? 'CRITICAL' : type === 'WARNING' ? 'HIGH' : 'LOW',
      message: message,
      change: 0
    };
    setAlerts(prev => [systemAlert, ...prev].slice(0, 100));
  };

  // 处理命令
  const handleCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    setCommandHistory(prev => [cmd, ...prev]);
    
    switch (command) {
      case 'help':
        addSystemMessage('Available commands: help, clear, stats, filter [all|critical|high|medium], exit, status', 'INFO');
        break;
      case 'clear':
        setAlerts([]);
        addSystemMessage('Terminal cleared', 'INFO');
        break;
      case 'stats':
        addSystemMessage(
          `Total Alerts: ${stats.alertsTotal} | Critical: ${stats.alertsCritical} | Assets: ${stats.assetsMonitored} | Uptime: ${formatUptime(stats.uptime)}`,
          'INFO'
        );
        break;
      case 'filter all':
        setCurrentFilter('ALL');
        addSystemMessage('Filter: ALL alerts', 'INFO');
        break;
      case 'filter critical':
        setCurrentFilter('CRITICAL');
        addSystemMessage('Filter: CRITICAL alerts only', 'INFO');
        break;
      case 'filter high':
        setCurrentFilter('HIGH');
        addSystemMessage('Filter: HIGH alerts only', 'INFO');
        break;
      case 'filter medium':
        setCurrentFilter('MEDIUM');
        addSystemMessage('Filter: MEDIUM alerts only', 'INFO');
        break;
      case 'status':
        addSystemMessage(
          `WebSocket: ${stats.wsConnected ? 'CONNECTED' : 'DISCONNECTED'} | Monitoring: ACTIVE | CPU: 12% | MEM: 45%`,
          'INFO'
        );
        break;
      case 'exit':
        addSystemMessage('Use browser back button to exit terminal', 'INFO');
        break;
      default:
        if (command) {
          addSystemMessage(`Unknown command: ${command}. Type 'help' for available commands.`, 'WARNING');
        }
    }
    
    setCommandInput('');
  };

  // 格式化运行时间
  const formatUptime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 格式化时间戳
  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 获取严重程度颜色
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500';
      case 'HIGH': return 'text-orange-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'LOW': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  // 过滤警报
  const filteredAlerts = currentFilter === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.severity === currentFilter);

  // 自动滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [alerts]);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-0 overflow-hidden">
      {/* 顶部状态栏 */}
      <div className="bg-gray-900 border-b border-green-500 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/black-swan" className="text-green-400 hover:text-green-300 transition-colors">
            [← BACK]
          </Link>
          <span className="text-green-500">BLACK SWAN TERMINAL v2.1.0</span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className={stats.wsConnected ? 'text-green-400' : 'text-red-400'}>
              ●
            </span>
            <span>WS: {stats.wsConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
          <div>UPTIME: {formatUptime(stats.uptime)}</div>
          <div>ALERTS: {stats.alertsTotal}</div>
          <div className="text-red-500">CRITICAL: {stats.alertsCritical}</div>
          <div>FILTER: {currentFilter}</div>
        </div>
      </div>

      {/* ASCII Banner */}
      <div className="text-green-500 text-xs leading-tight px-4 py-2 border-b border-green-900">
        <pre>{asciiArt}</pre>
      </div>

      {/* 主终端区域 */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* 左侧：警报流 */}
        <div className="flex-1 overflow-hidden border-r border-green-900">
          <div className="bg-gray-900 border-b border-green-900 px-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-bold">═══ ALERT STREAM ═══</span>
              <span className="text-xs text-gray-500">[{filteredAlerts.length} entries]</span>
            </div>
          </div>
          
          <div 
            ref={terminalRef}
            className="h-full overflow-y-auto overflow-x-hidden px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black"
          >
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <div className="text-2xl mb-2">[ NO DATA ]</div>
                <div className="text-xs">Waiting for alerts...</div>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="font-mono text-xs leading-relaxed hover:bg-gray-900 px-2 py-1 rounded transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 shrink-0">[{formatTimestamp(alert.timestamp)}]</span>
                    <span className={`${getSeverityColor(alert.severity)} font-bold shrink-0 w-20`}>
                      {alert.severity}
                    </span>
                    <span className="text-cyan-400 shrink-0 w-24">{alert.asset}</span>
                    {alert.change !== 0 && (
                      <span className={`shrink-0 w-20 ${alert.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
                      </span>
                    )}
                    <span className="text-gray-400 flex-1">{alert.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右侧：系统面板 */}
        <div className="w-96 bg-gray-950">
          <div className="bg-gray-900 border-b border-green-900 px-4 py-2">
            <span className="text-green-400 font-bold">═══ SYSTEM PANEL ═══</span>
          </div>
          
          <div className="p-4 space-y-4 text-xs">
            {/* 系统状态 */}
            <div className="border border-green-900 p-3">
              <div className="text-green-400 font-bold mb-2">╔═ SYSTEM STATUS ═╗</div>
              <div className="space-y-1 text-gray-400">
                <div className="flex justify-between">
                  <span>WebSocket:</span>
                  <span className={stats.wsConnected ? 'text-green-400' : 'text-red-400'}>
                    {stats.wsConnected ? '✓ ONLINE' : '✗ OFFLINE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monitoring:</span>
                  <span className="text-green-400">✓ ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-cyan-400">{formatUptime(stats.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span className="text-yellow-400">12.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="text-yellow-400">45.8%</span>
                </div>
              </div>
            </div>

            {/* 统计数据 */}
            <div className="border border-green-900 p-3">
              <div className="text-green-400 font-bold mb-2">╔═ STATISTICS ═╗</div>
              <div className="space-y-1 text-gray-400">
                <div className="flex justify-between">
                  <span>Total Alerts:</span>
                  <span className="text-white">{stats.alertsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical:</span>
                  <span className="text-red-500">{stats.alertsCritical}</span>
                </div>
                <div className="flex justify-between">
                  <span>High:</span>
                  <span className="text-orange-500">
                    {alerts.filter(a => a.severity === 'HIGH').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <span className="text-yellow-500">
                    {alerts.filter(a => a.severity === 'MEDIUM').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Assets Monitored:</span>
                  <span className="text-cyan-400">{stats.assetsMonitored || new Set(alerts.map(a => a.asset)).size}</span>
                </div>
              </div>
            </div>

            {/* 检测模块 */}
            <div className="border border-green-900 p-3">
              <div className="text-green-400 font-bold mb-2">╔═ DETECTORS ═╗</div>
              <div className="space-y-1 text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>price_jump.py</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>whale_transfer.py</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>funding_spike.py</span>
                </div>
              </div>
            </div>

            {/* 快捷命令 */}
            <div className="border border-green-900 p-3">
              <div className="text-green-400 font-bold mb-2">╔═ QUICK COMMANDS ═╗</div>
              <div className="space-y-1 text-gray-400">
                <button 
                  onClick={() => handleCommand('stats')}
                  className="block w-full text-left hover:text-green-400 transition-colors"
                >
                  → stats
                </button>
                <button 
                  onClick={() => handleCommand('clear')}
                  className="block w-full text-left hover:text-green-400 transition-colors"
                >
                  → clear
                </button>
                <button 
                  onClick={() => handleCommand('filter critical')}
                  className="block w-full text-left hover:text-green-400 transition-colors"
                >
                  → filter critical
                </button>
                <button 
                  onClick={() => handleCommand('filter all')}
                  className="block w-full text-left hover:text-green-400 transition-colors"
                >
                  → filter all
                </button>
                <button 
                  onClick={() => handleCommand('status')}
                  className="block w-full text-left hover:text-green-400 transition-colors"
                >
                  → status
                </button>
              </div>
            </div>

            {/* 图例 */}
            <div className="border border-green-900 p-3">
              <div className="text-green-400 font-bold mb-2">╔═ SEVERITY LEGEND ═╗</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">■</span>
                  <span className="text-gray-400">CRITICAL (&gt;5%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">■</span>
                  <span className="text-gray-400">HIGH (2-5%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">■</span>
                  <span className="text-gray-400">MEDIUM (1-2%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">■</span>
                  <span className="text-gray-400">LOW (&lt;1%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部命令行 */}
      <div className="border-t border-green-900 bg-gray-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400">root@blackswan:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCommand(commandInput);
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
            placeholder="Type 'help' for available commands"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}



