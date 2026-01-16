
import { Language } from './i18n';

export enum AgentType {
  SYSTEM = 'SYSTEM',
  LOGIC_ANALYST = 'LOGIC_ANALYST',
  PHILOSOPHY_EXPERT = 'PHILOSOPHY_EXPERT',
  USER = 'USER'
}

export interface ThinkingStep {
  agent: AgentType;
  content: string;
  timestamp: number;
}

export interface PhilosophicalStance {
  id: string;
  view: string;
  sourceMessageId: string;
  timestamp: number;
}

export interface VectorChunk {
  id: string;
  fileId: string;
  fileName: string;
  content: string;
  index: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; 
  isIndexed: boolean;
  chunks: string[]; 
  timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinkingSteps?: ThinkingStep[];
  ragSources?: string[];
  attachedFileIds?: string[];
  retrievedChunkIds?: string[];
  isStreaming?: boolean;
  tokensConsumed?: number; // New field for cost auditing
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'researcher' | 'guest';
  registrationIp: string;
  createdAt: number;
  isAnonymous: boolean;
  // Quota & Tracking
  tokenQuota: number;
  tokensUsed: number;
  requestCount: number;
  lastRequestAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  lastActive: number;
  personalLibraryEnabled: boolean;
  activeFileIds: string[];
}

export interface IpRegistry {
  [ip: string]: {
    anonymousCount: number;
    lastSeen: number;
    totalTokensUsed: number;
    totalRequests: number;
  };
}

export interface AppState {
  currentUser: User | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
  personalPhilosophyLibrary: PhilosophicalStance[];
  fileLibrary: FileAttachment[];
  vectorStore: VectorChunk[]; 
  status: 'idle' | 'busy' | 'indexing' | 'admin' | 'library' | 'profile' | 'files'; // Added files status
  registeredUsers: User[];
  ipRegistry: IpRegistry;
  rightSidebarOpen: boolean;
  leftToolsCollapsed: boolean;
  language: Language;
}
