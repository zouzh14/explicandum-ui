
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, ChatSession, User, AppState, PhilosophicalStance, FileAttachment, IpRegistry, VectorChunk } from './types';
import { Icons } from './constants';
import { translations } from './i18n';
import MessageBubble from './components/MessageBubble';
import AdminDashboard from './components/AdminDashboard';
import ThoughtLibrary from './components/ThoughtLibrary';
import UserProfile from './components/UserProfile';
import FileManager from './components/FileManager';
import KnowledgeSidebar from './components/KnowledgeSidebar';
import { streamExplicandumResponse, extractPhilosophicalStance, deletePhilosophicalStance, deleteChatSession } from './services/geminiService';
import { vectorStore, pgDb } from './services/dbService';

const ANONYMOUS_LIMIT = 3;
const DEFAULT_QUOTA = 100000;
const GUEST_QUOTA = 20000;
const API_BASE_URL = "http://localhost:8000";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    const saved = localStorage.getItem('explicandum_state_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { 
            ...parsed, 
            status: 'idle',
            language: (parsed.language === 'en' || parsed.language === 'zh') ? parsed.language : 'en',
            rightSidebarOpen: parsed.rightSidebarOpen !== undefined ? !!parsed.rightSidebarOpen : true,
            leftToolsCollapsed: parsed.leftToolsCollapsed !== undefined ? !!parsed.leftToolsCollapsed : false,
            registeredUsers: Array.isArray(parsed.registeredUsers) ? parsed.registeredUsers : [],
            sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
            personalPhilosophyLibrary: Array.isArray(parsed.personalPhilosophyLibrary) ? parsed.personalPhilosophyLibrary : [],
            fileLibrary: Array.isArray(parsed.fileLibrary) ? parsed.fileLibrary : [],
            vectorStore: Array.isArray(parsed.vectorStore) ? parsed.vectorStore : [],
            ipRegistry: parsed.ipRegistry || {}
          };
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
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
      ipRegistry: {},
      rightSidebarOpen: true,
      leftToolsCollapsed: false,
      language: 'en'
    };
  });

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Verification code cooling
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const [input, setInput] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  const [pendingFileIds, setPendingFileIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentIp, setCurrentIp] = useState<string>('unknown');
  
  // State for renaming
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

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

  const t = translations[appState.language];

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

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email');
      return;
    }
    setIsSendingCode(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCountdown(60);
        setAuthError('');
      } else {
        setAuthError(data.message);
      }
    } catch (e) {
      setAuthError('Failed to connect to auth server');
    } finally {
      setIsSendingCode(false);
    }
  };

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
      if (!username || !password || !email || !verificationCode) {
        setAuthError('All fields required for registration');
        return;
      }
      
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verificationCode, username, password })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
          const newUser: User = {
            ...data.user,
            password, // Storing locally for this demo's simple auth
            registrationIp: currentIp,
            createdAt: Date.now(),
            isAnonymous: false,
            tokensUsed: 0,
            requestCount: 0,
            lastRequestAt: 0
          };
          await pgDb.saveUser(newUser);
          setAppState(prev => ({ ...prev, registeredUsers: [...prev.registeredUsers, newUser], currentUser: newUser }));
        } else {
          setAuthError(data.message);
        }
      } catch (e) {
        setAuthError('Verification failed');
      }
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

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAppState(prev => {
      const newSessions = prev.sessions.filter(s => s.id !== id);
      const newActiveId = prev.activeSessionId === id 
        ? (newSessions.length > 0 ? newSessions[0].id : null)
        : prev.activeSessionId;
      return {
        ...prev,
        sessions: newSessions,
        activeSessionId: newActiveId
      };
    });
    await deleteChatSession(id);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setAppState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, title: newTitle } : s)
    }));
    setEditingSessionId(null);
  };

  const handleDeleteStance = async (id: string) => {
    setAppState(prev => ({
      ...prev,
      personalPhilosophyLibrary: prev.personalPhilosophyLibrary.filter(s => s.id !== id)
    }));
    await deletePhilosophicalStance(id);
  };

  const handleDeleteAccount = () => {
    setAppState(prev => ({
      ...prev,
      registeredUsers: prev.registeredUsers.filter(u => u.id !== prev.currentUser?.id),
      currentUser: null,
      activeSessionId: null,
      status: 'idle'
    }));
  };

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
    Array.from(files).forEach((file: File) => {
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
    await streamExplicandumResponse(currentInput, personalContext, retrievedChunks, activeSession.id, (chunk) => {
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
      <div className="h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fff_0%,_#f4f4f5_100%)] opacity-50" />
        <div className="max-w-md w-full relative z-10 bg-white border border-zinc-200 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4"><Icons.Library /></div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Explicandum</h1>
            <p className="text-zinc-500 text-sm text-center font-medium italic">Reasoning & Persistence Engine</p>
            <div className="mt-4 flex gap-1 p-1 bg-zinc-100 rounded-lg">
              <button onClick={() => setAppState(prev => ({ ...prev, language: 'en' }))} className={`px-2 py-0.5 text-[9px] font-bold rounded ${appState.language === 'en' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}>EN</button>
              <button onClick={() => setAppState(prev => ({ ...prev, language: 'zh' }))} className={`px-2 py-0.5 text-[9px] font-bold rounded ${appState.language === 'zh' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}>中</button>
            </div>
          </div>
          <div className="flex p-1 bg-zinc-100 rounded-xl mb-6">
            {['login', 'register', 'guest'].map((m) => (
              <button key={m} onClick={() => setAuthMode(m as any)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === m ? 'bg-white text-zinc-900 shadow' : 'text-zinc-400 hover:text-zinc-600'}`}>{(t as any)[m].toUpperCase()}</button>
            ))}
          </div>
          <div className="space-y-4">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900" placeholder={t.username} />
            
            {authMode === 'register' && (
              <>
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900" placeholder={t.email} />
                  <button 
                    disabled={countdown > 0 || isSendingCode}
                    onClick={handleSendCode}
                    className="px-4 bg-zinc-900 text-white rounded-xl text-[10px] font-bold disabled:opacity-50 transition-all hover:bg-black whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : (isSendingCode ? '...' : t.getCode)}
                  </button>
                </div>
                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900" placeholder={t.verificationCode} />
              </>
            )}

            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900" placeholder={t.password} />
            
            {authError && <div className="text-red-500 text-[10px] font-bold bg-red-50 p-2 rounded-lg text-center border border-red-100">{(t as any)[authError] || authError}</div>}
            
            <button onClick={handleAuthAction} className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md">
              {authMode === 'register' ? t.verifyAndJoin : t.startInvestigation}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-zinc-900">
      {/* Sidebar */}
      <div className="hidden md:flex w-80 flex-col border-r border-zinc-200 bg-zinc-50 p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white shadow-lg"><Icons.Library /></div>
          <h1 className="text-base font-bold text-zinc-900 tracking-tight">Explicandum</h1>
        </div>

        <button 
          onClick={() => {
            const newS: ChatSession = { id: 's_'+Date.now(), title: appState.language === 'zh' ? '新调查' : 'New Investigation', messages: [{ id: 'w', role: 'assistant', content: 'Final Answer: System ready.' }], createdAt: Date.now(), lastActive: Date.now(), personalLibraryEnabled: true, activeFileIds: [] };
            setAppState(prev => ({ ...prev, sessions: [newS, ...prev.sessions], activeSessionId: newS.id, status: 'idle' }));
          }} 
          className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-6 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 transition-all border border-zinc-200 shadow-sm"
        >
          <Icons.Plus /> <span className="text-sm font-medium">{t.newThread}</span>
        </button>

        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          {/* Section 1: History */}
          <section className={`${appState.leftToolsCollapsed ? 'flex-1' : 'flex-[1.5]'} flex flex-col min-h-0 transition-all duration-300`}>
            <div className="flex items-center gap-2 mb-2 px-1 flex-shrink-0">
              <Icons.History /><h2 className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">{t.history}</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {appState.sessions.map(s => (
                <div key={s.id} className="group relative">
                  {editingSessionId === s.id ? (
                    <input 
                      autoFocus
                      className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRenameSession(s.id, editTitle)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSession(s.id, editTitle); }}
                    />
                  ) : (
                    <button 
                      onClick={() => setAppState(prev => ({ ...prev, activeSessionId: s.id, status: 'idle' }))} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-all ${appState.activeSessionId === s.id && appState.status !== 'admin' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      <div className="truncate flex-1 text-left">{s.title}</div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div 
                          onClick={(e) => { e.stopPropagation(); setEditingSessionId(s.id); setEditTitle(s.title); }}
                          className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600"
                          title="Rename"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </div>
                        <div 
                          onClick={(e) => handleDeleteSession(e, s.id)}
                          className="p-1 rounded hover:bg-red-50 text-red-400 transition-all"
                          title="Delete"
                        >
                          <Icons.Trash />
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {!appState.leftToolsCollapsed && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2">
          {/* Section 2: Cognitive Controls */}
          <section className="flex-shrink-0 pt-4 border-t border-zinc-200">
            <h2 className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest mb-3 px-1">{t.cognitiveContext}</h2>
            <div className="space-y-2">
              <button onClick={() => setRagEnabled(!ragEnabled)} className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${ragEnabled ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>
                <div className="flex items-center gap-2 text-[10px] font-bold"><Icons.Database /> {t.ragRetrieval}</div>
                <div className={`w-2 h-2 rounded-full ${ragEnabled ? 'bg-blue-500 animate-pulse' : 'bg-zinc-200'}`} />
              </button>
              <button 
                onClick={() => setAppState(prev => ({ ...prev, sessions: prev.sessions.map(s => s.id === prev.activeSessionId ? { ...s, personalLibraryEnabled: !s.personalLibraryEnabled } : s)}))} 
                className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${activeSession?.personalLibraryEnabled ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>
                <div className="flex items-center gap-2 text-[10px] font-bold"><Icons.Scroll /> {t.stanceMemory}</div>
                <div className={`w-2 h-2 rounded-full ${activeSession?.personalLibraryEnabled ? 'bg-purple-500 animate-pulse' : 'bg-zinc-200'}`} />
              </button>
            </div>
          </section>

          {/* Section 3: Knowledge Store */}
          <section className="flex-shrink-0 pt-4 border-t border-zinc-200">
             <div className="flex items-center justify-between mb-2 px-1 flex-shrink-0">
                <h2 className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">{t.knowledgeBase}</h2>
                <button onClick={() => fileInputRef.current?.click()} className="text-zinc-400 hover:text-zinc-900 transition-colors" title="Upload Files"><Icons.Plus /></button>
             </div>
             <button 
                onClick={() => setAppState(prev => ({ ...prev, status: 'files' }))}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <Icons.Database /> 
                  <span>{t.manageKnowledge}</span>
                </div>
                <span className="text-[9px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-400 group-hover:text-zinc-600 transition-colors">
                  {appState.fileLibrary.length}
                </span>
              </button>
          </section>

          {/* Section 4: Personal Philosophy */}
          <section className="flex-shrink-0 pt-4 border-t border-zinc-200">
            <h2 className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest mb-2 px-1">{t.thoughtLibrary}</h2>
            <button 
              onClick={() => setAppState(prev => ({ ...prev, status: 'library' }))}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <Icons.Scroll /> 
                <span>{t.viewStanceArchive}</span>
              </div>
              <span className="text-[9px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-400 group-hover:text-zinc-600 transition-colors">
                {appState.personalPhilosophyLibrary.length}
              </span>
            </button>
          </section>

          {/* Section 5: Admin */}
          {appState.currentUser?.role === 'admin' && (
             <div className="flex-shrink-0 pt-2">
               <button onClick={() => setAppState(prev => ({ ...prev, status: 'admin' }))} className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all border ${appState.status === 'admin' ? 'bg-zinc-900 text-white border-zinc-900' : 'text-zinc-500 hover:bg-zinc-100 border-transparent'}`}>
                 <Icons.Lock /> <span>{t.adminBackend}</span>
               </button>
             </div>
          )}
          </div>
          )}
        </div>

        {/* Toggle Tools Button (Designer's choice: Floating above the usage bar) */}
        <div className="px-2 mb-2">
          <button 
            onClick={() => setAppState(prev => ({ ...prev, leftToolsCollapsed: !prev.leftToolsCollapsed }))}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-zinc-200 hover:shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 transition-transform duration-500 ${appState.leftToolsCollapsed ? '' : 'rotate-180'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
            <span>{appState.leftToolsCollapsed ? t.showWorkspace : t.minimizeTools}</span>
          </button>
        </div>

        {/* Quota Bar */}
        <div className="mt-2 pt-4 border-t border-zinc-200">
          <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-2 uppercase tracking-tighter">
            <span>{t.resourceUsage}</span>
            <span>{Math.round((appState.currentUser.tokensUsed / appState.currentUser.tokenQuota) * 100)}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
             <div className="h-full bg-zinc-900 transition-all duration-700" style={{ width: `${Math.min(100, (appState.currentUser.tokensUsed / appState.currentUser.tokenQuota) * 100)}%` }} />
          </div>
        </div>

        {/* Profile */}
        <div className="mt-4 pt-4 border-t border-zinc-200 flex items-center gap-1">
          <button 
            onClick={() => setAppState(prev => ({ ...prev, status: 'profile' }))}
            className={`flex-1 flex items-center justify-between p-2 rounded-xl transition-all ${appState.status === 'profile' ? 'bg-white shadow-sm ring-1 ring-zinc-200' : 'hover:bg-zinc-100'}`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold shadow-sm">{appState.currentUser.username[0].toUpperCase()}</div>
              <div className="truncate text-[11px] font-bold text-zinc-700">{appState.currentUser.username}</div>
            </div>
            <div className="text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
            title={t.signOut}
          >
            <Icons.Logout />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {appState.status === 'admin' ? (
        <AdminDashboard state={appState} language={appState.language} onClose={() => setAppState(prev => ({ ...prev, status: 'idle' }))} onUpdateUser={handleUpdateUser} />
      ) : appState.status === 'library' ? (
        <ThoughtLibrary state={appState} onClose={() => setAppState(prev => ({ ...prev, status: 'idle' }))} onDeleteStance={handleDeleteStance} />
      ) : appState.status === 'files' ? (
        <FileManager 
          state={appState} 
          language={appState.language}
          onClose={() => setAppState(prev => ({ ...prev, status: 'idle' }))} 
          onDeleteFile={(id) => setAppState(prev => ({ ...prev, fileLibrary: prev.fileLibrary.filter(x => x.id !== id), vectorStore: prev.vectorStore.filter(v => v.fileId !== id) }))} 
        />
      ) : appState.status === 'profile' ? (
        <UserProfile user={appState.currentUser!} language={appState.language} onClose={() => setAppState(prev => ({ ...prev, status: 'idle' }))} onDeleteAccount={handleDeleteAccount} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col relative bg-white">
            <header className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{t.investigationThread}</span>
                <span className="font-medium text-zinc-900 text-sm truncate max-w-xs">{activeSession?.title || t.systemStandby}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg mr-2">
                  <button onClick={() => setAppState(prev => ({ ...prev, language: 'en' }))} className={`px-2 py-0.5 text-[9px] font-bold rounded ${appState.language === 'en' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}>EN</button>
                  <button onClick={() => setAppState(prev => ({ ...prev, language: 'zh' }))} className={`px-2 py-0.5 text-[9px] font-bold rounded ${appState.language === 'zh' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}>中</button>
                </div>
                <div className="hidden sm:block text-[9px] font-mono text-zinc-400 border border-zinc-200 rounded px-2 py-0.5">
                  {appState.currentUser.tokensUsed.toLocaleString()} / {appState.currentUser.tokenQuota.toLocaleString()} TKN
                </div>
                <button 
                  onClick={() => setAppState(prev => ({ ...prev, rightSidebarOpen: !prev.rightSidebarOpen }))}
                  className={`p-2 rounded-lg transition-all ${appState.rightSidebarOpen ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                  title="Toggle Knowledge Sidebar"
                >
                  <Icons.Library />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-10 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              {activeSession?.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} allFiles={appState.fileLibrary} />
              ))}
              {appState.status === 'busy' && (
                <div className="flex gap-3 p-4 items-center text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-2xl w-fit animate-pulse">
                  <div className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                  <span className="text-xs font-medium italic">{t.agentInProgress}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              {pendingFileIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {pendingFileIds.map(fid => (
                    <div key={fid} className="flex items-center gap-2 bg-blue-50 text-blue-600 text-[9px] font-bold py-1 px-3 rounded-full border border-blue-100">
                      <span>{appState.fileLibrary.find(f => f.id === fid)?.name}</span>
                      <button onClick={() => setPendingFileIds(prev => prev.filter(x => x !== fid))} className="hover:text-blue-800">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className={`relative ${!activeSession ? 'opacity-20 pointer-events-none' : ''}`}>
                <textarea 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                  placeholder={t.inputPlaceholder} 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-16 py-4 focus:outline-none focus:ring-1 focus:ring-zinc-300 text-zinc-900 resize-none text-sm placeholder-zinc-400" 
                  rows={1}
                />
                <button onClick={() => fileInputRef.current?.click()} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600"><Icons.Paperclip /></button>
                <button onClick={handleSendMessage} disabled={!input.trim() || appState.status !== 'idle'} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${input.trim() && appState.status === 'idle' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-100 text-zinc-300 opacity-50'}`}><Icons.Send /></button>
              </div>
              <p className="text-center text-[8px] text-zinc-300 mt-4 uppercase tracking-[0.5em] font-bold">{t.persistenceNode} {currentIp}</p>
            </div>
          </div>
          <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.md,.json,.csv" />
          </div>
          {appState.rightSidebarOpen && (
            <KnowledgeSidebar 
              state={appState} 
              language={appState.language}
              activeSessionMessages={activeSession?.messages.map(m => m.id) || []}
              onClose={() => setAppState(prev => ({ ...prev, rightSidebarOpen: false }))} 
              onDeleteStance={handleDeleteStance}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
