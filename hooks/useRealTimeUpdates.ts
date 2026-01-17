import { useEffect, useRef, useState } from 'react';
import userManagementService from '../services/userManagementService';

interface RealTimeUpdateOptions {
  enabled?: boolean;
  interval?: number;
  onUserUpdate?: (users: any[]) => void;
  onStatsUpdate?: (stats: any) => void;
  onError?: (error: Error) => void;
}

export const useRealTimeUpdates = (options: RealTimeUpdateOptions = {}) => {
  const {
    enabled = true,
    interval = 30000, // 30 seconds
    onUserUpdate,
    onStatsUpdate,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 获取最新数据
  const fetchLatestData = async () => {
    try {
      // 获取用户统计
      const stats = await userManagementService.getUserStats();
      if (onStatsUpdate) {
        onStatsUpdate(stats);
      }

      // 获取用户列表（第一页，用于监控变化）
      const usersResponse = await userManagementService.getUsers({
        page: 1,
        size: 10,
        sort_by: 'last_request_at',
        sort_order: 'desc'
      });
      
      if (onUserUpdate) {
        onUserUpdate(usersResponse.users);
      }

      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (error) {
      console.error('Real-time update error:', error);
      setIsConnected(false);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  // 启动实时更新
  const startRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 立即获取一次数据
    fetchLatestData();

    // 设置定时更新
    intervalRef.current = setInterval(fetchLatestData, interval);
    setIsConnected(true);
  };

  // 停止实时更新
  const stopRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  };

  // 手动刷新
  const refresh = () => {
    fetchLatestData();
  };

  // 启动/停止实时更新
  useEffect(() => {
    if (enabled) {
      startRealTimeUpdates();
    } else {
      stopRealTimeUpdates();
    }

    // 清理函数
    return () => {
      stopRealTimeUpdates();
    };
  }, [enabled, interval]);

  // 页面可见性变化时的处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面隐藏时停止更新
        stopRealTimeUpdates();
      } else if (enabled) {
        // 页面显示时恢复更新
        startRealTimeUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval]);

  // 网络状态变化时的处理
  useEffect(() => {
    const handleOnline = () => {
      if (enabled) {
        startRealTimeUpdates();
      }
    };

    const handleOffline = () => {
      stopRealTimeUpdates();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, interval]);

  return {
    isConnected,
    lastUpdate,
    refresh,
    startRealTimeUpdates,
    stopRealTimeUpdates
  };
};

// WebSocket实时更新Hook（备用方案）
export const useWebSocketUpdates = (options: RealTimeUpdateOptions = {}) => {
  const { onUserUpdate, onStatsUpdate, onError } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      // WebSocket连接URL（需要根据实际后端配置调整）
      const wsUrl = 'ws://localhost:8000/ws/admin-updates';
      const ws = new WebSocket(wsUrl);
      
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        // 清除重连定时器
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'user_stats_update':
              if (onStatsUpdate) {
                onStatsUpdate(data.payload);
              }
              break;
            case 'user_list_update':
              if (onUserUpdate) {
                onUserUpdate(data.payload);
              }
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
          
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        
        // 自动重连（延迟5秒）
        if (event.code !== 1000) { // 不是正常关闭
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        if (onError) {
          onError(new Error('WebSocket connection error'));
        }
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    disconnect,
    reconnect: connect
  };
};

export default useRealTimeUpdates;
