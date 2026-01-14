
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, ChatSession, User, AppState, PhilosophicalStance, FileAttachment, IpRegistry, VectorChunk } from './types';
import { Icons } from './constants';
import MessageBubble from './components/MessageBubble';
import AdminDashboard from './components/AdminDashboard';
import { streamExplicandumResponse, extractPhilosophicalStance } from './services/geminiService';
import { vectorStore, pgDb } from './services/dbService';

const ANONYMOUS_LIMIT = 3;
const DEFAULT_QUOTA = 100000;
const GUEST_QUOTA = 20000;

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem('explicandum_state_v8');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, status: 'idle' };
    }
    
    const systemAdmin: User = {
      id: 'admin_primary',
      username: 'Administrator',
      password: 'admin',
      role: 'admin',
      registrationIp: '127.0.0.1',
      createdAt: Date.now(),
      isAnonymous: false,
      tokenQuota: 99999999,
      tokensUsed: 0,
      requestCount: 0,
      lastRequestAt: 0
    };

    return {
      currentUser: null,
      sessions: [],
      activeSessionId: null,
      personalPhilosophyLibrary: [],
      fileLibrary: [],
      vectorStore: [],
      status: 'idle',
      registeredUsers: [systemAdmin],
      ipRegistry: {}
    };
  });

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [input, setInput] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  const [pendingFileIds, setPendingFileIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentIp, setCurrentIp] = useState<string>('unknown');

  useEffect(() => {
    let machineId = localStorage.getItem('explicandum_machine_id');
    if (!machineId) {
      machineId = 'ip_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('explicandum_machine_id', machineId);
    }
    setCurrentIp(machineId);
  }, []);

  useEffect(() => {
    const { status, ...persistentState } = appState;
    localStorage.setItem('explicandum_state_v8', JSON.stringify(persistentState));
  }, [appState]);

  const activeSession = useMemo(() => {
    return appState.sessions.find(s => s.id === appState.activeSessionId) || null;
  }, [appState.sessions, appState.activeSessionId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, appState.status]);

  const handleAuthAction = async () => {
    setAuthError('');
    if (authMode === 'login') {
      const user = appState.registeredUsers.find(u => u.username === username && u.password === password);
      if (user) {
        setAppState(prev => ({ ...prev, currentUser: user }));
      } else {
        setAuthError('Invalid credentials');
      }
    } else if (authMode === 'register') {
      if (!username || !password) {
        setAuthError('Username and password required');
        return;
      }
      if (appState.registeredUsers.some(u => u.username === username)) {
        setAuthError('Username already exists');
        return;
      }
      const newUser: User = {
        id: 'usr_' + Date.now(),
        username,
        password,
        role: 'researcher',
        registrationIp: currentIp,
        createdAt: Date.now(),
        isAnonymous: false,
        tokenQuota: DEFAULT_QUOTA,
        tokensUsed: 0,
        requestCount: 0,
        lastRequestAt: 0
      };
      await pgDb.saveUser(newUser);
      setAppState(prev => ({ ...prev, registeredUsers: [...prev.registeredUsers, newUser], currentUser: newUser }));
    } else if (authMode === 'guest') {
      const currentStats = appState.ipRegistry[currentIp] || { anonymousCount: 0, lastSeen: Date.now(), totalTokensUsed: 0, totalRequests: 0 };
      if (currentStats.anonymousCount >= ANONYMOUS_LIMIT) {
        setAuthError(`Limit reached for this IP. Please register.`);
        return;
      }
      const anonymousUser: User = {
        id: 'anon_' + Date.now(),
        username: 'Guest_' + (currentStats.anonymousCount + 1),
        role: 'guest',
        registrationIp: currentIp,
        createdAt: Date.now(),
        isAnonymous: true,
        tokenQuota: GUEST_QUOTA,
        tokensUsed: 0,
        requestCount: 0,
        lastRequestAt: 0
      };
      setAppState(prev => ({
        ...prev,
        currentUser: anonymousUser,
        ipRegistry: { ...prev.ipRegistry, [currentIp]: { ...currentStats, anonymousCount: currentStats.anonymousCount + 1, lastSeen: Date.now() } }
      }));
    }
  };

  const handleLogout = () => {
    setAppState(prev => ({ ...prev, currentUser: null, activeSessionId: null, status: 'idle' }));
  };

  // Fix: Added handleUpdateUser to manage user updates from the AdminDashboard
  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setAppState(prev => ({
      ...prev,
      registeredUsers: prev.registeredUsers.map(u => u.id === userId ? { ...u, ...updates } : u),
      currentUser: (prev.currentUser && prev.currentUser.id === userId) 
        ? { ...prev.currentUser, ...updates } as User 
        : prev.currentUser
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setAppState(prev => ({ ...prev, status: 'indexing' }));
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const tempFile: FileAttachment = {
          id: 'file_' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          content: text,
          isIndexed: false,
          chunks: [],
          timestamp: Date.now()
        };
        const chunks = await vectorStore.indexFile(tempFile);
        setAppState(prev => ({
          ...prev,
          status: 'idle',
          fileLibrary: [...prev.fileLibrary, { ...tempFile, isIndexed: true, chunks: chunks.map(c => c.id) }],
          vectorStore: [...prev.vectorStore, ...chunks]
        }));
        setPendingFileIds(prev => [...prev, tempFile.id]);
      };
      reader.readAsText(file);
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || appState.status !== 'idle' || !activeSession || !appState.currentUser) return;
    const quotaCheck = pgDb.checkQuota(appState.currentUser);
    if (!quotaCheck.allowed) { alert(quotaCheck.reason); return; }

    const userMsgId = 'msg_' + Date.now();
    const currentAttachedFiles = [...pendingFileIds];
    setAppState(prev => ({ ...prev, status: 'busy' }));

    let retrievedChunks: VectorChunk[] = [];
    if (ragEnabled) {
      const searchableChunks = appState.vectorStore.filter(c => 
        currentAttachedFiles.includes(c.fileId) || activeSession.activeFileIds.includes(c.fileId)
      );
      retrievedChunks = await vectorStore.similaritySearch(input, searchableChunks);
    }

    let inputTokens = pgDb.calculateTokens(input);
    const userMsg: Message = { id: userMsgId, role: 'user', content: input, attachedFileIds: currentAttachedFiles, retrievedChunkIds: retrievedChunks.map(c => c.id), tokensConsumed: inputTokens };
    const assistantMsgId = 'msg_' + (Date.now() + 1);
    const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true, ragSources: retrievedChunks.map(c => c.fileName), attachedFileIds: currentAttachedFiles };

    setAppState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === prev.activeSessionId ? {
        ...s,
        title: s.messages.length <= 1 ? (input.slice(0, 30) + (input.length > 30 ? '...' : '')) : s.title,
        lastActive: Date.now(),
        messages: [...s.messages, userMsg, assistantMsg],
        activeFileIds: Array.from(new Set([...s.activeFileIds, ...currentAttachedFiles]))
      } : s)
    }));

    const currentInput = input;
    setInput('');
    setPendingFileIds([]);

    if (activeSession.personalLibraryEnabled) {
      extractPhilosophicalStance(currentInput).then(stance => {
        if (stance) {
          setAppState(prev => ({
            ...prev,
            personalPhilosophyLibrary: [...prev.personalPhilosophyLibrary, { id: 'st_' + Date.now(), view: stance, sourceMessageId: userMsgId, timestamp: Date.now() }]
          }));
        }
      });
    }

    const personalContext = activeSession.personalLibraryEnabled ? appState.personalPhilosophyLibrary.map(s => s.view) : [];
    await streamExplicandumResponse(currentInput, personalContext, retrievedChunks, (chunk) => {
      setAppState(prev => ({
        ...prev,
        sessions: prev.sessions.map(s => s.id === prev.activeSessionId ? {
          ...s,
          messages: s.messages.map(m => m.id === assistantMsgId ? { ...m, content: chunk } : m)
        } : s)
      }));
    });

    setAppState(prev => {
      const finalMsg = prev.sessions.find(s => s.id === prev.activeSessionId)?.messages.find(m => m.id === assistantMsgId);
      const totalTokens = inputTokens + (finalMsg ? pgDb.calculateTokens(finalMsg.content) : 0);
      const newState = pgDb.updateUsage(prev, totalTokens, prev.currentUser!.id, currentIp);
      return {
        ...newState,
        status: 'idle',
        sessions: newState.sessions.map(s => s.id === newState.activeSessionId ? {
          ...s,
          messages: s.messages.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false, tokensConsumed: totalTokens } : m)
        } : s)
      };
    });
  };

  if (!appState.currentUser) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] opacity-50" />
        <div className="max-w-md w-full relative z-10 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black shadow-lg mb-4"><Icons.Library /></div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Explicandum</h1>
            <p className="text-zinc-500 text-sm text-center font-medium italic">Reasoning & Persistence Engine</p>
          </div>
          <div className="flex p-1 bg-zinc-900 rounded-xl mb-6">
            {['login', 'register', 'guest'].map((m) => (
              <button key={m} onClick={() => setAuthMode(m as any)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === m ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>{m.toUpperCase()}</button>
            ))}
          </div>
          <div className="space-y-4">
            {authMode !== 'guest' && (
              <>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white" placeholder="Username" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white" placeholder="Password" />
              </>
            )}
            {authError && <div className="text-red-400 text-[10px] font-bold bg-red-400/10 p-2 rounded-lg text-center border border-red-400/20">{authError}</div>}
            <button onClick={handleAuthAction} className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-zinc-200">Start Investigation</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="hidden md:flex w-80 flex-col border-r border-zinc-800 bg-zinc-950 p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black shadow-lg"><Icons.Library /></div>
          <h1 className="text-base font-bold text-white tracking-tight">Explicandum</h1>
        </div>

        <button 
          onClick={() => {
            const newS: ChatSession = { id: 's_'+Date.now(), title: 'New Investigation', messages: [{ id: 'w', role: 'assistant', content: 'Final Answer: System ready.' }], createdAt: Date.now(), lastActive: Date.now(), personalLibraryEnabled: true, activeFileIds: [] };
            setAppState(prev => ({ ...prev, sessions: [newS, ...prev.sessions], activeSessionId: newS.id, status: 'idle' }));
          }} 
          className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-6 rounded-xl bg-zinc-900 text-zinc-100 hover:bg-zinc-800 transition-all border border-zinc-800"
        >
          <Icons.Plus /> <span className="text-sm font-medium">New Thread</span>
        </button>

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar space-y-6">
          {/* Section 1: History */}
          <section>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Icons.History /><h2 className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">History</h2>
            </div>
            <div className="space-y-1">
              {appState.sessions.map(s => (
                <button key={s.id} onClick={() => setAppState(prev => ({ ...prev, activeSessionId: s.id, status: 'idle' }))} className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${appState.activeSessionId === s.id && appState.status !== 'admin' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-400'}`}>
                  <div className="truncate">{s.title}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: Cognitive Controls (RESTORED) */}
          <section className="pt-4 border-t border-zinc-900">
            <h2 className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-3 px-1">Cognitive Context</h2>
            <div className="space-y-2">
              <button onClick={() => setRagEnabled(!ragEnabled)} className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${ragEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                <div className="flex items-center gap-2 text-[10px] font-bold"><Icons.Database /> RAG Retrieval</div>
                <div className={`w-2 h-2 rounded-full ${ragEnabled ? 'bg-blue-400 animate-pulse' : 'bg-zinc-800'}`} />
              </button>
              <button 
                onClick={() => setAppState(prev => ({ ...prev, sessions: prev.sessions.map(s => s.id === prev.activeSessionId ? { ...s, personalLibraryEnabled: !s.personalLibraryEnabled } : s)}))} 
                className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${activeSession?.personalLibraryEnabled ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold"><Icons.Scroll /> Stance Memory</div>
                <div className={`w-2 h-2 rounded-full ${activeSession?.personalLibraryEnabled ? 'bg-purple-400 animate-pulse' : 'bg-zinc-800'}`} />
              </button>
            </div>
          </section>

          {/* Section 3: Knowledge Store (RESTORED LIST) */}
          <section className="pt-4 border-t border-zinc-900">
             <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Knowledge Base</h2>
                <button onClick={() => fileInputRef.current?.click()} className="text-zinc-500 hover:text-white transition-colors"><Icons.Plus /></button>
             </div>
             <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                {appState.fileLibrary.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-zinc-900/40 p-1.5 rounded-lg border border-zinc-900">
                    <span className="text-[9px] text-zinc-400 truncate flex items-center gap-1.5"><Icons.Document /> {f.name}</span>
                    <button onClick={() => setAppState(prev => ({ ...prev, fileLibrary: prev.fileLibrary.filter(x => x.id !== f.id), vectorStore: prev.vectorStore.filter(v => v.fileId !== f.id) }))} className="text-zinc-700 hover:text-red-500"><Icons.Trash /></button>
                  </div>
                ))}
             </div>
          </section>

          {/* Section 4: Personal Philosophy (NEW LIST) */}
          <section className="pt-4 border-t border-zinc-900">
            <h2 className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-2 px-1">Thought Library</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
               {appState.personalPhilosophyLibrary.map(st => (
                 <div key={st.id} className="p-2 bg-zinc-900/20 border border-zinc-900 rounded-lg text-[10px] text-zinc-400 italic leading-relaxed">
                   "{st.view}"
                 </div>
               ))}
               {appState.personalPhilosophyLibrary.length === 0 && <div className="text-[9px] text-zinc-700 italic px-1">No stances extracted yet.</div>}
            </div>
          </section>

          {/* Section 5: Admin */}
          {appState.currentUser?.role === 'admin' && (
             <button onClick={() => setAppState(prev => ({ ...prev, status: 'admin' }))} className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all border ${appState.status === 'admin' ? 'bg-white text-black border-white' : 'text-zinc-400 hover:bg-zinc-900 border-zinc-900'}`}>
               <Icons.Lock /> <span>Admin Backend</span>
             </button>
          )}
        </div>

        {/* Quota Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-900">
          <div className="flex justify-between text-[9px] font-bold text-zinc-500 mb-2 uppercase tracking-tighter">
            <span>Resource Usage</span>
            <span>{Math.round((appState.currentUser.tokensUsed / appState.currentUser.tokenQuota) * 100)}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${Math.min(100, (appState.currentUser.tokensUsed / appState.currentUser.tokenQuota) * 100)}%` }} />
          </div>
        </div>

        {/* Profile */}
        <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">{appState.currentUser.username[0]}</div>
            <div className="truncate text-[10px] font-bold text-zinc-400">{appState.currentUser.username}</div>
          </div>
          <button onClick={handleLogout} className="text-zinc-700 hover:text-white transition-colors"><Icons.Logout /></button>
        </div>
      </div>

      {/* Main Content */}
      {appState.status === 'admin' ? (
        <AdminDashboard state={appState} onClose={() => setAppState(prev => ({ ...prev, status: 'idle' }))} onUpdateUser={handleUpdateUser} />
      ) : (
        <div className="flex-1 flex flex-col relative bg-black">
          <header className="flex items-center justify-between p-4 border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Investigation Thread</span>
              <span className="font-medium text-zinc-200 text-sm truncate max-w-xs">{activeSession?.title || 'System Standby'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-[9px] font-mono text-zinc-500 border border-zinc-800 rounded px-2 py-0.5">
                {appState.currentUser.tokensUsed.toLocaleString()} / {appState.currentUser.tokenQuota.toLocaleString()} TKN
              </div>
              <Icons.Database />
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-10 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              {activeSession?.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} allFiles={appState.fileLibrary} />
              ))}
              {appState.status === 'busy' && (
                <div className="flex gap-3 p-4 items-center text-zinc-500 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl w-fit animate-pulse">
                  <div className="w-3 h-3 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                  <span className="text-xs font-medium italic">Agent interaction in progress...</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              {pendingFileIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {pendingFileIds.map(fid => (
                    <div key={fid} className="flex items-center gap-2 bg-blue-500/10 text-blue-400 text-[9px] font-bold py-1 px-3 rounded-full border border-blue-500/20">
                      <span>{appState.fileLibrary.find(f => f.id === fid)?.name}</span>
                      <button onClick={() => setPendingFileIds(prev => prev.filter(x => x !== fid))} className="hover:text-white">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className={`relative ${!activeSession ? 'opacity-20 pointer-events-none' : ''}`}>
                <textarea 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                  placeholder="Analyze logical structure or philosophical background..." 
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-16 py-4 focus:outline-none focus:ring-1 focus:ring-zinc-700 text-zinc-200 resize-none text-sm placeholder-zinc-700" 
                  rows={1}
                />
                <button onClick={() => fileInputRef.current?.click()} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-zinc-700 hover:text-zinc-400"><Icons.Paperclip /></button>
                <button onClick={handleSendMessage} disabled={!input.trim() || appState.status !== 'idle'} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input.trim() && appState.status === 'idle' ? 'bg-white text-black shadow-lg' : 'bg-zinc-800 text-zinc-700 opacity-50'}`}><Icons.Send /></button>
              </div>
              <p className="text-center text-[8px] text-zinc-800 mt-4 uppercase tracking-[0.5em] font-bold">Persistence Node {currentIp}</p>
            </div>
          </div>
          <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.md,.json,.csv" />
        </div>
      )}
    </div>
  );
};

export default App;
