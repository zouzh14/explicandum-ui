
import React from 'react';
import { AppState, PhilosophicalStance } from '../types';
import { Icons } from '../constants';
import { Language, translations } from '../i18n';

interface KnowledgeSidebarProps {
  state: AppState;
  language: Language;
  activeSessionMessages: string[];
  onClose: () => void;
  onDeleteStance: (id: string) => void;
}

const KnowledgeSidebar: React.FC<KnowledgeSidebarProps> = ({ state, language, activeSessionMessages, onClose, onDeleteStance }) => {
  const t = translations[language];
  // Filter stances that originated from the current session's messages
  const currentSessionStances = state.personalPhilosophyLibrary.filter(stance => 
    activeSessionMessages.includes(stance.sourceMessageId)
  );

  return (
    <div className="w-80 h-full border-l border-zinc-200 bg-zinc-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      <header className="p-4 border-b border-zinc-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Library />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900">{t.knowledgeWorkspace}</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded transition-colors text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        <div className="flex items-center gap-2 mb-1 px-1">
          <Icons.Brain />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.contextualCards}</h3>
        </div>

        {currentSessionStances.length === 0 && (
          <div className="p-4 bg-zinc-100/50 border border-zinc-200 border-dashed rounded-xl flex flex-col items-center justify-center py-10 text-center">
            <Icons.Microscope />
            <p className="text-[10px] text-zinc-400 italic mt-2 px-4 leading-relaxed">
              {t.noContextualCards}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {/* Section 1: Session Stances */}
          {currentSessionStances.slice().reverse().map((stance: PhilosophicalStance) => (
            <div key={stance.id} className="group p-3 bg-white border border-zinc-200 rounded-xl shadow-sm hover:border-zinc-300 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter bg-zinc-100 px-1.5 py-0.5 rounded">
                  {t.extractedStance}
                </span>
                <button 
                  onClick={() => onDeleteStance(stance.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-500 transition-all"
                >
                  <Icons.Trash />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-700 font-medium italic">
                "{stance.view}"
              </p>
            </div>
          ))}

          {/* Section 2: Future Reference Cards (Mixed in) */}
          <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl grayscale opacity-60">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">{t.philosophicalRef}</span>
            </div>
            <p className="text-[10px] leading-relaxed text-zinc-500 italic">
              "Act only according to that maxim whereby you can at the same time will that it should become a universal law."
            </p>
            <div className="mt-2 text-[8px] font-bold text-zinc-400 uppercase">— Immanuel Kant (Categorical Imperative)</div>
          </div>
        </div>
      </div>

      <footer className="p-4 border-t border-zinc-200 bg-white">
        <p className="text-[8px] text-center text-zinc-400 font-bold uppercase tracking-[0.2em]">
          Persistence Engine Active
        </p>
      </footer>
    </div>
  );
};

export default KnowledgeSidebar;
