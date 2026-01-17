import React from 'react';
import { Language } from '../../i18n';

interface QuickActionsSectionProps {
  language: Language;
  onClose: () => void;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ language, onClose }) => {
  const actions = [
    {
      id: 'users',
      title: language === 'zh' ? '用户管理' : 'User Management',
      description: language === 'zh' ? '管理系统用户和权限' : 'Manage system users and permissions',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'blue',
      disabled: false
    },
    {
      id: 'logs',
      title: language === 'zh' ? '系统日志' : 'System Logs',
      description: language === 'zh' ? '查看系统活动和错误' : 'View system activity and errors',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'green',
      disabled: false
    },
    {
      id: 'settings',
      title: language === 'zh' ? '系统设置' : 'System Settings',
      description: language === 'zh' ? '配置系统参数' : 'Configure system parameters',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'purple',
      disabled: false
    },
    {
      id: 'export',
      title: language === 'zh' ? '数据导出' : 'Export Data',
      description: language === 'zh' ? '下载系统数据报告' : 'Download system data reports',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'orange',
      disabled: false // 已启用
    }
  ];

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'users':
        // 触发用户管理页面显示
        if (onClose) {
          onClose(); // 关闭当前dashboard
          // 触发状态变更显示用户管理页面
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('showUserManagement'));
          }, 100);
        }
        break;
      case 'logs':
        // 触发分析页面显示
        if (onClose) {
          onClose(); // 关闭当前dashboard
          // 触发状态变更显示分析页面
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('showAnalytics'));
          }, 100);
        }
        break;
      case 'settings':
        // 触发系统设置页面显示
        if (onClose) {
          onClose(); // 关闭当前dashboard
          // 触发状态变更显示系统设置页面
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('showSystemSettings'));
          }, 100);
        }
        break;
      case 'export':
        // 触发数据导出页面显示
        if (onClose) {
          onClose(); // 关闭当前dashboard
          // 触发状态变更显示数据导出页面
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('showDataExport'));
          }, 100);
        }
        break;
      default:
        break;
    }
  };

  const getColorClasses = (color: string, disabled: boolean) => {
    if (disabled) {
      return {
        bg: 'bg-zinc-100',
        text: 'text-zinc-400',
        hover: 'hover:bg-zinc-100'
      };
    }

    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        hover: 'hover:bg-green-100'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-100'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        hover: 'hover:bg-orange-100'
      }
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="mb-12">
      <h2 className="text-lg font-bold text-zinc-900 mb-6">
        {language === 'zh' ? '快速操作' : 'Quick Actions'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => {
          const colorClasses = getColorClasses(action.color, action.disabled);
          
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              disabled={action.disabled}
              className={`
                p-6 rounded-2xl border border-zinc-200 transition-all
                ${colorClasses.bg} ${colorClasses.hover}
                ${action.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer shadow-sm hover:shadow-md'}
                text-left group
              `}
            >
              <div className="flex flex-col h-full">
                <div className={`w-16 h-16 ${colorClasses.bg} rounded-xl flex items-center justify-center mb-4 transition-colors ${!action.disabled && 'group-hover:scale-105'}`}>
                  <div className={colorClasses.text}>
                    {action.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-zinc-900 mb-2 ${action.disabled ? 'text-zinc-500' : ''}`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm ${action.disabled ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {action.description}
                  </p>
                </div>
                {action.disabled && (
                  <div className="mt-3 text-xs text-zinc-400 font-medium">
                    {language === 'zh' ? '即将推出' : 'Coming Soon'}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsSection;
