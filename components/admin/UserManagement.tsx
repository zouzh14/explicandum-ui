import React, { useState, useMemo } from 'react';
import { AppState, User } from '../../types';
import { Icons } from '../../constants';
import { Language as LanguageType } from '../../i18n';
import UserLogsModal from './UserLogsModal';

interface UserManagementProps {
  state: AppState;
  language: LanguageType;
  onClose: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ state, language, onClose, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState<string | null>(null);

  const usersPerPage = 10;

  // 筛选用户
  const filteredUsers = useMemo(() => {
    return state.registeredUsers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.registrationIp.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'temp' && user.isTemp) ||
                           (selectedStatus === 'active' && !user.isTemp);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [state.registeredUsers, searchTerm, selectedRole, selectedStatus]);

  // 分页
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBatchAction = (action: string) => {
    console.log('Batch action:', action, selectedUsers);
    // TODO: 实现批量操作
  };

  const handleUserAction = (userId: string, action: string) => {
    console.log('User action:', action, userId);
    switch (action) {
      case 'edit':
        // TODO: 打开编辑用户模态框
        break;
      case 'adjust_quota':
        // TODO: 打开配额调整模态框
        break;
      case 'view_logs':
        setShowLogsModal(userId);
        break;
      case 'suspend':
        // TODO: 暂停用户
        break;
      default:
        break;
    }
    setShowDropdown(null);
  };

  const getStatusBadge = (user: User) => {
    if (user.isTemp) {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
          {language === 'zh' ? '临时' : 'TEMP'}
        </span>
      );
    }
    if (user.role === 'admin') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
          {language === 'zh' ? '管理员' : 'ADMIN'}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
        {language === 'zh' ? '正式' : 'ACTIVE'}
      </span>
    );
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-blue-600';
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
        >
          {language === 'zh' ? '关闭' : 'Close'}
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
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
                placeholder={language === 'zh' ? '搜索用户名、邮箱或IP...' : 'Search username, email or IP...'}
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 角色筛选 */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{language === 'zh' ? '所有角色' : 'All Roles'}</option>
            <option value="admin">{language === 'zh' ? '管理员' : 'Admin'}</option>
            <option value="researcher">{language === 'zh' ? '研究员' : 'Researcher'}</option>
            <option value="user">{language === 'zh' ? '普通用户' : 'User'}</option>
            <option value="temp">{language === 'zh' ? '临时用户' : 'Temp User'}</option>
          </select>
          
          {/* 状态筛选 */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{language === 'zh' ? '所有状态' : 'All Status'}</option>
            <option value="active">{language === 'zh' ? '正式用户' : 'Active Users'}</option>
            <option value="temp">{language === 'zh' ? '临时用户' : 'Temp Users'}</option>
          </select>
        </div>
      </div>

      {/* 批量操作工具栏 */}
      {selectedUsers.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 font-medium">
              {language === 'zh' ? `已选择 ${selectedUsers.length} 个用户` : `${selectedUsers.length} users selected`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBatchAction('adjust_quota')}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {language === 'zh' ? '调整配额' : 'Adjust Quota'}
              </button>
              <button
                onClick={() => handleBatchAction('export')}
                className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                {language === 'zh' ? '导出数据' : 'Export Data'}
              </button>
              <button
                onClick={() => handleBatchAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                {language === 'zh' ? '删除用户' : 'Delete Users'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户列表表格 */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-100">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-4 font-bold uppercase tracking-tighter">
                  {language === 'zh' ? '用户信息' : 'User Info'}
                </th>
                <th className="p-4 font-bold uppercase tracking-tighter">
                  {language === 'zh' ? '状态' : 'Status'}
                </th>
                <th className="p-4 font-bold uppercase tracking-tighter">
                  {language === 'zh' ? '配额使用' : 'Quota Usage'}
                </th>
                <th className="p-4 font-bold uppercase tracking-tighter">
                  {language === 'zh' ? '使用历史' : 'Usage History'}
                </th>
                <th className="p-4 font-bold uppercase tracking-tighter">
                  {language === 'zh' ? '最后活跃' : 'Last Active'}
                </th>
                <th className="p-4 font-bold uppercase tracking-tighter">
                  {language === 'zh' ? '操作' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-bold text-zinc-900">{user.username}</div>
                      <div className="text-xs text-zinc-500 font-mono">
                        No email
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">
                        IP: {user.registrationIp}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(user)}
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>{user.tokensUsed.toLocaleString()}</span>
                        <span>{Math.round((user.tokensUsed / user.tokenQuota) * 100)}%</span>
                      </div>
                      <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${getUsageColor((user.tokensUsed / user.tokenQuota) * 100)}`}
                          style={{ width: `${Math.min(100, (user.tokensUsed / user.tokenQuota) * 100)}%` }} 
                        />
                      </div>
                      <div className="text-xs text-zinc-400">
                        {user.tokenQuota.toLocaleString()} total
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-zinc-600">
                        {user.requestCount} {language === 'zh' ? '请求' : 'requests'}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {language === 'zh' ? '注册于' : 'Registered'} {formatTime(user.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-zinc-600">
                      {user.lastRequestAt ? formatTime(user.lastRequestAt) : language === 'zh' ? '从未活跃' : 'Never active'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                        className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      
                      {showDropdown === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleUserAction(user.id, 'edit')}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {language === 'zh' ? '编辑用户' : 'Edit User'}
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'adjust_quota')}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {language === 'zh' ? '调整配额' : 'Adjust Quota'}
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'view_logs')}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {language === 'zh' ? '查看日志' : 'View Logs'}
                          </button>
                          <div className="border-t border-zinc-100 my-1" />
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            {language === 'zh' ? '暂停用户' : 'Suspend User'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 分页 */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600">
              {language === 'zh' ? '显示' : 'Showing'} {(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, filteredUsers.length)} {language === 'zh' ? '共' : 'of'} {filteredUsers.length} {language === 'zh' ? '个用户' : 'users'}
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

      {/* User Logs Modal */}
      {showLogsModal && (
        <UserLogsModal
          user={paginatedUsers.find(user => user.id === showLogsModal)!}
          language={language}
          onClose={() => setShowLogsModal(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
