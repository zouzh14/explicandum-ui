/**
 * API配置管理
 * 使用统一配置管理，消除配置冗余
 */

// 导入统一配置
import { 
  ENV_CONFIG, 
  API_ENDPOINTS, 
  HTTP_STATUS, 
  ERROR_CODES, 
  type HttpMethod,
  type PaginationParams,
  type PaginatedResponse,
  type ApiResponse
} from '../../shared/config';

/**
 * 兼容性接口 - 保持向后兼容
 */
export interface ApiConfig {
  BASE_URL: string;
  WS_URL: string;
  TIMEOUT: number;
  RETRY_ATTEMPTS: number;
  ENABLE_LOGGING: boolean;
}

/**
 * 当前API配置 - 从统一配置获取
 */
export const API_CONFIG: ApiConfig = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  WS_URL: ENV_CONFIG.API_WS_URL,
  TIMEOUT: ENV_CONFIG.API_TIMEOUT,
  RETRY_ATTEMPTS: ENV_CONFIG.API_RETRY_ATTEMPTS,
  ENABLE_LOGGING: ENV_CONFIG.API_ENABLE_LOGGING,
};

/**
 * 获取当前环境配置 - 保持向后兼容
 */
export const getApiConfig = (): ApiConfig => API_CONFIG;

/**
 * 日志工具 - 使用统一配置
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

// 重新导出所有统一配置，保持向后兼容
export {
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_CODES,
  type HttpMethod,
  type PaginationParams,
  type PaginatedResponse,
  type ApiResponse,
};
