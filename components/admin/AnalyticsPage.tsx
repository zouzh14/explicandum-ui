import React, { useState, useMemo } from 'react';
import { AppState, User } from '../../types';
import { Icons } from '../../constants';
import { Language } from '../../i18n';

interface AnalyticsPageProps {
  state: AppState;
  language: Language;
  onClose: () => void;
}

// 数据点类型定义
interface DataPoint {
  label: string;
  value: number;
  timestamp?: number;
}

interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  totalRequests: number;
  tokensUsed: number;
}

/**
 * AnalyticsPage - 系统分析页面
 * 
 * 功能状态分析：
 * 🎭 演示数据：
 * - mockUserActivityData: 硬编码的用户活动时间序列数据
 * - 时间范围选择（7d/30d/90d）: 没有实际的数据过滤逻辑
 * - 趋势图表数据: 基于模拟数据的静态展示
 * 
 * ✅ 真实功能：
 * - 用户类型分布: 基于真实的 state.registeredUsers 数据
 * - 配额使用分布: 基于真实用户的 token 使用情况计算
 * - 统计卡片数据: 总用户、总请求、Token使用等基于真实数据
 * 
 * TODO: 需要实现的功能
 * 1. 连接真实的分析API获取历史活动数据
 * 2. 实现时间范围选择的数据过滤逻辑
 * 3. 添加实时数据更新机制
 * 4. 实现更复杂的图表类型（折线图、面积图等）
 * 5. 添加数据导出功能
 * 6. 实现自定义时间范围选择
 * 7. 添加更多分析维度（地域、设备、时间段等）
 * 8. 实现数据对比功能（同比、环比）
 * 9. 添加异常检测和告警
 * 10. 实现预测分析功能
 */
const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ state, language, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'requests' | 'tokens'>('users');

  // TODO: 演示数据 - 需要连接真实的分析API获取历史活动数据
  const mockUserActivityData: UserActivityData[] = [
    { date: '2024-01-01', activeUsers: 45, newUsers: 8, totalRequests: 234, tokensUsed: 12500 },
    { date: '2024-01-02', activeUsers: 52, newUsers: 12, totalRequests: 289, tokensUsed: 15600 },
    { date: '2024-01-03', activeUsers: 48, newUsers: 6, totalRequests: 267, tokensUsed: 14200 },
    { date: '2024-01-04', activeUsers: 61, newUsers: 15, totalRequests: 345, tokensUsed: 18900 },
    { date: '2024-01-05', activeUsers: 58, newUsers: 9, totalRequests: 312, tokensUsed: 16700 },
    { date: '2024-01-06', activeUsers: 55, newUsers: 7, totalRequests: 298, tokensUsed: 15900 },
    { date: '2024-01-07', activeUsers: 63, newUsers: 11, totalRequests: 378, tokensUsed: 20300 },
    { date: '2024-01-08', activeUsers: 67, newUsers: 14, totalRequests: 401, tokensUsed: 21800 },
    { date: '2024-01-09', activeUsers: 64, newUsers: 8, totalRequests: 389, tokensUsed: 20700 },
    { date: '2024-01-10', activeUsers: 71, newUsers: 16, totalRequests: 423, tokensUsed: 23100 },
    { date: '2024-01-11', activeUsers: 69, newUsers: 10, totalRequests: 415, tokensUsed: 22400 },
    { date: '2024-01-12', activeUsers: 73, newUsers: 13, totalRequests: 445, tokensUsed: 24200 },
    { date: '2024-01-13', activeUsers: 68, newUsers: 9, totalRequests: 398, tokensUsed: 21100 },
    { date: '2024-01-14', activeUsers: 75, newUsers: 17, totalRequests: 467, tokensUsed: 25600 },
    { date: '2024-01-15', activeUsers: 72, newUsers: 11, totalRequests: 438, tokensUsed: 23800 },
  ];

  // 模拟用户类型分布数据
  const userRoleDistribution = useMemo(() => {
    const distribution = {
      admin: state.registeredUsers.filter(u => u.role === 'admin').length,
      researcher: state.registeredUsers.filter(u => u.role === 'researcher').length,
      user: state.registeredUsers.filter(u => u.role === 'user').length,
      temp: state.registeredUsers.filter(u => u.isTemp).length,
    };

    return Object.entries(distribution).map(([role, count]) => ({
      role,
      count,
      percentage: state.registeredUsers.length > 0 ? (count / state.registeredUsers.length) * 100 : 0,
    }));
  }, [state.registeredUsers]);

  // 模拟配额使用分布
  const quotaUsageDistribution = useMemo(() => {
    const ranges = [
      { label: language === 'zh' ? '0-25%' : '0-25%', min: 0, max: 25, color: 'bg-green-500' },
      { label: language === 'zh' ? '26-50%' : '26-50%', min: 26, max: 50, color: 'bg-blue-500' },
      { label: language === 'zh' ? '51-75%' : '51-75%', min: 51, max: 75, color: 'bg-orange-500' },
      { label: language === 'zh' ? '76-100%' : '76-100%', min: 76, max: 100, color: 'bg-red-500' },
    ];

    return ranges.map(range => ({
      ...range,
      count: state.registeredUsers.filter(u => {
        const percentage = (u.tokensUsed / u.tokenQuota) * 100;
        return percentage >= range.min && percentage <= range.max;
      }).length,
    }));
  }, [state.registeredUsers, language]);

  // 获取当前选中的数据
  const getCurrentData = () => {
    switch (selectedMetric) {
      case 'users':
        return mockUserActivityData.map(d => ({ label: d.date, value: d.activeUsers }));
      case 'requests':
        return mockUserActivityData.map(d => ({ label: d.date, value: d.totalRequests }));
      case 'tokens':
        return mockUserActivityData.map(d => ({ label: d.date, value: d.tokensUsed }));
      default:
        return [];
    }
  };

  // 计算统计数据
  const statistics = useMemo(() => {
    const totalUsers = state.registeredUsers.length;
    const activeUsers = state.registeredUsers.filter(u => u.lastRequestAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length;
    const totalRequests = state.registeredUsers.reduce((sum, u) => sum + u.requestCount, 0);
    const totalTokensUsed = state.registeredUsers.reduce((sum, u) => sum + u.tokensUsed, 0);
    const totalTokensQuota = state.registeredUsers.reduce((sum, u) => sum + u.tokenQuota, 0);

    return {
      totalUsers,
      activeUsers,
      totalRequests,
      totalTokensUsed,
      totalTokensQuota,
      averageUsagePerUser: totalUsers > 0 ? Math.round(totalTokensUsed / totalUsers) : 0,
      quotaUtilization: totalTokensQuota > 0 ? Math.round((totalTokensUsed / totalTokensQuota) * 100) : 0,
    };
  }, [state.registeredUsers]);

  // 简单的条形图组件
  const SimpleBarChart: React.FC<{ data: DataPoint[]; color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <div className="space-y-2">
        {data.slice(-7).map((point, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-16 text-xs text-zinc-500 font-mono">
              {new Date(point.label).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </div>
            <div className="flex-1 bg-zinc-100 rounded-full h-6 relative overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-500 rounded-full`}
                style={{ width: `${(point.value / maxValue) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-zinc-700">
                  {point.value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 饼图组件
  const PieChart: React.FC<{ data: Array<{ label: string; value: number; color: string }> }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${item.color}`} />
              <span className="text-sm text-zinc-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900">{item.value}</span>
              <span className="text-xs text-zinc-500">
                ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-zinc-600 p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <Icons.Database />
            {language === 'zh' ? '系统分析' : 'System Analytics'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
            {language === 'zh' ? '系统使用统计和趋势分析' : 'System usage statistics and trend analysis'}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
        >
          {language === 'zh' ? '关闭' : 'Close'}
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {language === 'zh' ? '总用户' : 'Total Users'}
            </span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mb-1">
            {statistics.totalUsers}
          </div>
          <div className="text-xs text-zinc-500">
            {statistics.activeUsers} {language === 'zh' ? '活跃用户' : 'active users'}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {language === 'zh' ? '总请求' : 'Total Requests'}
            </span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mb-1">
            {statistics.totalRequests.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">
            {language === 'zh' ? '累计请求次数' : 'Cumulative requests'}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {language === 'zh' ? 'Token使用' : 'Tokens Used'}
            </span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mb-1">
            {statistics.totalTokensUsed.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">
            {language === 'zh' ? '配额利用率' : 'Quota utilization'}: {statistics.quotaUtilization}%
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {language === 'zh' ? '平均使用' : 'Avg Usage'}
            </span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mb-1">
            {statistics.averageUsagePerUser.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">
            {language === 'zh' ? '每用户平均Token' : 'Tokens per user'}
          </div>
        </div>
      </div>

      {/* DEMO DATA 警告横幅 */}
      <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-800">
              {language === 'zh' ? '演示数据 - 趋势分析' : 'DEMO DATA - Trend Analysis'}
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {language === 'zh' 
                ? '趋势图表显示的是模拟数据。真实历史活动数据功能正在开发中。'
                : 'Trend charts show simulated data. Real historical activity data is under development.'}
            </p>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm relative opacity-75">
          {/* 演示数据指示器 */}
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-full">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-xs text-yellow-800 font-medium">
                {language === 'zh' ? '演示数据' : 'Demo Data'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900 opacity-70">
              {language === 'zh' ? '用户活动趋势' : 'User Activity Trends'}
            </h2>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    selectedPeriod === period
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {period === '7d' ? (language === 'zh' ? '7天' : '7d') : 
                   period === '30d' ? (language === 'zh' ? '30天' : '30d') : 
                   (language === 'zh' ? '90天' : '90d')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {[
              { key: 'users', label: language === 'zh' ? '活跃用户' : 'Active Users', color: 'bg-blue-500' },
              { key: 'requests', label: language === 'zh' ? '请求数' : 'Requests', color: 'bg-green-500' },
              { key: 'tokens', label: language === 'zh' ? 'Token使用' : 'Token Usage', color: 'bg-orange-500' },
            ].map(metric => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key as any)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  selectedMetric === metric.key
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>

          <div className="opacity-60">
            <SimpleBarChart data={getCurrentData()} color="bg-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">
            {language === 'zh' ? '用户类型分布' : 'User Role Distribution'}
          </h2>
          <PieChart
            data={[
              { label: language === 'zh' ? '管理员' : 'Admin', value: userRoleDistribution.find(d => d.role === 'admin')?.count || 0, color: 'bg-red-500' },
              { label: language === 'zh' ? '研究员' : 'Researcher', value: userRoleDistribution.find(d => d.role === 'researcher')?.count || 0, color: 'bg-blue-500' },
              { label: language === 'zh' ? '普通用户' : 'Regular User', value: userRoleDistribution.find(d => d.role === 'user')?.count || 0, color: 'bg-green-500' },
              { label: language === 'zh' ? '临时用户' : 'Temp User', value: userRoleDistribution.find(d => d.role === 'temp')?.count || 0, color: 'bg-orange-500' },
            ]}
          />
        </div>
      </div>

      {/* 配额使用分布 */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-6">
          {language === 'zh' ? '配额使用分布' : 'Quota Usage Distribution'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-700 mb-4">
              {language === 'zh' ? '使用率区间' : 'Usage Ranges'}
            </h3>
            <PieChart
              data={quotaUsageDistribution.map(range => ({
                label: range.label,
                value: range.count,
                color: range.color,
              }))}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-700 mb-4">
              {language === 'zh' ? '详细统计' : 'Detailed Statistics'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">{language === 'zh' ? '低使用率 (0-25%)' : 'Low Usage (0-25%)'}</span>
                <span className="font-medium text-zinc-900">
                  {quotaUsageDistribution.find(d => d.min === 0)?.count || 0} {language === 'zh' ? '用户' : 'users'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">{language === 'zh' ? '中等使用率 (26-75%)' : 'Medium Usage (26-75%)'}</span>
                <span className="font-medium text-zinc-900">
                  {(quotaUsageDistribution.find(d => d.min === 26)?.count || 0) + (quotaUsageDistribution.find(d => d.min === 51)?.count || 0)} {language === 'zh' ? '用户' : 'users'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">{language === 'zh' ? '高使用率 (76-100%)' : 'High Usage (76-100%)'}</span>
                <span className="font-medium text-zinc-900">
                  {quotaUsageDistribution.find(d => d.min === 76)?.count || 0} {language === 'zh' ? '用户' : 'users'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
