import React from 'react';
import { AppState } from '../../types';
import { Language } from '../../i18n';

interface SystemStatusSectionProps {
  state: AppState;
  language: Language;
}

/**
 * SystemStatusSection - 系统状态监控组件
 * 
 * 功能状态分析：
 * 🎭 演示数据：
 * - 所有系统状态数据都是硬编码的模拟数据
 * - 数据库连接数、API服务器运行时间、存储使用率、内存使用都是固定值
 * - 状态指示器（健康/警告/错误）都是预设的
 * 
 * ✅ 真实功能：
 * - 状态可视化逻辑（颜色、图标、文本显示）
 * - 响应式布局和交互效果
 * - 实时时间显示（最后检查时间）
 * 
 * TODO: 需要实现的功能
 * 1. 连接真实的系统监控API获取实际状态
 * 2. 实现数据库连接池状态监控
 * 3. 实现API服务器健康检查和运行时间统计
 * 4. 实现磁盘空间使用率监控
 * 5. 实现内存使用率监控
 * 6. 添加实时状态更新机制（WebSocket或轮询）
 * 7. 添加状态历史记录和趋势分析
 * 8. 实现状态告警和通知功能
 * 9. 添加更多系统服务监控（Redis、Nginx等）
 * 10. 实现状态详情弹窗和故障诊断工具
 */
const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({ state, language }) => {
  // TODO: 演示数据 - 需要连接真实系统监控API
  const systemStatus = [
    {
      id: 'database',
      title: language === 'zh' ? '数据库' : 'Database',
      status: 'healthy' as const,
      details: language === 'zh' ? '连接数: 15/100' : 'Connections: 15/100',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      )
    },
    {
      id: 'api-server',
      title: language === 'zh' ? 'API服务器' : 'API Server',
      status: 'healthy' as const,
      details: language === 'zh' ? '运行时间: 99.9%' : 'Uptime: 99.9%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      )
    },
    {
      id: 'storage',
      title: language === 'zh' ? '存储空间' : 'Storage',
      status: 'warning' as const,
      details: language === 'zh' ? '使用率: 85%' : 'Usage: 85%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      )
    },
    {
      id: 'memory',
      title: language === 'zh' ? '内存使用' : 'Memory',
      status: 'healthy' as const,
      details: language === 'zh' ? '使用: 2.1GB / 8GB' : 'Used: 2.1GB / 8GB',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    }
  ];

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-50',
          text: 'text-green-600',
          border: 'border-green-200',
          dot: 'bg-green-500'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-600',
          border: 'border-orange-200',
          dot: 'bg-orange-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          text: 'text-red-600',
          border: 'border-red-200',
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-zinc-50',
          text: 'text-zinc-600',
          border: 'border-zinc-200',
          dot: 'bg-zinc-500'
        };
    }
  };

  const getStatusText = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return language === 'zh' ? '正常' : 'Healthy';
      case 'warning':
        return language === 'zh' ? '警告' : 'Warning';
      case 'error':
        return language === 'zh' ? '错误' : 'Error';
      default:
        return language === 'zh' ? '未知' : 'Unknown';
    }
  };

  return (
    <div className="mb-12">
      {/* DEMO DATA 警告横幅 */}
      <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-800">
              {language === 'zh' ? '演示数据 - 系统状态监控' : 'DEMO DATA - System Status Monitoring'}
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {language === 'zh' 
                ? '此部分显示的是模拟数据。真实系统状态监控功能正在开发中。'
                : 'This section shows simulated data. Real system status monitoring is under development.'}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-zinc-900 mb-6">
        {language === 'zh' ? '系统状态' : 'System Status'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStatus.map((item) => {
          const colors = getStatusColor(item.status);
          
          return (
            <div key={item.id} className={`bg-white border ${colors.border} rounded-2xl shadow-sm relative opacity-75`}>
              {/* 演示数据指示器 */}
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-full">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-xs text-yellow-800 font-medium">
                    {language === 'zh' ? '演示' : 'Demo'}
                  </span>
                </div>
              </div>
              
              <div className={`p-6 ${colors.text} opacity-60`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center opacity-50`}>
                    {item.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot} ${item.status === 'healthy' ? 'animate-pulse' : ''}`} />
                    <span className={`text-xs font-medium opacity-60`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-zinc-900 opacity-70">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 font-mono">
                    {item.details}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 系统整体状态指示器 */}
      <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-zinc-900">
              {language === 'zh' ? '系统整体状态' : 'Overall System Status'}: 
            </span>
            <span className="text-sm font-bold text-green-600">
              {language === 'zh' ? '运行正常' : 'Operational'}
            </span>
          </div>
          <div className="text-xs text-zinc-500">
            {language === 'zh' ? '最后检查: ' : 'Last check: '}
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusSection;
