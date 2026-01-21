/**
 * 认证服务 - 使用统一API客户端
 * 处理登录、注册、临时用户创建等认证相关操作
 */

import { BaseApiClient, handleApiError } from './base/BaseApiClient';
import { API_CONFIG, API_ENDPOINTS, logger } from '../config/api';
import { User } from '../types';

// 认证相关接口定义
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  timestamp: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
  };
  meta: {
    action: string;
    auth_type: string;
  };
}

export interface RegisterRequest {
  email: string;
  code: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  user?: User;
  access_token?: string;
  data?: {
    user: User;
    access_token: string;
  };
}

export interface SendCodeRequest {
  email: string;
}

export interface SendCodeResponse {
  status: string;
  message: string;
}

export interface CreateTempRequest {
  registration_ip: string;
}

export interface CreateTempResponse {
  status: string;
  access_token: string;
  token_type: string;
  user: User;
  upgrade_token: string;
  message?: string;
}

export interface ValidateTokenResponse {
  status: string;
  message: string;
  user: User;
}

/**
 * 认证服务类
 * 继承自BaseApiClient，提供认证相关的API调用
 */
class AuthService extends BaseApiClient {
  constructor() {
    super(API_CONFIG.BASE_URL, {
      timeout: API_CONFIG.TIMEOUT,
      retries: API_CONFIG.RETRY_ATTEMPTS,
    });
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      logger.debug('Attempting login for user:', credentials.username);
      
      const response = await this.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      if (response.status === 'success') {
        // 设置token到客户端
        this.setToken(response.data.access_token);
        logger.info('Login successful for user:', credentials.username);
      } else {
        logger.warn('Login failed for user:', credentials.username, response.message);
      }
      
      return response;
    } catch (error) {
      logger.error('Login error for user:', credentials.username, error);
      throw handleApiError(error);
    }
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string): Promise<SendCodeResponse> {
    try {
      logger.debug('Sending verification code to:', email);
      
      const response = await this.post<SendCodeResponse>(
        API_ENDPOINTS.AUTH.SEND_CODE,
        { email }
      );
      
      logger.info('Verification code sent to:', email);
      return response;
    } catch (error) {
      logger.error('Error sending verification code to:', email, error);
      throw handleApiError(error);
    }
  }

  /**
   * 注册用户
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      logger.debug('Registering user:', data.username);
      
      const response = await this.post<RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      
      if (response.status === 'success') {
        // 设置token到客户端
        const token = response.access_token || response.data?.access_token;
        if (token) {
          this.setToken(token);
        }
        logger.info('Registration successful for user:', data.username);
      } else {
        logger.warn('Registration failed for user:', data.username, response.message);
      }
      
      return response;
    } catch (error) {
      logger.error('Registration error for user:', data.username, error);
      throw handleApiError(error);
    }
  }

  /**
   * 创建临时用户
   */
  async createTempUser(registrationIp: string): Promise<CreateTempResponse> {
    try {
      logger.debug('Creating temporary user with IP:', registrationIp);
      
      const response = await this.post<CreateTempResponse>(
        API_ENDPOINTS.AUTH.CREATE_TEMP,
        { registration_ip: registrationIp }
      );
      
      if (response.status === 'success') {
        // 设置token到客户端
        this.setToken(response.access_token);
        logger.info('Temporary user created successfully');
      } else {
        logger.warn('Temporary user creation failed:', response.message);
      }
      
      return response;
    } catch (error) {
      logger.error('Error creating temporary user:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 验证token
   */
  async validateToken(token: string): Promise<ValidateTokenResponse> {
    try {
      logger.debug('Validating token');
      
      // 临时设置token进行验证
      const originalToken = this.getToken();
      this.setToken(token);
      
      const response = await this.get<ValidateTokenResponse>(
        API_ENDPOINTS.AUTH.VALIDATE
      );
      
      // 恢复原始token
      this.setToken(originalToken);
      
      logger.info('Token validation result:', response.status);
      return response;
    } catch (error) {
      logger.error('Token validation error:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 登出
   */
  logout(): void {
    this.setToken(null);
    logger.info('User logged out');
  }

  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * 获取当前用户token
   */
  getCurrentToken(): string | null {
    return this.getToken();
  }
}

// 创建单例实例
const authService = new AuthService();

export default authService;
