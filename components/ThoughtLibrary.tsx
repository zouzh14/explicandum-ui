
import React from 'react';
import { AppState, PhilosophicalStance } from '../types';
import { Icons } from '../constants';

interface ThoughtLibraryProps {
  state: AppState;
  onClose: () => void;
  onDeleteStance: (id: string) => void;
}

const ThoughtLibrary: React.FC<ThoughtLibraryProps> = ({ state, onClose, onDeleteStance }) => {
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
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Thought Library</h1>
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-medium">Extracted Philosophical Stances</p>
          </div>
        </div>
        <div className="text-zinc-400 text-xs font-mono">
          {state.personalPhilosophyLibrary.length} STANCES RECORDED
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {state.personalPhilosophyLibrary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
               <div className="w-16 h-16 mb-4 opacity-20"><Icons.Scroll /></div>
               <p className="text-sm italic">The library is currently empty. Start an investigation to populate it.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...state.personalPhilosophyLibrary].reverse().map((stance) => (
                <div key={stance.id} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-purple-300 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Icons.Scroll /></div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">
                        {new Date(stance.timestamp).toLocaleDateString()}
                      </span>
                   </div>
                   <p className="text-zinc-700 text-sm italic leading-relaxed mb-4 font-serif">
                     "{stance.view}"
                   </p>
                   <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">Persistence ID: {stance.id.split('_')[1]}</span>
                      <button 
                        onClick={() => onDeleteStance(stance.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove from archive"
                      >
                        <Icons.Trash />
                      </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#5022_0%,_transparent_100%)] pointer-events-none opacity-20" />
    </div>
  );
};

export default ThoughtLibrary;
