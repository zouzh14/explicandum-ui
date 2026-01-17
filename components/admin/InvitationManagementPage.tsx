import React, { useState, useEffect } from 'react';
import { Language } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';

interface InvitationCode {
  id: string;
  code: string;
  created_by: string;
  max_uses: number;
  used_count: number;
  allows_guest: boolean;
  requires_verification: boolean;
  expires_at: string | null;
  created_at: string;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
}

interface CreateInvitationRequest {
  code: string;
  max_uses: number;
  allows_guest: boolean;
  requires_verification: boolean;
  expires_at: string | null;
}

const InvitationManagementPage: React.FC<{ language: Language }> = ({ language }) => {
  const { state: authState } = useAuth();
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvitation, setNewInvitation] = useState<CreateInvitationRequest>({
    code: '',
    max_uses: 1,
    allows_guest: true,
    requires_verification: false,
    expires_at: null,
  });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedInvitations, setSelectedInvitations] = useState<Set<string>>(new Set());

  // 获取邀请码列表
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/academic-auth/invitation-codes', {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invitation codes');
      }

      const data = await response.json();
      setInvitations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建邀请码
  const createInvitation = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/academic-auth/create-invitation-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvitation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create invitation code');
      }

      const data = await response.json();
      
      // 添加到列表
      setInvitations([data, ...invitations]);
      
      // 重置表单
      setNewInvitation({
        code: '',
        max_uses: 1,
        allows_guest: true,
        requires_verification: false,
        expires_at: null,
      });
      setShowCreateForm(false);
      
      alert(language === 'zh' ? '邀请码创建成功！' : 'Invitation code created successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create invitation code');
      console.error('Error creating invitation:', err);
    } finally {
      setCreating(false);
    }
  };

  // 删除邀请码
  const deleteInvitation = async (id: string) => {
    if (!confirm(language === 'zh' ? '确定要删除这个邀请码吗？' : 'Are you sure you want to delete this invitation code?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/academic-auth/invitation-codes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete invitation code');
      }

      // 从列表中移除
      setInvitations(invitations.filter(inv => inv.id !== id));
      alert(language === 'zh' ? '邀请码删除成功！' : 'Invitation code deleted successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invitation code');
      console.error('Error deleting invitation:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // 批量删除邀请码
  const deleteSelectedInvitations = async () => {
    if (selectedInvitations.size === 0) {
      alert(language === 'zh' ? '请先选择要删除的邀请码' : 'Please select invitation codes to delete');
      return;
    }

    if (!confirm(language === 'zh' ? `确定要删除选中的 ${selectedInvitations.size} 个邀请码吗？` : `Are you sure you want to delete ${selectedInvitations.size} selected invitation codes?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedInvitations).map(id =>
        fetch(`/api/academic-auth/invitation-codes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
          },
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const failedDeletes = results.filter((result, index) => 
        result.status === 'rejected' || !result.value.ok
      );

      if (failedDeletes.length > 0) {
        throw new Error(`Failed to delete ${failedDeletes.length} invitation codes`);
      }

      // 从列表中移除已删除的邀请码
      setInvitations(invitations.filter(inv => !selectedInvitations.has(inv.id)));
      setSelectedInvitations(new Set());
      alert(language === 'zh' ? '批量删除成功！' : 'Batch delete successful!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invitation codes');
      console.error('Error deleting invitations:', err);
    }
  };

  // 生成随机邀请码
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewInvitation({ ...newInvitation, code: result });
  };

  // 复制邀请码到剪贴板
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      alert(language === 'zh' ? '邀请码已复制到剪贴板' : 'Invitation code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return language === 'zh' ? '永不过期' : 'Never expires';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 检查是否过期
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // 获取状态标签
  const getStatusLabel = (invitation: InvitationCode) => {
    if (invitation.is_used || invitation.used_count >= invitation.max_uses) {
      return {
        text: language === 'zh' ? '已用完' : 'Used up',
        color: 'bg-red-100 text-red-800',
      };
    }
    
    if (isExpired(invitation.expires_at)) {
      return {
        text: language === 'zh' ? '已过期' : 'Expired',
        color: 'bg-orange-100 text-orange-800',
      };
    }
    
    if (invitation.used_count > 0) {
      return {
        text: language === 'zh' ? '使用中' : 'In use',
        color: 'bg-blue-100 text-blue-800',
      };
    }
    
    return {
      text: language === 'zh' ? '未使用' : 'Unused',
      color: 'bg-green-100 text-green-800',
    };
  };

  // 切换选择邀请码
  const toggleSelectInvitation = (id: string) => {
    const newSelected = new Set(selectedInvitations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvitations(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedInvitations.size === invitations.length) {
      setSelectedInvitations(new Set());
    } else {
      setSelectedInvitations(new Set(invitations.map(inv => inv.id)));
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchInvitations();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white text-zinc-600 p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            {language === 'zh' ? '邀请码管理' : 'Invitation Code Management'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">
            {language === 'zh' ? '创建和管理用户邀请码' : 'Create and manage user invitation codes'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchInvitations()}
            className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {language === 'zh' ? '刷新' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {language === 'zh' ? '创建邀请码' : 'Create Invitation Code'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Batch Actions */}
      {selectedInvitations.size > 0 && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-indigo-700 font-medium">
              {language === 'zh' ? `已选择 ${selectedInvitations.size} 个邀请码` : `${selectedInvitations.size} invitation codes selected`}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={deleteSelectedInvitations}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {language === 'zh' ? '批量删除' : 'Delete Selected'}
            </button>
            <button
              onClick={() => setSelectedInvitations(new Set())}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all"
            >
              {language === 'zh' ? '取消选择' : 'Clear Selection'}
            </button>
          </div>
        </div>
      )}

      {/* Create Invitation Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">
                {language === 'zh' ? '创建新邀请码' : 'Create New Invitation Code'}
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Invitation Code */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {language === 'zh' ? '邀请码' : 'Invitation Code'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInvitation.code}
                    onChange={(e) => setNewInvitation({ ...newInvitation, code: e.target.value.toUpperCase() })}
                    className="flex-1 px-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="例如: INVITE123"
                    maxLength={20}
                  />
                  <button
                    onClick={generateRandomCode}
                    className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors text-sm font-medium"
                  >
                    {language === 'zh' ? '随机生成' : 'Generate'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {language === 'zh' ? '使用大写字母和数字，建议8-12位' : 'Use uppercase letters and numbers, 8-12 characters recommended'}
                </p>
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {language === 'zh' ? '最大使用次数' : 'Maximum Uses'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={newInvitation.max_uses}
                  onChange={(e) => setNewInvitation({ ...newInvitation, max_uses: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  {language === 'zh' ? '邀请码可以被使用的最大次数' : 'Maximum number of times this invitation code can be used'}
                </p>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {language === 'zh' ? '过期时间' : 'Expiration Date'}
                </label>
                <input
                  type="datetime-local"
                  value={newInvitation.expires_at || ''}
                  onChange={(e) => setNewInvitation({ 
                    ...newInvitation, 
                    expires_at: e.target.value || null 
                  })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  {language === 'zh' ? '留空表示永不过期' : 'Leave empty for no expiration'}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allows_guest"
                    checked={newInvitation.allows_guest}
                    onChange={(e) => setNewInvitation({ ...newInvitation, allows_guest: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="allows_guest" className="ml-2 text-sm text-zinc-700">
                    {language === 'zh' ? '允许访客注册' : 'Allow guest registration'}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requires_verification"
                    checked={newInvitation.requires_verification}
                    onChange={(e) => setNewInvitation({ ...newInvitation, requires_verification: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="requires_verification" className="ml-2 text-sm text-zinc-700">
                    {language === 'zh' ? '需要学术验证' : 'Require academic verification'}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={createInvitation}
                disabled={creating || !newInvitation.code.trim()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (language === 'zh' ? '创建中...' : 'Creating...') : (language === 'zh' ? '创建邀请码' : 'Create Invitation Code')}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-zinc-100 text-zinc-700 rounded-xl font-bold hover:bg-zinc-200 transition-all"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitations List */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-13 gap-4 p-4 bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedInvitations.size === invitations.length && invitations.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-3">{language === 'zh' ? '邀请码' : 'Invitation Code'}</div>
          <div className="col-span-2">{language === 'zh' ? '使用情况' : 'Usage'}</div>
          <div className="col-span-2">{language === 'zh' ? '过期时间' : 'Expires'}</div>
          <div className="col-span-2">{language === 'zh' ? '状态' : 'Status'}</div>
          <div className="col-span-3">{language === 'zh' ? '操作' : 'Actions'}</div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-zinc-500">{language === 'zh' ? '加载中...' : 'Loading...'}</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-2">
              {language === 'zh' ? '暂无邀请码' : 'No invitation codes'}
            </h3>
            <p className="text-zinc-500 mb-4">
              {language === 'zh' ? '点击上方按钮创建第一个邀请码' : 'Click the button above to create your first invitation code'}
            </p>
          </div>
        ) : (
          /* Invitations List */
          <div className="divide-y divide-zinc-100">
            {invitations.map((invitation) => {
              const status = getStatusLabel(invitation);
              return (
                <div key={invitation.id} className="grid grid-cols-13 gap-4 p-4 hover:bg-zinc-50 transition-colors">
                  {/* Checkbox */}
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedInvitations.has(invitation.id)}
                      onChange={() => toggleSelectInvitation(invitation.id)}
                      className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                    />
                  </div>

                  {/* Invitation Code */}
                  <div className="col-span-3">
                    <div className="font-mono font-bold text-zinc-900">{invitation.code}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {language === 'zh' ? '创建于' : 'Created'} {formatDate(invitation.created_at)}
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-zinc-900">
                      {invitation.used_count}/{invitation.max_uses}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {language === 'zh' ? '已使用' : 'Used'} {Math.round((invitation.used_count / invitation.max_uses) * 100)}%
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="col-span-2">
                    <div className="text-sm text-zinc-900">
                      {formatDate(invitation.expires_at)}
                    </div>
                    {invitation.used_by && (
                      <div className="text-xs text-zinc-500 mt-1">
                        {language === 'zh' ? '使用者' : 'Used by'}: {invitation.used_by}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    <div className="text-xs text-zinc-500 mt-1">
                      {invitation.allows_guest && (
                        <span className="inline-block mr-1">
                          {language === 'zh' ? '访客' : 'Guest'}
                        </span>
                      )}
                      {invitation.requires_verification && (
                        <span className="inline-block">
                          {language === 'zh' ? '需验证' : 'Verify'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(invitation.code)}
                        className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors text-xs font-medium flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {language === 'zh' ? '复制' : 'Copy'}
                      </button>
                      <button
                        onClick={() => deleteInvitation(invitation.id)}
                        disabled={deletingId === invitation.id}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === invitation.id ? (language === 'zh' ? '删除中...' : 'Deleting...') : (language === 'zh' ? '删除' : 'Delete')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationManagementPage;
