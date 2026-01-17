/**
 * 统一的API客户端基础类
 * 解决重复的API调用、错误处理和认证逻辑
 */

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  params?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export abstract class BaseApiClient {
  protected baseUrl: string;
  protected token: string | null = null;
  protected defaultTimeout: number = 10000;
  protected defaultRetries: number = 3;

  constructor(baseUrl: string, options?: { timeout?: number; retries?: number }) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
    if (options?.timeout) this.defaultTimeout = options.timeout;
    if (options?.retries) this.defaultRetries = options.retries;
  }

  /**
   * 设置认证token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * 获取认证token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * 获取认证头
   */
  protected getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * 构建查询字符串
   */
  protected buildQueryString(params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * 构建完整的URL
   */
  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const queryString = this.buildQueryString(params);
    return `${this.baseUrl}${cleanEndpoint}${queryString}`;
  }

  /**
   * 创建带超时的fetch请求
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = this.defaultTimeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout', 'TIMEOUT');
      }
      throw error;
    }
  }

  /**
   * 处理API响应
   */
  protected async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: any = null;

      try {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
          errorDetails = errorData;
        }
      } catch {
        // 如果解析错误响应失败，使用默认错误消息
      }

      throw new ApiError(
        response.status,
        errorMessage,
        response.statusText,
        errorDetails
      );
    }

    // 处理空响应
    if (response.status === 204) {
      return null as T;
    }

    // 处理JSON响应
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    // 处理文本响应
    if (contentType?.includes('text/')) {
      return (await response.text()) as T;
    }

    // 处理其他类型响应
    return response.blob() as T;
  }

  /**
   * 带重试机制的请求
   */
  protected async requestWithRetry<T>(
    url: string,
    options: RequestInit,
    retries: number = this.defaultRetries
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;

        // 如果是认证错误，不重试
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          throw error;
        }

        // 如果是客户端错误（4xx），不重试
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // 最后一次尝试，直接抛出错误
        if (attempt === retries) {
          throw error;
        }

        // 指数退避延迟
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * 核心请求方法
   */
  protected async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      headers = {},
      ...fetchOptions
    } = config;

    const url = this.buildUrl(endpoint, config.params);
    const requestHeaders = {
      ...this.getAuthHeaders(),
      ...headers,
    };

    const options: RequestInit = {
      ...fetchOptions,
      headers: requestHeaders,
    };

    return this.requestWithRetry<T>(url, options, retries);
  }

  /**
   * GET请求
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'method' | 'body' | 'params'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
      params,
    });
  }

  /**
   * POST请求
   */
  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT请求
   */
  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH请求
   */
  protected async patch<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE请求
   */
  protected async delete<T>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * 文件上传
   */
  protected async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    config?: Omit<RequestConfig, 'method' | 'body' | 'headers'>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const url = this.buildUrl(endpoint);
    const headers = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
    };

    const options: RequestInit = {
      method: 'POST',
      body: formData,
      headers,
    };

    return this.requestWithRetry<T>(url, options, 1); // 文件上传不重试
  }

  /**
   * 批量请求
   */
  protected async batch<T>(
    requests: Array<{
      endpoint: string;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
      params?: Record<string, any>;
    }>,
    config?: RequestConfig
  ): Promise<T[]> {
    const promises = requests.map(async req => {
      const method = req.method?.toLowerCase() || 'get';
      
      switch (method) {
        case 'post':
          return this.post<T>(req.endpoint, req.data, { ...config, params: req.params });
        case 'put':
          return this.put<T>(req.endpoint, req.data, { ...config, params: req.params });
        case 'patch':
          return this.patch<T>(req.endpoint, req.data, { ...config, params: req.params });
        case 'delete':
          return this.delete<T>(req.endpoint, { ...config, params: req.params });
        default:
          return this.get<T>(req.endpoint, req.params, config);
      }
    });

    return Promise.all(promises) as Promise<T[]>;
  }
}

/**
 * 全局API错误处理函数
 */
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  
  if (error instanceof Error) {
    return new ApiError(500, error.message, 'UNKNOWN_ERROR');
  }
  
  return new ApiError(500, 'Unknown error occurred', 'UNKNOWN_ERROR');
};

/**
 * 创建API客户端实例的工厂函数
 */
export const createApiClient = (
  baseUrl: string,
  options?: { timeout?: number; retries?: number }
): BaseApiClient => {
  return new (class extends BaseApiClient {})(baseUrl, options);
};
