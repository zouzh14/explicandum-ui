import React, { useState } from 'react';
import { AppState } from '../../types';
import { Icons } from '../../constants';
import { Language } from '../../i18n';

interface SystemSettingsPageProps {
  state: AppState;
  language: Language;
  onClose: () => void;
}

// 系统设置类型定义
interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserQuota: number;
    tempUserQuota: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    enableTwoFactor: boolean;
    ipWhitelist: string[];
    ipBlacklist: string[];
  };
  performance: {
    maxRequestsPerMinute: number;
    maxFileSize: number;
    enableCaching: boolean;
    cacheTimeout: number;
    concurrentConnections: number;
  };
  notifications: {
    emailNotifications: boolean;
    lowQuotaThreshold: number;
    systemAlerts: boolean;
    userActivityReports: boolean;
    errorReporting: boolean;
  };
}

/**
 * SystemSettingsPage - 系统设置页面
 * 
 * 功能状态分析：
 * 🎭 演示数据：
 * - config 状态: 硬编码的默认配置值，没有从后端API加载真实配置
 * - handleSave 函数: 只是模拟保存，没有实际的API调用
 * - handleReset 函数: 重置到硬编码的默认值
 * - 所有配置更改都只在前端状态中，不会持久化
 * 
 * ✅ 真实功能：
 * - 配置界面的完整UI渲染
 * - 表单验证和状态管理
 * - 标签页切换逻辑
 * - 变更检测和状态指示
 * 
 * TODO: 需要实现的功能
 * 1. 连接真实的配置管理API获取当前系统配置
 * 2. 实现配置保存到后端的功能
 * 3. 添加配置验证和错误处理
 * 4. 实现配置变更的实时生效机制
 * 5. 添加配置历史记录和回滚功能
 * 6. 实现配置导入导出功能
 * 7. 添加敏感配置的加密存储
 * 8. 实现配置权限控制
 * 9. 添加配置变更通知和审计日志
 * 10. 实现配置模板和预设
 */
const SystemSettingsPage: React.FC<SystemSettingsPageProps> = ({ state, language, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'performance' | 'notifications'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // TODO: 演示数据 - 需要连接真实的配置管理API获取当前系统配置
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      siteName: 'Explicandum',
      siteDescription: 'Reasoning & Persistence Engine',
      maintenanceMode: false,
      allowRegistration: true,
      defaultUserQuota: 100000,
      tempUserQuota: 10000,
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      enableTwoFactor: false,
      ipWhitelist: [],
      ipBlacklist: [],
    },
    performance: {
      maxRequestsPerMinute: 60,
      maxFileSize: 10,
      enableCaching: true,
      cacheTimeout: 3600,
      concurrentConnections: 100,
    },
    notifications: {
      emailNotifications: true,
      lowQuotaThreshold: 20,
      systemAlerts: true,
      userActivityReports: false,
      errorReporting: true,
    },
  });

  const handleConfigChange = (category: keyof SystemConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // 模拟保存配置
    await new Promise(resolve => setTimeout(resolve, 1500));
    setHasChanges(false);
    setSaving(false);
    // TODO: 实际保存到后端
    console.log('Configuration saved:', config);
  };

  const handleReset = () => {
    // 重置到默认配置
    setConfig({
      general: {
        siteName: 'Explicandum',
        siteDescription: 'Reasoning & Persistence Engine',
        maintenanceMode: false,
        allowRegistration: true,
        defaultUserQuota: 100000,
        tempUserQuota: 10000,
      },
      security: {
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        enableTwoFactor: false,
        ipWhitelist: [],
        ipBlacklist: [],
      },
      performance: {
        maxRequestsPerMinute: 60,
        maxFileSize: 10,
        enableCaching: true,
        cacheTimeout: 3600,
        concurrentConnections: 100,
      },
      notifications: {
        emailNotifications: true,
        lowQuotaThreshold: 20,
        systemAlerts: true,
        userActivityReports: false,
        errorReporting: true,
      },
    });
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', label: language === 'zh' ? '常规设置' : 'General', icon: '⚙️' },
    { id: 'security', label: language === 'zh' ? '安全设置' : 'Security', icon: '🔒' },
    { id: 'performance', label: language === 'zh' ? '性能设置' : 'Performance', icon: '⚡' },
    { id: 'notifications', label: language === 'zh' ? '通知设置' : 'Notifications', icon: '🔔' },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '站点名称' : 'Site Name'}
          </label>
          <input
            type="text"
            value={config.general.siteName}
            onChange={(e) => handleConfigChange('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '站点描述' : 'Site Description'}
          </label>
          <input
            type="text"
            value={config.general.siteDescription}
            onChange={(e) => handleConfigChange('general', 'siteDescription', e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '默认用户配额' : 'Default User Quota'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.general.defaultUserQuota}
              onChange={(e) => handleConfigChange('general', 'defaultUserQuota', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-zinc-500">tokens</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '临时用户配额' : 'Temp User Quota'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.general.tempUserQuota}
              onChange={(e) => handleConfigChange('general', 'tempUserQuota', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-zinc-500">tokens</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">
              {language === 'zh' ? '维护模式' : 'Maintenance Mode'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'zh' ? '启用后，只有管理员可以访问系统' : 'When enabled, only administrators can access the system'}
            </p>
          </div>
          <button
            onClick={() => handleConfigChange('general', 'maintenanceMode', !config.general.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.general.maintenanceMode ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">
              {language === 'zh' ? '允许注册' : 'Allow Registration'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'zh' ? '允许新用户注册账号' : 'Allow new users to register accounts'}
            </p>
          </div>
          <button
            onClick={() => handleConfigChange('general', 'allowRegistration', !config.general.allowRegistration)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.general.allowRegistration ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.general.allowRegistration ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '会话超时' : 'Session Timeout'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.security.sessionTimeout}
              onChange={(e) => handleConfigChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-zinc-500">{language === 'zh' ? '小时' : 'hours'}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '最大登录尝试' : 'Max Login Attempts'}
          </label>
          <input
            type="number"
            value={config.security.maxLoginAttempts}
            onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '密码最小长度' : 'Min Password Length'}
          </label>
          <input
            type="number"
            value={config.security.passwordMinLength}
            onChange={(e) => handleConfigChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">
              {language === 'zh' ? '启用双因子认证' : 'Enable Two-Factor Auth'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'zh' ? '要求用户使用双因子认证' : 'Require users to use two-factor authentication'}
            </p>
          </div>
          <button
            onClick={() => handleConfigChange('security', 'enableTwoFactor', !config.security.enableTwoFactor)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.security.enableTwoFactor ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.security.enableTwoFactor ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? 'IP白名单' : 'IP Whitelist'}
          </label>
          <textarea
            value={config.security.ipWhitelist.join('\n')}
            onChange={(e) => handleConfigChange('security', 'ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
            placeholder={language === 'zh' ? '每行一个IP地址' : 'One IP address per line'}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? 'IP黑名单' : 'IP Blacklist'}
          </label>
          <textarea
            value={config.security.ipBlacklist.join('\n')}
            onChange={(e) => handleConfigChange('security', 'ipBlacklist', e.target.value.split('\n').filter(ip => ip.trim()))}
            placeholder={language === 'zh' ? '每行一个IP地址' : 'One IP address per line'}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '每分钟最大请求数' : 'Max Requests Per Minute'}
          </label>
          <input
            type="number"
            value={config.performance.maxRequestsPerMinute}
            onChange={(e) => handleConfigChange('performance', 'maxRequestsPerMinute', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '最大文件大小' : 'Max File Size'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.performance.maxFileSize}
              onChange={(e) => handleConfigChange('performance', 'maxFileSize', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-zinc-500">MB</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '缓存超时' : 'Cache Timeout'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={config.performance.cacheTimeout}
              onChange={(e) => handleConfigChange('performance', 'cacheTimeout', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-zinc-500">{language === 'zh' ? '秒' : 'seconds'}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            {language === 'zh' ? '并发连接数' : 'Concurrent Connections'}
          </label>
          <input
            type="number"
            value={config.performance.concurrentConnections}
            onChange={(e) => handleConfigChange('performance', 'concurrentConnections', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">
              {language === 'zh' ? '启用缓存' : 'Enable Caching'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'zh' ? '启用系统缓存以提高性能' : 'Enable system caching for better performance'}
            </p>
          </div>
          <button
            onClick={() => handleConfigChange('performance', 'enableCaching', !config.performance.enableCaching)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.performance.enableCaching ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.performance.enableCaching ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">
              {language === 'zh' ? '邮件通知' : 'Email Notifications'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'zh' ? '启用系统邮件通知' : 'Enable system email notifications'}
            </p>
          </div>
          <button
            onClick={() => handleConfigChange('notifications', 'emailNotifications', !config.notifications.emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.notifications.emailNotifications ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">
              {language === 'zh' ? '系统警报' : 'System Alerts'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'zh' ? '启用系统警报和错误通知' : 'Enable system alerts and error notifications'}
            </p>
          </div>
          <button
            onClick={() => handleConfigChange('notifications', 'systemAlerts', !config.notifications.systemAlerts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.notifications.systemAlerts ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.notifications.systemAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">
              {language === 'zh' ? '用户活动报告' : 'User Activity Reports'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'zh' ? '定期发送用户活动报告' : 'Send periodic user activity reports'}
            </p>
          </div>
          <button
            onClick={() => handleConfigChange('notifications', 'userActivityReports', !config.notifications.userActivityReports)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.notifications.userActivityReports ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.notifications.userActivityReports ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-zinc-700">
              {language === 'zh' ? '错误报告' : 'Error Reporting'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'zh' ? '自动报告系统错误' : 'Automatically report system errors'}
            </p>
          </div>
          <button
            onClick={() => handleConfigChange('notifications', 'errorReporting', !config.notifications.errorReporting)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.notifications.errorReporting ? 'bg-blue-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.notifications.errorReporting ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          {language === 'zh' ? '低配额警告阈值' : 'Low Quota Warning Threshold'}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={config.notifications.lowQuotaThreshold}
            onChange={(e) => handleConfigChange('notifications', 'lowQuotaThreshold', parseInt(e.target.value))}
            className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="100"
          />
          <span className="text-sm text-zinc-500">%</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          {language === 'zh' ? '当用户配额低于此值时发送警告' : 'Send warning when user quota falls below this value'}
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'performance':
        return renderPerformanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-zinc-600 p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <Icons.Database />
            {language === 'zh' ? '系统设置' : 'System Settings'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
            {language === 'zh' ? '配置系统参数和安全选项' : 'Configure system parameters and security options'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              {language === 'zh' ? '重置' : 'Reset'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (language === 'zh' ? '保存中...' : 'Saving...') : (language === 'zh' ? '保存更改' : 'Save Changes')}
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all"
          >
            {language === 'zh' ? '关闭' : 'Close'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-zinc-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm relative opacity-75">
        {/* 演示数据指示器 */}
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-full">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-xs text-orange-600 font-medium">
              {language === 'zh' ? '演示配置' : 'Demo Config'}
            </span>
          </div>
        </div>

        <div className="opacity-60">
          {renderTabContent()}
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-orange-500' : 'bg-green-500'}`} />
            <span className="text-zinc-600">
              {hasChanges ? (language === 'zh' ? '有未保存的更改' : 'Unsaved changes') : (language === 'zh' ? '所有更改已保存' : 'All changes saved')}
            </span>
          </div>
          <div className="text-zinc-500">
            {language === 'zh' ? '最后更新' : 'Last updated'}: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
