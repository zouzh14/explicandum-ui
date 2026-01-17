import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '../../types';
import { Icons } from '../../constants';
import { Language as LanguageType } from '../../i18n';
import UserLogsModal from './UserLogsModal';
import userManagementService, { UserListResponse, UserStatsResponse } from '../../services/userManagementService';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';

interface UserManagementProps {
  language: LanguageType;
  onClose: () => void;
  token: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ language, onClose, token }) => {
  // --- 状态管理 ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    pages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usersPerPage = 10;

  // --- API 服务初始化 ---
  useEffect(() => {
    if (token) {
      userManagementService.setToken(token);
    }
  }, [token]);

  // --- 数据获取逻辑 ---
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        size: usersPerPage,
        search: searchTerm.trim() || undefined,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      if (selectedStatus === 'temp') params.is_temp = true;
      else if (selectedStatus === 'active') params.is_temp = false;

      const response: UserListResponse = await userManagementService.getUsers(params);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedRole, selectedStatus, token]);

  const fetchUserStats = useCallback(async () => {
    if (!token) return;
    try {
      const stats = await userManagementService.getUserStats();
      setUserStats(stats);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, [token]);

  // --- 副作用控制 ---

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchUsers();
    }
  }, [searchTerm, selectedRole, selectedStatus]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // --- 实时更新 ---
  const { isConnected, lastUpdate, refresh } = useRealTimeUpdates({
    enabled: true,
    interval: 30000,
    onStatsUpdate: setUserStats,
    onUserUpdate: (updatedUsers) => {
      if (currentPage === 1 && !searchTerm && selectedRole === 'all' && selectedStatus === 'all') {
        setUsers(updatedUsers);
      }
    },
    onError: (err) => console.error('Real-time connection lost', err)
  });

  // --- 事件处理 ---
  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? users.map(u => u.id) : []);
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUsers(prev =>
      checked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  };

  const handleUserAction = (userId: string, action: string) => {
    setShowDropdown(null);
    switch (action) {
      case 'view_logs':
        setShowLogsModal(userId);
        break;
      case 'suspend':
        break;
      default:
        console.log(`Action ${action} for user ${userId}`);
    }
  };

  // --- 渲染辅助 ---
  const getStatusBadge = (user: User) => {
    const isZh = language === 'zh';
    if (user.isTemp) return <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">{isZh ? '临时' : 'TEMP'}</span>;
    if (user.role === 'admin') return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">{isZh ? '管理员' : 'ADMIN'}</span>;
    return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">{isZh ? '正式' : 'ACTIVE'}</span>;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-blue-600';
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-zinc-600 p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <Icons.Database />
            {language === 'zh' ? '用户管理' : 'User Management'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
            {language === 'zh' ? '管理系统用户和权限' : 'Manage system users and permissions'}
          </p>
        </div>
        <button onClick={onClose} className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
          {language === 'zh' ? '关闭' : 'Close'}
        </button>
      </div>

      {/* 错误显示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">{language === 'zh' ? '错误' : 'Error'}:</span>
            <span>{error}</span>
          </div>
          <div className="mt-2 text-sm text-red-500">
            {language === 'zh' ? '请确保您以管理员身份登录，并且后端服务正在运行。' : 'Please make sure you are logged in as admin and the backend service is running.'}
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'zh' ? '搜索用户名、邮箱或IP...' : 'Search username, email or IP...'}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-4 py-2 border border-zinc-200 rounded-xl">
            <option value="all">{language === 'zh' ? '所有角色' : 'All Roles'}</option>
            <option value="admin">{language === 'zh' ? '管理员' : 'Admin'}</option>
            <option value="user">{language === 'zh' ? '普通用户' : 'User'}</option>
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border border-zinc-200 rounded-xl">
            <option value="all">{language === 'zh' ? '所有状态' : 'All Status'}</option>
            <option value="active">{language === 'zh' ? '正式' : 'Active'}</option>
            <option value="temp">{language === 'zh' ? '临时' : 'Temp'}</option>
          </select>
        </div>
      </div>

      {/* 统计信息 */}
      {userStats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="text-blue-800 font-bold text-lg">{userStats.total_users}</div>
            <div className="text-blue-600 text-sm">{language === 'zh' ? '总用户数' : 'Total Users'}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="text-purple-800 font-bold text-lg">{userStats.token_stats.utilization_percent.toFixed(1)}%</div>
            <div className="text-purple-600 text-sm">{language === 'zh' ? '配额使用率' : 'Quota Usage'}</div>
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100 sticky top-0 z-10">
              <tr>
                <th className="p-4"><input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} className="rounded border-zinc-300" /></th>
                <th className="p-4 font-bold">{language === 'zh' ? '用户信息' : 'User Info'}</th>
                <th className="p-4 font-bold">{language === 'zh' ? '状态' : 'Status'}</th>
                <th className="p-4 font-bold">{language === 'zh' ? '配额' : 'Quota'}</th>
                <th className="p-4 font-bold">{language === 'zh' ? '操作' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-zinc-400">{language === 'zh' ? '加载中...' : 'Loading...'}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-zinc-400">{language === 'zh' ? '没有找到用户' : 'No users found'}</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={(e) => handleSelectUser(user.id, e.target.checked)} className="rounded" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-zinc-900">{user.username}</div>
                    <div className="text-xs text-zinc-400">{user.email || 'No email'}</div>
                  </td>
                  <td className="p-4">{getStatusBadge(user)}</td>
                  <td className="p-4">
                    <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full ${getUsageColor((user.tokensUsed / user.tokenQuota) * 100)}`}
                        style={{ width: `${Math.min(100, (user.tokensUsed / user.tokenQuota) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400">{(user.tokensUsed / 1000).toFixed(1)}k / {(user.tokenQuota / 1000).toFixed(1)}k</span>
                  </td>
                  <td className="p-4 relative">
                    <button onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)} className="p-2 hover:bg-zinc-100 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {showDropdown === user.id && (
                      <div className="absolute right-0 top-10 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden">
                        <button onClick={() => handleUserAction(user.id, 'view_logs')} className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-xs">
                          {language === 'zh' ? '查看日志' : 'View Logs'}
                        </button>
                        <button onClick={() => handleUserAction(user.id, 'suspend')} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-xs">
                          {language === 'zh' ? '暂停用户' : 'Suspend User'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between bg-zinc-50 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">
            {language === 'zh' ? `共 ${pagination.total} 名用户` : `Total ${pagination.total} users`}
          </span>
          <span className="text-xs text-zinc-400">
            {language === 'zh' ? `第 ${currentPage} 页，共 ${pagination.pages} 页` : `Page ${currentPage} of ${pagination.pages}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {language === 'zh' ? '上一页' : 'Previous'}
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'bg-white border border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {pagination.pages > 5 && currentPage < pagination.pages - 2 && (
              <>
                <span className="text-zinc-400">...</span>
                <button
                  onClick={() => setCurrentPage(pagination.pages)}
                  className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-colors ${
                    currentPage === pagination.pages
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'bg-white border border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {pagination.pages}
                </button>
              </>
            )}
          </div>
          <button
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {language === 'zh' ? '下一页' : 'Next'}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showLogsModal && (
        <UserLogsModal
          user={users.find(u => u.id === showLogsModal)!}
          language={language}
          onClose={() => setShowLogsModal(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
