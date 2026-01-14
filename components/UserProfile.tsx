
import React from 'react';
import { User, AppState } from '../types';
import { Icons } from '../constants';

interface UserProfileProps {
  user: User;
  onClose: () => void;
  onDeleteAccount: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose, onDeleteAccount }) => {
  const joinDate = new Date(user.createdAt).toLocaleDateString();
  const usagePercentage = Math.round((user.tokensUsed / user.tokenQuota) * 100);

  return (
    <div className="flex-1 flex flex-col h-screen bg-white overflow-hidden relative">
      <header className="flex items-center justify-between p-6 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
             </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Investigator Profile</h1>
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Node Authorization & Resource Management</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Identity Card */}
          <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-3xl relative overflow-hidden group">
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-zinc-900 mb-1">{user.username}</h2>
                   <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded border border-blue-100">{user.role}</span>
                      <span className="text-zinc-400 text-[10px] font-medium uppercase tracking-wider">Joined {joinDate}</span>
                   </div>
                </div>
             </div>
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icons.User />
             </div>
          </div>

          {/* Resource Usage */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] ml-2">Neural Link Resources</h3>
            <div className="p-6 bg-white border border-zinc-200 rounded-3xl space-y-6 shadow-sm">
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Token Allocation Used</p>
                    <p className="text-2xl font-mono text-zinc-900">{user.tokensUsed.toLocaleString()} <span className="text-zinc-400 text-sm">/ {user.tokenQuota.toLocaleString()} TKN</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Authorization Status</p>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active Link</p>
                  </div>
               </div>
               <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                  <div className={`h-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, usagePercentage)}%` }} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[9px] text-zinc-400 uppercase font-bold mb-1">Request Count</p>
                    <p className="text-lg font-mono text-zinc-700">{user.requestCount}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-[9px] text-zinc-400 uppercase font-bold mb-1">Last Transmission</p>
                    <p className="text-lg font-mono text-zinc-700">{user.lastRequestAt ? new Date(user.lastRequestAt).toLocaleTimeString() : 'N/A'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-8 border-t border-zinc-100">
             <button 
               onClick={() => {
                 if (window.confirm("CRITICAL WARNING: This will permanently delete your investigator account and all associated encrypted records from this node. This action cannot be undone. Proceed with account termination?")) {
                   onDeleteAccount();
                 }
               }}
               className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 font-bold text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm"
             >
               <Icons.Trash /> Permanently Delete Account
             </button>
             <p className="text-center text-[10px] text-zinc-400 mt-6 uppercase tracking-widest leading-relaxed">
               Account termination will wipe all neural link data for this investigator. <br/>
               Encrypted archives and stances will be permanently purged.
             </p>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f4f4f5_0%,_transparent_100%)] pointer-events-none opacity-20" />
    </div>
  );
};

export default UserProfile;
