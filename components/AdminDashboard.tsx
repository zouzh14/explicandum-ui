import React, { useState } from 'react';
import { AppState, User } from '../types';
import { Icons } from '../constants';
import { Language, translations } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

// 子组件导入
import KeyMetricsSection from './admin/KeyMetricsSection';
import QuickActionsSection from './admin/QuickActionsSection';
import SystemStatusSection from './admin/SystemStatusSection';
import RecentActivitySection from './admin/RecentActivitySection';
import RiskMonitoringPage from './admin/RiskMonitoringPage';

interface AdminDashboardProps {
  state: AppState;
  language: Language;
  onClose: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, language, onClose, onUpdateUser }) => {
  const t = translations[language];
  const { state: authState } = useAuth(); // 获取认证状态
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'invitations'>('overview');

  return (
    <div className="flex-1 flex flex-col bg-white text-zinc-600 p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <Icons.Database /> {t.adminDashboard}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
            {language === 'zh' ? '系统监控与快速操作' : 'System Monitoring & Quick Actions'}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
        >
          {language === 'zh' ? '关闭控制台' : 'Close Console'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'overview'
              ? 'text-zinc-900 border-b-2 border-zinc-900'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {language === 'zh' ? '总览' : 'Overview'}
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${
            activeTab === 'monitoring'
              ? 'text-zinc-900 border-b-2 border-zinc-900'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {language === 'zh' ? '风险监控' : 'Risk Monitoring'}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics Section */}
          <KeyMetricsSection state={state} language={language} />

          {/* Quick Actions Section */}
          <QuickActionsSection language={language} onClose={onClose} />

          {/* System Status Section */}
          <SystemStatusSection state={state} language={language} />

          {/* Recent Activity Section */}
          <RecentActivitySection state={state} language={language} />
        </>
      )}

      {activeTab === 'monitoring' && (
        <RiskMonitoringPage />
      )}

    </div>
  );
};

export default AdminDashboard;
