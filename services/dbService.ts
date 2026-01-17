
import { VectorChunk, FileAttachment, User, AppState } from '../types';

const RATE_LIMIT_MS = 5000; // 5 seconds between requests

export const vectorStore = {
  async indexFile(file: FileAttachment): Promise<VectorChunk[]> {
    const chunkSize = 1000;
    const overlap = 100;
    const chunks: VectorChunk[] = [];
    let start = 0;
    let index = 0;
    while (start < file.content.length) {
      const end = start + chunkSize;
      chunks.push({
        id: `chunk_${file.id}_${index}`,
        fileId: file.id,
        fileName: file.name,
        content: file.content.slice(start, end),
        index
      });
      start += (chunkSize - overlap);
      index++;
    }
    await new Promise(resolve => setTimeout(resolve, 800));
    return chunks;
  },

  async similaritySearch(query: string, availableChunks: VectorChunk[], limit: number = 3): Promise<VectorChunk[]> {
    const queryTerms = query.toLowerCase().split(/\s+/);
    return availableChunks.map(chunk => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      queryTerms.forEach(term => { if (contentLower.includes(term)) score += 1; });
      return { chunk, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(res => res.chunk);
  }
};

export const pgDb = {
  /**
   * Validates if a user can make a request based on their quota and rate limits.
   */
  checkQuota: (user: User): { allowed: boolean; reason?: string } => {
    if (user.role === 'admin') return { allowed: true };
    
    // Rate limit check
    const now = Date.now();
    if (now - user.lastRequestAt < RATE_LIMIT_MS) {
      return { allowed: false, reason: "Rate limit: Please wait a few seconds before the next query." };
    }

    // Token quota check
    if (user.tokensUsed >= user.tokenQuota) {
      return { allowed: false, reason: "Quota exhausted. Please contact an administrator." };
    }

    return { allowed: true };
  },

  /**
   * Approximates token count (1 token ≈ 4 characters).
   */
  calculateTokens: (text: string): number => {
    return Math.ceil(text.length / 4);
  },

  saveSession: async (session: any) => {
    console.log(`[Postgres] Persisted session ${session.id}`);
  },

  saveUser: async (user: any) => {
     console.log(`[Postgres] Created user ${user.username}`);
  },

  /**
   * Updates usage statistics for both the user and their IP address.
   */
  updateUsage: (state: AppState, tokens: number, userId: string, ip: string): AppState => {
    const updatedUsers = state.registeredUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          tokensUsed: u.tokensUsed + tokens,
          requestCount: u.requestCount + 1,
          lastRequestAt: Date.now()
        };
      }
      return u;
    });

    const currentIpStats = state.ipRegistry[ip] || { lastSeen: Date.now(), totalTokensUsed: 0, totalRequests: 0 };
    const updatedIpRegistry = {
      ...state.ipRegistry,
      [ip]: {
        ...currentIpStats,
        totalTokensUsed: currentIpStats.totalTokensUsed + tokens,
        totalRequests: currentIpStats.totalRequests + 1,
        lastSeen: Date.now()
      }
    };

    const currentUser = state.currentUser?.id === userId ? 
      updatedUsers.find(u => u.id === userId) || state.currentUser : 
      state.currentUser;

    return {
      ...state,
      registeredUsers: updatedUsers,
      ipRegistry: updatedIpRegistry,
      currentUser
    };
  }
};
