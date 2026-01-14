
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
    <div className="flex-1 flex flex-col h-screen bg-black overflow-hidden relative">
      <header className="flex items-center justify-between p-6 border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
             </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Thought Library</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium">Extracted Philosophical Stances</p>
          </div>
        </div>
        <div className="text-zinc-500 text-xs font-mono">
          {state.personalPhilosophyLibrary.length} STANCES RECORDED
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {state.personalPhilosophyLibrary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
               <div className="w-16 h-16 mb-4 opacity-20"><Icons.Scroll /></div>
               <p className="text-sm italic italic">The library is currently empty. Start an investigation to populate it.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...state.personalPhilosophyLibrary].reverse().map((stance) => (
                <div key={stance.id} className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-purple-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Icons.Scroll /></div>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                        {new Date(stance.timestamp).toLocaleDateString()}
                      </span>
                   </div>
                   <p className="text-zinc-300 text-sm italic leading-relaxed mb-4 font-serif">
                     "{stance.view}"
                   </p>
                   <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Persistence ID: {stance.id.split('_')[1]}</span>
                      <button 
                        onClick={() => onDeleteStance(stance.id)}
                        className="p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
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
