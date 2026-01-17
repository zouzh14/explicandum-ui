import React, { useState, useMemo } from 'react';
import { AppState } from '../../types';
import { Icons } from '../../constants';
import { Language } from '../../i18n';

interface BackupRestorePageProps {
  state: AppState;
  language: Language;
  onClose: () => void;
}

// 备份记录类型
interface BackupRecord {
  id: string;
  timestamp: number;
  type: 'full' | 'incremental' | 'partial';
  size: number;
  status: 'completed' | 'failed' | 'in_progress';
  description: string;
  includes: string[];
}

const BackupRestorePage: React.FC<BackupRestorePageProps> = ({ state, language, onClose }) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'partial'>('full');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([
    'users', 'sessions', 'stances', 'files', 'settings'
  ]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  // 模拟备份数据
  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([
    {
      id: 'backup_1',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      type: 'full',
      size: 15728640, // 15MB
      status: 'completed',
      description: language === 'zh' ? '完整系统备份' : 'Full system backup',
      includes: ['users', 'sessions', 'stances', 'files', 'settings']
    },
    {
      id: 'backup_2',
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      type: 'incremental',
      size: 5242880, // 5MB
      status: 'completed',
      description: language === 'zh' ? '增量备份' : 'Incremental backup',
      includes: ['sessions', 'stances']
    },
    {
      id: 'backup_3',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      type: 'partial',
      size: 10485760, // 10MB
      status: 'completed',
      description: language === 'zh' ? '用户数据备份' : 'User data backup',
      includes: ['users', 'sessions']
    }
  ]);

  // 备份组件选项
  const backupComponents = [
    { id: 'users', label: language === 'zh' ? '用户数据' : 'User Data', description: language === 'zh' ? '用户账户和权限' : 'User accounts and permissions' },
    { id: 'sessions', label: language === 'zh' ? '会话数据' : 'Session Data', description: language === 'zh' ? '聊天会话历史' : 'Chat session history' },
    { id: 'stances', label: language === 'zh' ? '立场数据' : 'Stance Data', description: language === 'zh' ? '哲学立场库' : 'Philosophical stance library' },
    { id: 'files', label: language === 'zh' ? '文件数据' : 'File Data', description: language === 'zh' ? '上传的文件' : 'Uploaded files' },
    { id: 'settings', label: language === 'zh' ? '系统设置' : 'System Settings', description: language === 'zh' ? '配置和设置' : 'Configuration and settings' }
  ];

  // 计算备份统计
  const backupStats = useMemo(() => {
    const totalUsers = state.registeredUsers.length;
    const totalSessions = state.sessions.length;
    const totalStances = state.personalPhilosophyLibrary.length;
    const totalFiles = state.fileLibrary.length;
    const estimatedSize = Math.round(
      (JSON.stringify(state.registeredUsers).length + 
       JSON.stringify(state.sessions).length + 
       JSON.stringify(state.personalPhilosophyLibrary).length + 
       JSON.stringify(state.fileLibrary).length) / 1024
    ); // KB

    return {
      users: totalUsers,
      sessions: totalSessions,
      stances: totalStances,
      files: totalFiles,
      estimatedSize,
      lastBackup: backupHistory.length > 0 ? backupHistory[0].timestamp : null
    };
  }, [state, backupHistory]);

  // 创建备份
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      // 模拟备份进度
      const steps = [
        { progress: 10, message: language === 'zh' ? '准备备份...' : 'Preparing backup...' },
        { progress: 30, message: language === 'zh' ? '收集数据...' : 'Collecting data...' },
        { progress: 50, message: language === 'zh' ? '压缩数据...' : 'Compressing data...' },
        { progress: 70, message: language === 'zh' ? '验证完整性...' : 'Verifying integrity...' },
        { progress: 90, message: language === 'zh' ? '生成文件...' : 'Generating file...' },
        { progress: 100, message: language === 'zh' ? '备份完成' : 'Backup completed' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setBackupProgress(step.progress);
      }

      // 生成备份数据
      const backupData = {
        version: '1.0.0',
        timestamp: Date.now(),
        type: backupType,
        components: selectedComponents,
        data: {
          users: selectedComponents.includes('users') ? state.registeredUsers : [],
          sessions: selectedComponents.includes('sessions') ? state.sessions : [],
          stances: selectedComponents.includes('stances') ? state.personalPhilosophyLibrary : [],
          files: selectedComponents.includes('files') ? state.fileLibrary : [],
          settings: selectedComponents.includes('settings') ? {
            language: state.language,
            rightSidebarOpen: state.rightSidebarOpen,
            leftToolsCollapsed: state.leftToolsCollapsed
          } : {}
        },
        metadata: {
          totalUsers: state.registeredUsers.length,
          totalSessions: state.sessions.length,
          totalStances: state.personalPhilosophyLibrary.length,
          totalFiles: state.fileLibrary.length
        }
      };

      // 创建并下载备份文件
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${backupType}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 添加到备份历史
      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: backupType,
        size: blob.size,
        status: 'completed',
        description: `${backupType} backup - ${selectedComponents.join(', ')}`,
        includes: selectedComponents
      };

      setBackupHistory(prev => [newBackup, ...prev]);

    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  // 恢复备份
  const handleRestore = async () => {
    if (!restoreFile) return;

    setIsRestoring(true);
    setRestoreProgress(0);

    try {
      // 读取备份文件
      const fileContent = await restoreFile.text();
      const backupData = JSON.parse(fileContent);

      // 模拟恢复进度
      const steps = [
        { progress: 10, message: language === 'zh' ? '验证备份文件...' : 'Verifying backup file...' },
        { progress: 30, message: language === 'zh' ? '准备恢复...' : 'Preparing restore...' },
        { progress: 50, message: language === 'zh' ? '恢复用户数据...' : 'Restoring user data...' },
        { progress: 70, message: language === 'zh' ? '恢复会话数据...' : 'Restoring session data...' },
        { progress: 90, message: language === 'zh' ? '验证数据完整性...' : 'Verifying data integrity...' },
        { progress: 100, message: language === 'zh' ? '恢复完成' : 'Restore completed' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setRestoreProgress(step.progress);
      }

      // 这里应该调用实际的恢复逻辑
      console.log('Backup data to restore:', backupData);

    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setIsRestoring(false);
      setRestoreProgress(0);
    }
  };

  // 删除备份记录
  const handleDeleteBackup = (backupId: string) => {
    setBackupHistory(prev => prev.filter(backup => backup.id !== backupId));
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-zinc-600 p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <Icons.Database />
            {language === 'zh' ? '备份与恢复' : 'Backup & Restore'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
            {language === 'zh' ? '系统数据备份和恢复管理' : 'System data backup and restore management'}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
        >
          {language === 'zh' ? '关闭' : 'Close'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-zinc-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'backup'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
          </svg>
          {language === 'zh' ? '创建备份' : 'Create Backup'}
        </button>
        <button
          onClick={() => setActiveTab('restore')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'restore'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {language === 'zh' ? '恢复备份' : 'Restore Backup'}
        </button>
      </div>

      {activeTab === 'backup' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：备份配置 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 备份统计 */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                {language === 'zh' ? '备份统计' : 'Backup Statistics'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-zinc-50 rounded-lg">
                  <div className="text-2xl font-bold text-zinc-900">{backupStats.users}</div>
                  <div className="text-sm text-zinc-600">{language === 'zh' ? '用户' : 'Users'}</div>
                </div>
                <div className="text-center p-4 bg-zinc-50 rounded-lg">
                  <div className="text-2xl font-bold text-zinc-900">{backupStats.sessions}</div>
                  <div className="text-sm text-zinc-600">{language === 'zh' ? '会话' : 'Sessions'}</div>
                </div>
                <div className="text-center p-4 bg-zinc-50 rounded-lg">
                  <div className="text-2xl font-bold text-zinc-900">{backupStats.files}</div>
                  <div className="text-sm text-zinc-600">{language === 'zh' ? '文件' : 'Files'}</div>
                </div>
                <div className="text-center p-4 bg-zinc-50 rounded-lg">
                  <div className="text-2xl font-bold text-zinc-900">{formatFileSize(backupStats.estimatedSize * 1024)}</div>
                  <div className="text-sm text-zinc-600">{language === 'zh' ? '预估大小' : 'Est. Size'}</div>
                </div>
              </div>
              {backupStats.lastBackup && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">
                      {language === 'zh' ? '上次备份' : 'Last Backup'}
                    </span>
                    <span className="text-sm font-medium text-green-900">
                      {formatTime(backupStats.lastBackup)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 备份选项 */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                {language === 'zh' ? '备份选项' : 'Backup Options'}
              </h2>

              {/* 备份类型 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {language === 'zh' ? '备份类型' : 'Backup Type'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { 
                      value: 'full', 
                      label: language === 'zh' ? '完整备份' : 'Full Backup',
                      desc: language === 'zh' ? '所有数据' : 'All data'
                    },
                    { 
                      value: 'incremental', 
                      label: language === 'zh' ? '增量备份' : 'Incremental',
                      desc: language === 'zh' ? '仅变更' : 'Changes only'
                    },
                    { 
                      value: 'partial', 
                      label: language === 'zh' ? '部分备份' : 'Partial',
                      desc: language === 'zh' ? '选定组件' : 'Selected components'
                    }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setBackupType(type.value as any)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        backupType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-zinc-500">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 组件选择 */}
              {backupType === 'partial' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    {language === 'zh' ? '选择组件' : 'Select Components'}
                  </label>
                  <div className="space-y-2">
                    {backupComponents.map(component => (
                      <label key={component.id} className="flex items-start gap-3 p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedComponents.includes(component.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedComponents(prev => [...prev, component.id]);
                            } else {
                              setSelectedComponents(prev => prev.filter(id => id !== component.id));
                            }
                          }}
                          className="mt-1 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-sm text-zinc-900">{component.label}</div>
                          <div className="text-xs text-zinc-500">{component.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 创建备份按钮 */}
              <div className="flex justify-end">
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup || (backupType === 'partial' && selectedComponents.length === 0)}
                  className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingBackup ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {language === 'zh' ? '备份中...' : 'Creating backup...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                      </svg>
                      {language === 'zh' ? '创建备份' : 'Create Backup'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 备份进度 */}
            {isCreatingBackup && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-700">
                    {language === 'zh' ? '备份进度' : 'Backup Progress'}
                  </span>
                  <span className="text-sm text-zinc-600">{backupProgress}%</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${backupProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 右侧：备份历史 */}
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                {language === 'zh' ? '备份历史' : 'Backup History'}
              </h2>
              <div className="space-y-3">
                {backupHistory.map(backup => (
                  <div key={backup.id} className="p-3 border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          backup.status === 'completed' ? 'bg-green-500' : 
                          backup.status === 'failed' ? 'bg-red-500' : 'bg-orange-500'
                        }`} />
                        <span className="text-sm font-medium text-zinc-900">
                          {backup.type.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-zinc-600 mb-1">
                      {formatTime(backup.timestamp)}
                    </div>
                    <div className="text-xs text-zinc-500 mb-2">
                      {backup.description}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">
                        {formatFileSize(backup.size)}
                      </span>
                      <span className={`text-xs font-medium ${
                        backup.status === 'completed' ? 'text-green-600' : 
                        backup.status === 'failed' ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {backup.status === 'completed' ? (language === 'zh' ? '完成' : 'Completed') :
                         backup.status === 'failed' ? (language === 'zh' ? '失败' : 'Failed') :
                         (language === 'zh' ? '进行中' : 'In Progress')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">
              {language === 'zh' ? '恢复备份' : 'Restore Backup'}
            </h2>

            {/* 文件上传 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {language === 'zh' ? '选择备份文件' : 'Select Backup File'}
              </label>
              <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center hover:border-zinc-400 transition-colors">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="restore-file"
                />
                <label htmlFor="restore-file" className="cursor-pointer">
                  <svg className="w-12 h-12 mx-auto mb-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-zinc-600 mb-2">
                    {language === 'zh' ? '点击选择或拖拽文件到此处' : 'Click to select or drag file here'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {language === 'zh' ? '支持 .json 格式的备份文件' : 'Supports .json backup files'}
                  </p>
                </label>
              </div>
              {restoreFile && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-blue-800 font-medium">{restoreFile.name}</span>
                    </div>
                    <button
                      onClick={() => setRestoreFile(null)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {formatFileSize(restoreFile.size)}
                  </div>
                </div>
              )}
            </div>

            {/* 恢复选项 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-700 mb-3">
                {language === 'zh' ? '恢复选项' : 'Restore Options'}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-zinc-900">
                      {language === 'zh' ? '覆盖现有数据' : 'Overwrite Existing Data'}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {language === 'zh' ? '替换当前系统中的数据' : 'Replace current system data'}
                    </div>
                  </div>
                  <input type="checkbox" className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                </label>
                <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-zinc-900">
                      {language === 'zh' ? '创建恢复前备份' : 'Backup Before Restore'}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {language === 'zh' ? '在恢复前自动创建当前状态备份' : 'Auto-backup current state before restore'}
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                </label>
              </div>
            </div>

            {/* 恢复按钮 */}
            <div className="flex justify-end">
              <button
                onClick={handleRestore}
                disabled={!restoreFile || isRestoring}
                className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRestoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {language === 'zh' ? '恢复中...' : 'Restoring...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {language === 'zh' ? '开始恢复' : 'Start Restore'}
                  </>
                )}
              </button>
            </div>

            {/* 恢复进度 */}
            {isRestoring && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-700">
                    {language === 'zh' ? '恢复进度' : 'Restore Progress'}
                  </span>
                  <span className="text-sm text-zinc-600">{restoreProgress}%</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${restoreProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestorePage;
