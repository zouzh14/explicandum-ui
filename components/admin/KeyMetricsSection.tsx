import React from 'react';
import { AppState } from '../../types';
import { Icons } from '../../constants';
import { Language } from '../../i18n';

interface KeyMetricsSectionProps {
  state: AppState;
  language: Language;
}

/**
 * KeyMetricsSection - 管理面板关键指标组件
 * 
 * 功能状态分析：
 * ✅ 真实功能：
 * - 活跃用户统计：基于 state.registeredUsers 中 isTemp=false 的用户数量
 * - 今日Token使用：基于 state.registeredUsers 中所有用户的 tokensUsed 总和
 * - 总请求数：基于 state.registeredUsers 中所有用户的 requestCount 总和
 * 
 * 🎭 演示数据：
 * - 系统健康度：固定显示 98%，需要连接实际系统监控API
 * - 变化趋势百分比：+12%, +2%, -5%, +8% 都是模拟数据，需要实际计算
 * 
 * TODO: 需要实现的功能
 * 1. 连接真实的系统健康监控API
 * 2. 实现趋势数据的实际计算（与历史数据对比）
 * 3. 添加实时数据更新机制
 * 4. 实现指标的时间范围选择（今日/本周/本月）
 * 5. 添加更多系统指标（CPU、内存、磁盘使用率等）
 */
const KeyMetricsSection: React.FC<KeyMetricsSectionProps> = ({ state, language }) => {
  // 真实数据计算
  const totalTokensUsed = state.registeredUsers.reduce((acc, u) => acc + u.tokensUsed, 0);
  const totalRequests = state.registeredUsers.reduce((acc, u) => acc + u.requestCount, 0);
  const activeUsers = state.registeredUsers.filter(u => !u.isTemp).length;
  const tempUsers = state.registeredUsers.filter(u => u.isTemp).length;

  const metrics = [
    {
      title: language === 'zh' ? '活跃用户' : 'Active Users',
      value: activeUsers.toString(),
      change: '+12%', // TODO: 演示数据 - 需要实际计算与历史数据的对比
      trend: 'up' as const,
      icon: 'users',
      color: 'blue',
      isReal: true
    },
    {
      title: language === 'zh' ? '系统健康度' : 'System Health',
      value: '98%', // TODO: 演示数据 - 需要连接真实系统监控API
      change: '+2%', // TODO: 演示数据 - 需要实际计算
      trend: 'up' as const,
      icon: 'health',
      color: 'green',
      isReal: false
    },
    {
      title: language === 'zh' ? '今日Token使用' : 'Today\'s Token Usage',
      value: totalTokensUsed.toLocaleString(),
      change: '-5%', // TODO: 演示数据 - 需要实际计算与昨日对比
      trend: 'down' as const,
      icon: 'tokens',
      color: 'orange',
      isReal: true
    },
    {
      title: language === 'zh' ? '总请求数' : 'Total Requests',
      value: totalRequests.toLocaleString(),
      change: '+8%', // TODO: 演示数据 - 需要实际计算与历史数据对比
      trend: 'up' as const,
      icon: 'requests',
      color: 'purple',
      isReal: true
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    );
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return <Icons.Database />;
      case 'health':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'tokens':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'requests':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return <Icons.Database />;
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
        <Icons.Database />
        {language === 'zh' ? '关键指标' : 'Key Metrics'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className={`bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all ${
              !metric.isReal ? 'border-zinc-200 opacity-75' : 'border-zinc-200'
            }`}
          >
            {/* 演示数据指示器 */}
            {!metric.isReal && (
              <div className="flex items-center justify-between p-2 bg-zinc-50 border-b border-zinc-100 rounded-t-2xl">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <span className="text-xs text-orange-600 font-medium">
                    {language === 'zh' ? '演示数据' : 'Demo Data'}
                  </span>
                </div>
                <span className="text-xs text-zinc-400" title={language === 'zh' ? '需要连接真实API' : 'Requires real API connection'}>
                  ⚠️
                </span>
              </div>
            )}
            
            <div className={`p-6 ${!metric.isReal ? 'pt-4' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  metric.isReal 
                    ? `bg-${metric.color}-50 text-${metric.color}-600`
                    : 'bg-zinc-100 text-zinc-400'
                }`}>
                  {getIcon(metric.icon)}
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm font-medium ${
                    metric.isReal 
                      ? (metric.trend === 'up' ? 'text-green-600' : 'text-red-600')
                      : 'text-zinc-400'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold font-mono ${
                  metric.isReal ? 'text-zinc-900' : 'text-zinc-500'
                }`}>
                  {metric.value}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">
                  {metric.title}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyMetricsSection;
