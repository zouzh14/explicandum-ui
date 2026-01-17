import React from 'react';
import { AppState } from '../../types';
import { Language } from '../../i18n';

interface RecentActivitySectionProps {
  state: AppState;
  language: Language;
}

/**
 * RecentActivitySection - 最近活动监控组件
 * 
 * 功能状态分析：
 * 🎭 演示数据：
 * - 所有活动记录都是硬编码的模拟数据
 * - 用户注册、Token使用、会话创建、文件上传、管理员操作都是预设的示例
 * - 时间戳都是相对当前时间的固定偏移
 * - 用户名和详细信息都是虚构的
 * 
 * ✅ 真实功能：
 * - 活动类型分类和图标显示逻辑
 * - 时间格式化（刚刚/分钟前/小时前/天前）
 * - 活动列表的UI渲染和交互
 * - 颜色主题和样式设计
 * 
 * TODO: 需要实现的功能
 * 1. 连接真实的活动日志API获取实际用户活动
 * 2. 实现实时活动流更新（WebSocket或Server-Sent Events）
 * 3. 添加活动过滤和搜索功能
 * 4. 实现活动详情弹窗查看
 * 5. 添加活动分页和无限滚动
 * 6. 实现活动类型自定义配置
 * 7. 添加活动导出功能
 * 8. 实现活动统计和分析
 * 9. 添加活动告警和异常检测
 * 10. 实现活动回放和时间轴视图
 */
const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ state, language }) => {
  // TODO: 演示数据 - 需要连接真实活动日志API
  const recentActivities = [
    {
      id: 1,
      type: 'user_registration' as const,
      user: 'Guest_8f2a',
      action: language === 'zh' ? '注册为临时用户' : 'Registered as temporary user',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5分钟前
      details: 'IP: 192.168.1.100'
    },
    {
      id: 2,
      type: 'token_usage' as const,
      user: 'researcher_001',
      action: language === 'zh' ? '使用大量Token' : 'High token usage',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15分钟前
      details: language === 'zh' ? '消耗 15,000 tokens' : 'Consumed 15,000 tokens'
    },
    {
      id: 3,
      type: 'session_created' as const,
      user: 'student_2024',
      action: language === 'zh' ? '创建新会话' : 'Created new session',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
      details: language === 'zh' ? '会话ID: s_abc123' : 'Session ID: s_abc123'
    },
    {
      id: 4,
      type: 'file_upload' as const,
      user: 'professor_zhang',
      action: language === 'zh' ? '上传研究文档' : 'Uploaded research document',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45分钟前
      details: 'philosophy_paper.pdf'
    },
    {
      id: 5,
      type: 'admin_action' as const,
      user: 'admin',
      action: language === 'zh' ? '调整用户配额' : 'Adjusted user quota',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1小时前
      details: language === 'zh' ? '用户: student_001, +50k tokens' : 'User: student_001, +50k tokens'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'token_usage':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'session_created':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'file_upload':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'admin_action':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'text-blue-600 bg-blue-50';
      case 'token_usage':
        return 'text-orange-600 bg-orange-50';
      case 'session_created':
        return 'text-green-600 bg-green-50';
      case 'file_upload':
        return 'text-purple-600 bg-purple-50';
      case 'admin_action':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-zinc-600 bg-zinc-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return language === 'zh' ? '刚刚' : 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}${language === 'zh' ? '分钟前' : ' mins ago'}`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours}${language === 'zh' ? '小时前' : ' hours ago'}`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days}${language === 'zh' ? '天前' : ' days ago'}`;
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-zinc-900">
          {language === 'zh' ? '最近活动' : 'Recent Activity'}
        </h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          {language === 'zh' ? '查看全部活动' : 'View All Activity'} →
        </button>
      </div>
      
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden relative opacity-75">
        {/* 演示数据指示器 */}
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-full">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-xs text-orange-600 font-medium">
              {language === 'zh' ? '演示数据' : 'Demo Data'}
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-100">
          {recentActivities.map((activity) => {
            const colorClasses = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="p-4 hover:bg-zinc-50 transition-colors opacity-60">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 opacity-50 ${colorClasses}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900 opacity-70">
                          {activity.user}
                        </span>
                        <span className="text-sm text-zinc-500 opacity-60">
                          {activity.action}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 whitespace-nowrap">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-zinc-400">
                      {activity.details}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 查看更多按钮 */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100">
          <button className="w-full text-center text-sm text-zinc-400 hover:text-zinc-600 font-medium transition-colors" disabled>
            {language === 'zh' ? '加载更多活动' : 'Load More Activities'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivitySection;
