/**
 * API配置管理
 * 统一管理API基础URL、超时、重试等配置
 */

export interface ApiConfig {
  BASE_URL: string;
  WS_URL: string;
  TIMEOUT: number;
  RETRY_ATTEMPTS: number;
  ENABLE_LOGGING: boolean;
}

/**
 * 开发环境配置
 */
const developmentConfig: ApiConfig = {
  BASE_URL: 'http://localhost:8000',
  WS_URL: 'ws://localhost:8000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ENABLE_LOGGING: true,
};

/**
 * 生产环境配置
 */
const productionConfig: ApiConfig = {
  BASE_URL: 'https://api.explicandum.org',
  WS_URL: 'wss://api.explicandum.org',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 2,
  ENABLE_LOGGING: false,
};

/**
 * 测试环境配置
 */
const testConfig: ApiConfig = {
  BASE_URL: 'http://localhost:8001',
  WS_URL: 'ws://localhost:8001',
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 1,
  ENABLE_LOGGING: true,
};

/**
 * 获取当前环境配置
 */
export const getApiConfig = (): ApiConfig => {
  const env = import.meta.env?.MODE || 'development';
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

/**
 * 当前API配置
 */
export const API_CONFIG = getApiConfig();

/**
 * API端点常量
 */
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/verify-register',
    SEND_CODE: '/auth/send-code',
    CREATE_TEMP: '/auth/create-temp',
  },
  
  // 用户管理
  USERS: {
    LIST: '/admin/users',
    STATS: '/admin/users/stats',
    DETAIL: (id: string) => `/admin/users/${id}`,
    UPDATE: (id: string) => `/admin/users/${id}`,
    DELETE: (id: string) => `/admin/users/${id}`,
    RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset-password`,
    UPGRADE_TEMP: (id: string) => `/admin/users/${id}/upgrade-temp`,
    BATCH_UPDATE: '/admin/users/batch-update',
  },
  
  // 监控相关
  MONITORING: {
    RISKS: '/api/v1/monitoring/risks',
    RISKS_STATS: '/api/v1/monitoring/risks/statistics',
    RISKS_RESOLVE: (id: string) => `/api/v1/monitoring/risks/${id}/resolve`,
    EMAIL_STATUS: '/api/v1/monitoring/email/status',
    EMAIL_TEST: '/api/v1/monitoring/email/test',
    SYSTEM_HEALTH: '/api/v1/monitoring/system/health',
    SCAN_RISKS: '/api/v1/monitoring/risks/scan',
    DAILY_REPORT: '/api/v1/monitoring/email/daily-report',
    CLEANUP_RISKS: '/api/v1/monitoring/risks/cleanup',
  },
  
  // 邀请码管理
  INVITATIONS: {
    LIST: '/admin/invitations',
    CREATE: '/admin/invitations',
    DETAIL: (id: string) => `/admin/invitations/${id}`,
    DELETE: (id: string) => `/admin/invitations/${id}`,
    UPDATE: (id: string) => `/admin/invitations/${id}`,
    STATS: '/admin/invitations/stats',
  },
  
  // 聊天相关
  CHAT: {
    SEND: '/chat',
    SESSIONS: '/sessions',
    SESSION_CREATE: '/sessions',
    SESSION_DELETE: (id: string) => `/sessions/${id}`,
    STANCES: '/stances',
    STANCE_CREATE: '/stances',
    STANCE_DELETE: (id: string) => `/stances/${id}`,
  },
  
  // 文件管理
  FILES: {
    UPLOAD: '/files/upload',
    LIST: '/files',
    DELETE: (id: string) => `/files/${id}`,
    DOWNLOAD: (id: string) => `/files/${id}/download`,
  },
  
  // 系统相关
  SYSTEM: {
    HEALTH: '/health',
    INFO: '/system/info',
    SETTINGS: '/admin/system/settings',
    BACKUP: '/admin/system/backup',
    RESTORE: '/admin/system/restore',
  },
} as const;

/**
 * HTTP状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * 请求方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 标准分页响应接口
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * API响应包装接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    request_id: string;
    version: string;
  };
}

/**
 * 日志工具
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.debug(`[API Debug] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.info(`[API Info] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.warn(`[API Warn] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.error(`[API Error] ${message}`, ...args);
    }
  },
};

/**
 * 构建完整URL的辅助函数
 */
export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  
  if (!params || Object.keys(params).length === 0) {
    return `${baseUrl}${cleanEndpoint}`;
  }
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return `${baseUrl}${cleanEndpoint}${queryString ? `?${queryString}` : ''}`;
};

/**
 * 检查是否为网络错误
 */
export const isNetworkError = (error: any): boolean => {
  return error instanceof TypeError && 
         (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('ECONNREFUSED'));
};

/**
 * 检查是否为超时错误
 */
export const isTimeoutError = (error: any): boolean => {
  return error.name === 'AbortError' || 
         error.message.includes('timeout') ||
         error.code === 'TIMEOUT';
};

/**
 * 检查是否为认证错误
 */
export const isAuthError = (status: number): boolean => {
  return status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN;
};

/**
 * 检查是否为客户端错误
 */
export const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500;
};

/**
 * 检查是否为服务器错误
 */
export const isServerError = (status: number): boolean => {
  return status >= 500;
};
