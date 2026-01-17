import React, { useState, useMemo } from 'react';
import { AppState, User, ChatSession, Message, PhilosophicalStance, FileAttachment } from '../../types';
import { Icons } from '../../constants';
import { Language } from '../../i18n';

interface DataExportPageProps {
  state: AppState;
  language: Language;
  onClose: () => void;
}

// 导出选项类型
interface ExportOptions {
  dataType: 'users' | 'sessions' | 'stances' | 'files' | 'all';
  format: 'json' | 'csv' | 'xlsx';
  dateRange: {
    start: string;
    end: string;
  };
  includeSensitive: boolean;
  compression: boolean;
}

const DataExportPage: React.FC<DataExportPageProps> = ({ state, language, onClose }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dataType: 'all',
    format: 'json',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeSensitive: false,
    compression: false
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    timestamp: number;
    dataType: string;
    format: string;
    fileSize: number;
    status: 'completed' | 'failed';
  }>>([]);

  // 计算数据统计
  const dataStats = useMemo(() => {
    const filteredSessions = state.sessions.filter(session => {
      const sessionDate = new Date(session.createdAt).toISOString().split('T')[0];
      return sessionDate >= exportOptions.dateRange.start && sessionDate <= exportOptions.dateRange.end;
    });

    const filteredStances = state.personalPhilosophyLibrary.filter(stance => {
      const stanceDate = new Date(stance.timestamp).toISOString().split('T')[0];
      return stanceDate >= exportOptions.dateRange.start && stanceDate <= exportOptions.dateRange.end;
    });

    const totalMessages = filteredSessions.reduce((sum, session) => sum + session.messages.length, 0);
    const totalTokens = filteredSessions.reduce((sum, session) => 
      sum + session.messages.reduce((msgSum, msg) => msgSum + (msg.tokensConsumed || 0), 0), 0
    );

    return {
      users: state.registeredUsers.length,
      sessions: filteredSessions.length,
      messages: totalMessages,
      stances: filteredStances.length,
      files: state.fileLibrary.length,
      tokens: totalTokens,
      estimatedSize: Math.round((JSON.stringify(filteredSessions).length + JSON.stringify(filteredStances).length) / 1024) // KB
    };
  }, [state, exportOptions.dateRange]);

  // 模拟导出功能
  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // 模拟导出进度
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(i);
      }

      // 模拟生成导出数据
      let exportData: any = {};
      let fileName = '';
      let mimeType = '';

      switch (exportOptions.dataType) {
        case 'users':
          exportData = {
            users: state.registeredUsers.map(user => ({
              id: user.id,
              username: user.username,
              role: user.role,
              registrationIp: user.registrationIp,
              createdAt: user.createdAt,
              isTemp: user.isTemp,
              tokenQuota: user.tokenQuota,
              tokensUsed: user.tokensUsed,
              requestCount: user.requestCount,
              lastRequestAt: user.lastRequestAt,
              ...(exportOptions.includeSensitive && { password: user.password })
            })),
            exportedAt: Date.now(),
            totalCount: state.registeredUsers.length
          };
          fileName = `users_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'sessions':
          const filteredSessions = state.sessions.filter(session => {
            const sessionDate = new Date(session.createdAt).toISOString().split('T')[0];
            return sessionDate >= exportOptions.dateRange.start && sessionDate <= exportOptions.dateRange.end;
          });
          exportData = {
            sessions: filteredSessions,
            exportedAt: Date.now(),
            totalCount: filteredSessions.length,
            dateRange: exportOptions.dateRange
          };
          fileName = `sessions_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'stances':
          const filteredStances = state.personalPhilosophyLibrary.filter(stance => {
            const stanceDate = new Date(stance.timestamp).toISOString().split('T')[0];
            return stanceDate >= exportOptions.dateRange.start && stanceDate <= exportOptions.dateRange.end;
          });
          exportData = {
            stances: filteredStances,
            exportedAt: Date.now(),
            totalCount: filteredStances.length,
            dateRange: exportOptions.dateRange
          };
          fileName = `stances_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'files':
          exportData = {
            files: state.fileLibrary.map(file => ({
              id: file.id,
              name: file.name,
              type: file.type,
              size: file.size,
              isIndexed: file.isIndexed,
              chunks: file.chunks,
              timestamp: file.timestamp,
              ...(exportOptions.includeSensitive && { content: file.content })
            })),
            exportedAt: Date.now(),
            totalCount: state.fileLibrary.length
          };
          fileName = `files_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'all':
          const allFilteredSessions = state.sessions.filter(session => {
            const sessionDate = new Date(session.createdAt).toISOString().split('T')[0];
            return sessionDate >= exportOptions.dateRange.start && sessionDate <= exportOptions.dateRange.end;
          });
          const allFilteredStances = state.personalPhilosophyLibrary.filter(stance => {
            const stanceDate = new Date(stance.timestamp).toISOString().split('T')[0];
            return stanceDate >= exportOptions.dateRange.start && stanceDate <= exportOptions.dateRange.end;
          });
          exportData = {
            users: state.registeredUsers.map(user => ({
              id: user.id,
              username: user.username,
              role: user.role,
              registrationIp: user.registrationIp,
              createdAt: user.createdAt,
              isTemp: user.isTemp,
              tokenQuota: user.tokenQuota,
              tokensUsed: user.tokensUsed,
              requestCount: user.requestCount,
              lastRequestAt: user.lastRequestAt,
              ...(exportOptions.includeSensitive && { password: user.password })
            })),
            sessions: allFilteredSessions,
            stances: allFilteredStances,
            files: state.fileLibrary.map(file => ({
              id: file.id,
              name: file.name,
              type: file.type,
              size: file.size,
              isIndexed: file.isIndexed,
              chunks: file.chunks,
              timestamp: file.timestamp,
              ...(exportOptions.includeSensitive && { content: file.content })
            })),
            exportedAt: Date.now(),
            summary: {
              totalUsers: state.registeredUsers.length,
              totalSessions: allFilteredSessions.length,
              totalStances: allFilteredStances.length,
              totalFiles: state.fileLibrary.length,
              dateRange: exportOptions.dateRange
            }
          };
          fileName = `full_export_${new Date().toISOString().split('T')[0]}`;
          break;
      }

      // 根据格式处理数据
      let finalData: string | Blob;
      let fileSize: number;

      switch (exportOptions.format) {
        case 'json':
          finalData = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          fileSize = new Blob([finalData]).size;
          break;
        case 'csv':
          // 简化的CSV转换（实际项目中需要更复杂的处理）
          finalData = convertToCSV(exportData);
          mimeType = 'text/csv';
          fileSize = new Blob([finalData]).size;
          break;
        case 'xlsx':
          // 模拟XLSX格式（实际项目中需要使用xlsx库）
          finalData = JSON.stringify(exportData);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileSize = new Blob([finalData]).size;
          break;
        default:
          finalData = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          fileSize = new Blob([finalData]).size;
      }

      // 下载文件
      const blob = new Blob([finalData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.${exportOptions.format}${exportOptions.compression ? '.zip' : ''}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 添加到导出历史
      setExportHistory(prev => [{
        id: Date.now().toString(),
        timestamp: Date.now(),
        dataType: exportOptions.dataType,
        format: exportOptions.format,
        fileSize,
        status: 'completed'
      }, ...prev.slice(0, 9)]); // 保留最近10条记录

    } catch (error) {
      console.error('Export failed:', error);
      setExportHistory(prev => [{
        id: Date.now().toString(),
        timestamp: Date.now(),
        dataType: exportOptions.dataType,
        format: exportOptions.format,
        fileSize: 0,
        status: 'failed'
      }, ...prev.slice(0, 9)]);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // 简化的CSV转换函数
  const convertToCSV = (data: any): string => {
    if (data.users) {
      const headers = ['ID', 'Username', 'Role', 'Registration IP', 'Created At', 'Is Temp', 'Token Quota', 'Tokens Used', 'Request Count'];
      const rows = data.users.map((user: any) => [
        user.id,
        user.username,
        user.role,
        user.registrationIp,
        new Date(user.createdAt).toISOString(),
        user.isTemp,
        user.tokenQuota,
        user.tokensUsed,
        user.requestCount
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    return JSON.stringify(data);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-zinc-600 p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <Icons.Database />
            {language === 'zh' ? '数据导出' : 'Data Export'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
            {language === 'zh' ? '导出系统数据和分析报告' : 'Export system data and analysis reports'}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
        >
          {language === 'zh' ? '关闭' : 'Close'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：导出配置 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 数据统计 */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">
              {language === 'zh' ? '数据统计' : 'Data Statistics'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-zinc-50 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900">{dataStats.users}</div>
                <div className="text-sm text-zinc-600">{language === 'zh' ? '用户' : 'Users'}</div>
              </div>
              <div className="text-center p-4 bg-zinc-50 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900">{dataStats.sessions}</div>
                <div className="text-sm text-zinc-600">{language === 'zh' ? '会话' : 'Sessions'}</div>
              </div>
              <div className="text-center p-4 bg-zinc-50 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900">{dataStats.messages}</div>
                <div className="text-sm text-zinc-600">{language === 'zh' ? '消息' : 'Messages'}</div>
              </div>
              <div className="text-center p-4 bg-zinc-50 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900">{dataStats.stances}</div>
                <div className="text-sm text-zinc-600">{language === 'zh' ? '立场' : 'Stances'}</div>
              </div>
              <div className="text-center p-4 bg-zinc-50 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900">{dataStats.files}</div>
                <div className="text-sm text-zinc-600">{language === 'zh' ? '文件' : 'Files'}</div>
              </div>
              <div className="text-center p-4 bg-zinc-50 rounded-lg">
                <div className="text-2xl font-bold text-zinc-900">{dataStats.tokens.toLocaleString()}</div>
                <div className="text-sm text-zinc-600">{language === 'zh' ? 'Token' : 'Tokens'}</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {language === 'zh' ? '预估文件大小' : 'Estimated File Size'}
                </span>
                <span className="text-sm font-bold text-blue-900">
                  {formatFileSize(dataStats.estimatedSize * 1024)}
                </span>
              </div>
            </div>
          </div>

          {/* 导出选项 */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">
              {language === 'zh' ? '导出选项' : 'Export Options'}
            </h2>
            
            <div className="space-y-6">
              {/* 数据类型 */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {language === 'zh' ? '数据类型' : 'Data Type'}
                </label>
                <select
                  value={exportOptions.dataType}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, dataType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{language === 'zh' ? '全部数据' : 'All Data'}</option>
                  <option value="users">{language === 'zh' ? '用户数据' : 'Users'}</option>
                  <option value="sessions">{language === 'zh' ? '会话数据' : 'Sessions'}</option>
                  <option value="stances">{language === 'zh' ? '立场数据' : 'Philosophical Stances'}</option>
                  <option value="files">{language === 'zh' ? '文件数据' : 'Files'}</option>
                </select>
              </div>

              {/* 导出格式 */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {language === 'zh' ? '导出格式' : 'Export Format'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'json', label: 'JSON', desc: language === 'zh' ? '结构化数据' : 'Structured data' },
                    { value: 'csv', label: 'CSV', desc: language === 'zh' ? '表格数据' : 'Tabular data' },
                    { value: 'xlsx', label: 'Excel', desc: language === 'zh' ? '电子表格' : 'Spreadsheet' }
                  ].map(format => (
                    <button
                      key={format.value}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        exportOptions.format === format.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-zinc-500">{format.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 日期范围 */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {language === 'zh' ? '日期范围' : 'Date Range'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">
                      {language === 'zh' ? '开始日期' : 'Start Date'}
                    </label>
                    <input
                      type="date"
                      value={exportOptions.dateRange.start}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">
                      {language === 'zh' ? '结束日期' : 'End Date'}
                    </label>
                    <input
                      type="date"
                      value={exportOptions.dateRange.end}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* 高级选项 */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {language === 'zh' ? '高级选项' : 'Advanced Options'}
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-zinc-700">
                        {language === 'zh' ? '包含敏感信息' : 'Include Sensitive Data'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {language === 'zh' ? '包含密码等敏感信息' : 'Include passwords and other sensitive data'}
                      </div>
                    </div>
                    <button
                      onClick={() => setExportOptions(prev => ({ ...prev, includeSensitive: !prev.includeSensitive }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        exportOptions.includeSensitive ? 'bg-blue-600' : 'bg-zinc-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          exportOptions.includeSensitive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-zinc-700">
                        {language === 'zh' ? '压缩文件' : 'Compress File'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {language === 'zh' ? '导出为ZIP压缩文件' : 'Export as ZIP compressed file'}
                      </div>
                    </div>
                    <button
                      onClick={() => setExportOptions(prev => ({ ...prev, compression: !prev.compression }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        exportOptions.compression ? 'bg-blue-600' : 'bg-zinc-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          exportOptions.compression ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 导出按钮 */}
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === 'zh' ? '导出中...' : 'Exporting...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {language === 'zh' ? '开始导出' : 'Start Export'}
                </>
              )}
            </button>
          </div>

          {/* 导出进度 */}
          {isExporting && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700">
                  {language === 'zh' ? '导出进度' : 'Export Progress'}
                </span>
                <span className="text-sm text-zinc-600">{exportProgress}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 右侧：导出历史 */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">
              {language === 'zh' ? '导出历史' : 'Export History'}
            </h2>
            {exportHistory.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">{language === 'zh' ? '暂无导出记录' : 'No export history'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exportHistory.map(record => (
                  <div key={record.id} className="p-3 border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          record.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium text-zinc-900">
                          {record.dataType.toUpperCase()}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {record.format.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">
                        {formatFileSize(record.fileSize)}
                      </span>
                      <span className={`text-xs font-medium ${
                        record.status === 'completed' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.status === 'completed' 
                          ? (language === 'zh' ? '成功' : 'Success')
                          : (language === 'zh' ? '失败' : 'Failed')
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 快速操作 */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">
              {language === 'zh' ? '快速操作' : 'Quick Actions'}
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setExportOptions(prev => ({ ...prev, dataType: 'all', format: 'json' }))}
                className="w-full p-3 text-left border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div className="font-medium text-sm text-zinc-900">
                  {language === 'zh' ? '导出全部数据' : 'Export All Data'}
                </div>
                <div className="text-xs text-zinc-500">
                  {language === 'zh' ? 'JSON格式，包含所有数据' : 'JSON format, includes all data'}
                </div>
              </button>
              <button
                onClick={() => setExportOptions(prev => ({ 
                  ...prev, 
                  dataType: 'sessions', 
                  format: 'csv',
                  dateRange: {
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                  }
                }))}
                className="w-full p-3 text-left border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div className="font-medium text-sm text-zinc-900">
                  {language === 'zh' ? '导出本周会话' : 'Export This Week\'s Sessions'}
                </div>
                <div className="text-xs text-zinc-500">
                  {language === 'zh' ? 'CSV格式，最近7天' : 'CSV format, last 7 days'}
                </div>
              </button>
              <button
                onClick={() => setExportOptions(prev => ({ 
                  ...prev, 
                  dataType: 'users', 
                  format: 'xlsx',
                  includeSensitive: false
                }))}
                className="w-full p-3 text-left border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div className="font-medium text-sm text-zinc-900">
                  {language === 'zh' ? '导出用户报告' : 'Export User Report'}
                </div>
                <div className="text-xs text-zinc-500">
                  {language === 'zh' ? 'Excel格式，不含敏感信息' : 'Excel format, no sensitive data'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportPage;
