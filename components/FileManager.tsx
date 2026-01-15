
import React from 'react';
import { AppState, FileAttachment } from '../types';
import { Icons } from '../constants';

interface FileManagerProps {
  state: AppState;
  onClose: () => void;
  onDeleteFile: (id: string) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ state, onClose, onDeleteFile }) => {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <header className="flex items-center justify-between p-6 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Icons.Database />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Knowledge Base</h2>
            <p className="text-xs text-zinc-500 font-medium">Manage your indexed documents and research data</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <Icons.Plus className="rotate-45" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4">
          {state.fileLibrary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <Icons.Document />
              </div>
              <p className="text-sm font-medium">No files indexed yet</p>
              <p className="text-[10px] mt-1 italic uppercase tracking-widest">Knowledge engine standby</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.fileLibrary.map((file: FileAttachment) => (
                <div 
                  key={file.id} 
                  className="group p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:border-zinc-400 transition-all flex items-start justify-between shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      <Icons.Document />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-800 truncate max-w-[180px]">{file.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">{(file.size / 1024).toFixed(1)} KB</span>
                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">{file.isIndexed ? 'Indexed' : 'Pending'}</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 mt-2 font-medium italic">Added {new Date(file.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteFile(file.id)}
                    className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="p-6 border-t border-zinc-100 bg-zinc-50/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Total Storage: {state.fileLibrary.length} Documents
          </div>
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Vector Store: {state.vectorStore.length} Chunks
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FileManager;
