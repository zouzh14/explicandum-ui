// 用户管理API服务 - 重构版本使用统一API客户端
import { BaseApiClient, PaginatedResponse, handleApiError } from './base/BaseApiClient';
import { User } from '../types';
import { API_CONFIG, API_ENDPOINTS, logger } from '../config/api';

// 用户相关接口定义
export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export interface UserStatsResponse {
  total_users: number;
  role_distribution: {
    admin: number;
    researcher: number;
    user: number;
    temp: number;
  };
  active_users: number;
  new_users: number;
  token_stats: {
    total_used: number;
    total_quota: number;
    utilization_percent: number;
  };
}

export interface UserDetailResponse {
  user: User;
  applications: Array<{
    id: string;
    status: string;
    institution: string;
    created_at: number;
    reviewed_at: number | null;
  }>;
  invitations: Array<{
    id: string;
    code: string;
    created_by: string;
    used_by: string;
    is_used: boolean;
    used_count: number;
    max_uses: number;
  }>;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  role?: string;
  token_quota?: number;
  tokens_used?: number;
}

export interface UserUpgradeRequest {
  username: string;
  email: string;
  password?: string;
  role?: string;
  token_quota?: number;
}

export interface BatchUpdateRequest {
  user_ids: string[];
  update_fields: {
    token_quota?: number;
    role?: string;
    tokens_used?: number;
  };
}

export interface BatchUpdateResponse {
  message: string;
  updated_count: number;
  requested_count: number;
}

export interface DeleteUserResponse {
  message: string;
  deleted_user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface ResetPasswordResponse {
  message: string;
  user_id: string;
  username: string;
}

export interface UpgradeUserResponse {
  message: string;
  user: User;
}

export interface UpdateUserResponse {
  message: string;
  user: User;
}

/**
 * 用户管理服务类
 * 继承自BaseApiClient，提供用户管理相关的API调用
 */
class UserManagementService extends BaseApiClient {
  constructor() {
    super(API_CONFIG.BASE_URL, {
      timeout: API_CONFIG.TIMEOUT,
      retries: API_CONFIG.RETRY_ATTEMPTS,
    });
  }

  /**
   * 获取用户列表
   */
  async getUsers(params?: {
    page?: number;
    size?: number;
    search?: string;
    role?: string;
    is_temp?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<UserListResponse> {
    try {
      logger.debug('Fetching users with params:', params);
      
      const response = await this.get<UserListResponse>(
        API_ENDPOINTS.USERS.LIST,
        params
      );
      
      logger.info('Successfully fetched users:', response.users.length);
      return response;
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<UserStatsResponse> {
    try {
      logger.debug('Fetching user stats');
      
      const response = await this.get<UserStatsResponse>(
        API_ENDPOINTS.USERS.STATS
      );
      
      logger.info('Successfully fetched user stats');
      return response;
    } catch (error) {
      logger.error('Error fetching user stats:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 获取用户详细信息
   */
  async getUserDetail(userId: string): Promise<UserDetailResponse> {
    try {
      logger.debug('Fetching user detail for:', userId);
      
      const response = await this.get<UserDetailResponse>(
        API_ENDPOINTS.USERS.DETAIL(userId)
      );
      
      logger.info('Successfully fetched user detail for:', userId);
      return response;
    } catch (error) {
      logger.error('Error fetching user detail:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId: string, updateData: UserUpdateRequest): Promise<UpdateUserResponse> {
    try {
      logger.debug('Updating user:', userId, updateData);
      
      const response = await this.put<UpdateUserResponse>(
        API_ENDPOINTS.USERS.UPDATE(userId),
        updateData
      );
      
      logger.info('Successfully updated user:', userId);
      return response;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      logger.debug('Resetting password for user:', userId);
      
      const response = await this.post<ResetPasswordResponse>(
        API_ENDPOINTS.USERS.RESET_PASSWORD(userId),
        { password: newPassword }
      );
      
      logger.info('Successfully reset password for user:', userId);
      return response;
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 升级临时用户
   */
  async upgradeTempUser(userId: string, upgradeData: UserUpgradeRequest): Promise<UpgradeUserResponse> {
    try {
      logger.debug('Upgrading temp user:', userId, upgradeData);
      
      const response = await this.post<UpgradeUserResponse>(
        API_ENDPOINTS.USERS.UPGRADE_TEMP(userId),
        upgradeData
      );
      
      logger.info('Successfully upgraded temp user:', userId);
      return response;
    } catch (error) {
      logger.error('Error upgrading temp user:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    try {
      logger.debug('Deleting user:', userId);
      
      const response = await this.delete<DeleteUserResponse>(
        API_ENDPOINTS.USERS.DELETE(userId)
      );
      
      logger.info('Successfully deleted user:', userId);
      return response;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 批量更新用户
   */
  async batchUpdateUsers(
    userIds: string[], 
    updateFields: BatchUpdateRequest['update_fields']
  ): Promise<BatchUpdateResponse> {
    try {
      logger.debug('Batch updating users:', userIds.length, 'users');
      
      const response = await this.post<BatchUpdateResponse>(
        API_ENDPOINTS.USERS.BATCH_UPDATE,
        {
          user_ids: userIds,
          update_fields: updateFields,
        }
      );
      
      logger.info('Successfully batch updated users:', response.updated_count);
      return response;
    } catch (error) {
      logger.error('Error batch updating users:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 批量操作用户
   */
  async batchUserOperations(operations: Array<{
    type: 'update' | 'delete' | 'reset_password';
    userId: string;
    data?: any;
  }>): Promise<any[]> {
    try {
      logger.debug('Performing batch operations:', operations.length);
      
      const requests = operations.map(op => {
        switch (op.type) {
          case 'update':
            return {
              endpoint: API_ENDPOINTS.USERS.UPDATE(op.userId),
              method: 'PUT' as const,
              data: op.data,
            };
          case 'delete':
            return {
              endpoint: API_ENDPOINTS.USERS.DELETE(op.userId),
              method: 'DELETE' as const,
            };
          case 'reset_password':
            return {
              endpoint: API_ENDPOINTS.USERS.RESET_PASSWORD(op.userId),
              method: 'POST' as const,
              data: op.data,
            };
          default:
            throw new Error(`Unknown operation type: ${op.type}`);
        }
      });

      const responses = await this.batch<any>(requests);
      
      logger.info('Successfully completed batch operations:', responses.length);
      return responses;
    } catch (error) {
      logger.error('Error in batch operations:', error);
      throw handleApiError(error);
    }
  }
}

// 创建单例实例
const userManagementService = new UserManagementService();

export default userManagementService;
