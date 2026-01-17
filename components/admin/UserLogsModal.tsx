import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { Language } from '../../i18n';

// 日志条目类型定义
interface UserLogEntry {
  id: string;
  timestamp: number;
  type: 'login' | 'logout' | 'request' | 'file_upload' | 'quota_adjustment' | 'admin_action' | 'error';
  description: string;
  details?: string;
  ipAddress: string;
  userAgent?: string;
  tokensUsed?: number;
  sessionId?: string;
}

interface UserLogsModalProps {
  user: User;
  language: Language;
  onClose: () => void;
}

/**
 * UserLogsModal - 用户日志弹窗组件
 * 
 * 功能状态分析：
 * 🎭 演示数据：
 * - mockLogs: 硬编码的用户日志条目，包含各种类型的模拟日志
 * - 所有日志数据都是预设的示例，没有从后端API获取真实用户活动日志
 * - 时间戳都是相对当前时间的固定偏移
 * - IP地址、User Agent、Session ID等都是虚构的
 * 
 * ✅ 真实功能：
 * - 日志筛选和搜索功能的UI逻辑
 * - 分页显示逻辑
 * - 日志类型分类和图标显示
 * - 时间格式化显示
 * - 响应式布局和交互效果
 * 
 * TODO: 需要实现的功能
 * 1. 连接真实的用户日志API获取实际用户活动记录
 * 2. 实现实时日志流更新（WebSocket或Server-Sent Events）
 * 3. 添加日志导出功能
 * 4. 实现日志详情弹窗查看
 * 5. 添加日志时间范围选择
 * 6. 实现日志分析和统计功能
 * 7. 添加日志异常检测和告警
 * 8. 实现日志归档和清理功能
 * 9. 添加日志权限控制和访问审计
 * 10. 实现日志搜索的高级功能（正则表达式、模糊匹配等）
 */
const UserLogsModal: React.FC<UserLogsModalProps> = ({ user, language, onClose }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  // TODO: 演示数据 - 实际项目中应该从后端获取真实用户活动日志
  const mockLogs: UserLogEntry[] = [
    {
      id: 'log_1',
      timestamp: Date.now() - 5 * 60 * 1000,
      type: 'request',
      description: language === 'zh' ? '发送聊天请求' : 'Sent chat request',
      details: 'Analyzed philosophical concept "existentialism"',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      tokensUsed: 1250,
      sessionId: 'session_abc123'
    },
    {
      id: 'log_2',
      timestamp: Date.now() - 15 * 60 * 1000,
      type: 'login',
      description: language === 'zh' ? '用户登录' : 'User login',
      details: 'Successful authentication',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 'log_3',
      timestamp: Date.now() - 30 * 60 * 1000,
      type: 'file_upload',
      description: language === 'zh' ? '上传文件' : 'File upload',
      details: 'philosophy_paper.pdf (2.3MB)',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 'log_4',
      timestamp: Date.now() - 45 * 60 * 1000,
      type: 'quota_adjustment',
      description: language === 'zh' ? '配额调整' : 'Quota adjustment',
      details: language === 'zh' ? '管理员增加配额 +50k tokens' : 'Admin increased quota +50k tokens',
      ipAddress: '192.168.1.1',
      sessionId: 'admin_session'
    },
    {
      id: 'log_5',
      timestamp: Date.now() - 60 * 60 * 1000,
      type: 'request',
      description: language === 'zh' ? '发送聊天请求' : 'Sent chat request',
      details: 'Asked about "epistemology vs ontology"',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      tokensUsed: 890,
      sessionId: 'session_xyz789'
    },
    {
      id: 'log_6',
      timestamp: Date.now() - 120 * 60 * 1000,
      type: 'error',
      description: language === 'zh' ? '请求错误' : 'Request error',
      details: 'Rate limit exceeded - too many requests',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 'log_7',
      timestamp: Date.now() - 180 * 60 * 1000,
      type: 'admin_action',
      description: language === 'zh' ? '管理员操作' : 'Admin action',
      details: language === 'zh' ? '用户角色更新为研究员' : 'User role updated to researcher',
      ipAddress: '192.168.1.1',
      sessionId: 'admin_session'
    },
    {
      id: 'log_8',
      timestamp: Date.now() - 240 * 60 * 1000,
      type: 'logout',
      description: language === 'zh' ? '用户登出' : 'User logout',
      details: 'Session ended normally',
      ipAddress: '192.168.1.100'
    }
  ];

  // 筛选日志
  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const matchesType = selectedType === 'all' || log.type === selectedType;
      const matchesSearch = searchTerm === '' || 
                           log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesType && matchesSearch;
    });
  }, [mockLogs, selectedType, searchTerm]);

  // 分页
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'login':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case 'logout':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      case 'request':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'file_upload':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'quota_adjustment':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'admin_action':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'text-green-600 bg-green-50';
      case 'logout':
        return 'text-gray-600 bg-gray-50';
      case 'request':
        return 'text-blue-600 bg-blue-50';
      case 'file_upload':
        return 'text-purple-600 bg-purple-50';
      case 'quota_adjustment':
        return 'text-orange-600 bg-orange-50';
      case 'admin_action':
        return 'text-red-600 bg-red-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              {language === 'zh' ? '用户日志' : 'User Logs'} - {user.username}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {language === 'zh' ? 'IP地址' : 'IP Address'}: {user.registrationIp}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-zinc-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'zh' ? '搜索日志内容...' : 'Search log content...'}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{language === 'zh' ? '所有类型' : 'All Types'}</option>
              <option value="login">{language === 'zh' ? '登录' : 'Login'}</option>
              <option value="logout">{language === 'zh' ? '登出' : 'Logout'}</option>
              <option value="request">{language === 'zh' ? '请求' : 'Request'}</option>
              <option value="file_upload">{language === 'zh' ? '文件上传' : 'File Upload'}</option>
              <option value="quota_adjustment">{language === 'zh' ? '配额调整' : 'Quota Adjustment'}</option>
              <option value="admin_action">{language === 'zh' ? '管理员操作' : 'Admin Action'}</option>
              <option value="error">{language === 'zh' ? '错误' : 'Error'}</option>
            </select>
          </div>
        </div>

        {/* 演示数据指示器 */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-full">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-xs text-orange-600 font-medium">
              {language === 'zh' ? '演示日志' : 'Demo Logs'}
            </span>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-hidden relative opacity-75">
          <div className="h-full overflow-y-auto">
            {paginatedLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">
                  {language === 'zh' ? '没有找到日志' : 'No logs found'}
                </p>
                <p className="text-sm mt-1">
                  {language === 'zh' ? '尝试调整筛选条件' : 'Try adjusting the filters'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {paginatedLogs.map((log) => {
                  const colorClasses = getLogTypeColor(log.type);
                  
                  return (
                    <div key={log.id} className="p-4 hover:bg-zinc-50 transition-colors opacity-60">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 opacity-50 ${colorClasses}`}>
                          {getLogTypeIcon(log.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-900 opacity-70">
                                {log.description}
                              </span>
                              {log.tokensUsed && (
                                <span className="text-xs text-zinc-400 font-mono">
                                  ({log.tokensUsed} tokens)
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-400 whitespace-nowrap">
                              {formatTime(log.timestamp)}
                            </span>
                          </div>
                          
                          {log.details && (
                            <div className="text-sm text-zinc-500 mb-2">
                              {log.details}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-zinc-300">
                            <span>IP: {log.ipAddress}</span>
                            {log.sessionId && (
                              <span>Session: {log.sessionId}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Pagination */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600">
              {language === 'zh' ? '显示' : 'Showing'} {(currentPage - 1) * logsPerPage + 1}-{Math.min(currentPage * logsPerPage, filteredLogs.length)} {language === 'zh' ? '共' : 'of'} {filteredLogs.length} {language === 'zh' ? '条日志' : 'logs'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-zinc-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
              >
                {language === 'zh' ? '上一页' : 'Previous'}
              </button>
              <span className="px-3 py-1 text-sm text-zinc-600">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 text-sm border border-zinc-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
              >
                {language === 'zh' ? '下一页' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogsModal;
