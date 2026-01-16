
import React from 'react';
import { AppState, User } from '../types';
import { Icons } from '../constants';
import { Language, translations } from '../i18n';

interface AdminDashboardProps {
  state: AppState;
  language: Language;
  onClose: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, language, onClose, onUpdateUser }) => {
  const t = translations[language];
  const totalTokensUsed = state.registeredUsers.reduce((acc, u) => acc + u.tokensUsed, 0);
  const totalRequests = state.registeredUsers.reduce((acc, u) => acc + u.requestCount, 0);

  return (
    <div className="flex-1 flex flex-col bg-white text-zinc-600 p-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-10 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
            <Icons.Database /> {t.adminDashboard}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 uppercase tracking-widest text-[10px] font-bold">{t.manageAccess}</p>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
        >
          Close Console
        </button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: language === 'zh' ? '总 Token' : 'Total Tokens', value: totalTokensUsed.toLocaleString() },
          { label: language === 'zh' ? '总请求数' : 'Total Requests', value: totalRequests.toLocaleString() },
          { label: language === 'zh' ? '活跃研究员' : 'Active Researchers', value: state.registeredUsers.length },
          { label: language === 'zh' ? '向量索引大小' : 'Vector Index Size', value: state.vectorStore.length }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <Icons.Database />
            </div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">{stat.label}</div>
            <div className="text-3xl font-bold text-zinc-900 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* User Directory */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden mb-12 shadow-sm">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">{t.userRegistry}</h2>
          <div className="text-[10px] text-zinc-400 font-mono">Simulated Persistence Mode</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-zinc-400 border-b border-zinc-100">
              <tr>
                <th className="p-4 font-bold uppercase tracking-tighter">{t.username} / IP</th>
                <th className="p-4 font-bold uppercase tracking-tighter">{t.used}</th>
                <th className="p-4 font-bold uppercase tracking-tighter">{t.quota}</th>
                <th className="p-4 font-bold uppercase tracking-tighter">{t.history}</th>
                <th className="p-4 font-bold uppercase tracking-tighter">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {state.registeredUsers.map(user => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-zinc-800">{user.username}</div>
                    <div className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {user.registrationIp}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-0.5">
                          <span>{user.tokensUsed.toLocaleString()} {t.used}</span>
                          <span>{Math.round((user.tokensUsed / user.tokenQuota) * 100)}%</span>
                       </div>
                       <div className="w-40 h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${user.tokensUsed >= user.tokenQuota ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(100, (user.tokensUsed / user.tokenQuota) * 100)}%` }} 
                          />
                       </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-zinc-500">{user.tokenQuota.toLocaleString()}</td>
                  <td className="p-4 font-mono text-zinc-500">{user.requestCount} Reqs</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                       <button 
                        onClick={() => onUpdateUser(user.id, { tokenQuota: user.tokenQuota + 50000 })}
                        className="px-3 py-1 bg-zinc-900 text-white hover:bg-black rounded font-bold text-[9px] transition-colors"
                       >
                         GRANT +50k
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IP Intelligence */}
      <h2 className="text-sm font-bold text-zinc-900 mb-6 uppercase tracking-wider">IP Intelligence Ledger</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(state.ipRegistry).map(([ip, stats]) => (
          <div key={ip} className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl relative shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-blue-600 font-bold">{ip}</span>
              <span className="text-[9px] text-zinc-400 uppercase font-bold">{stats.anonymousCount} Anons</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500">Tokens Ingested</span>
                <span className="text-zinc-800 font-mono">{stats.totalTokensUsed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500">Total Requests</span>
                <span className="text-zinc-800 font-mono">{stats.totalRequests}</span>
              </div>
              <div className="pt-3 border-t border-zinc-200 text-[9px] text-zinc-400 flex justify-between">
                <span>LAST SEEN</span>
                <span className="font-mono text-zinc-600">{new Date(stats.lastSeen).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
