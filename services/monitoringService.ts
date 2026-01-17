// 监控API服务 - 使用统一API客户端
import { BaseApiClient, handleApiError } from './base/BaseApiClient';
import { API_CONFIG, API_ENDPOINTS, logger } from '../config/api';

// 风险事件相关接口定义
export interface RiskEvent {
  id: string;
  type: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  value: number;
  threshold: number;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  actions?: string;
  event_metadata?: string;
  email_sent: boolean;
  email_sent_at?: string;
}

export interface RiskStatistics {
  total_risks: number;
  unresolved_risks: number;
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  resolved_today: number;
  email_alerts_sent: number;
}

export interface RiskListResponse {
  risks: RiskEvent[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export interface ResolveRiskRequest {
  resolved_by: string;
  actions?: string;
}

export interface ResolveRiskResponse {
  message: string;
  risk_id: string;
  resolved_at: string;
  resolved_by: string;
}

export interface EmailStatusResponse {
  configured: boolean;
  api_key_configured: boolean;
  sender_email: string;
  alert_emails: string[];
  cc_emails: string[];
  provider: string;
  last_check: string;
}

export interface EmailTestRequest {
  test_email?: string;
}

export interface EmailTestResponse {
  message: string;
  success: boolean;
  test_email: string;
  sent_at: string;
}

export interface SystemHealthResponse {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  services: {
    database: 'healthy' | 'warning' | 'critical';
    email: 'healthy' | 'warning' | 'critical';
    monitoring: 'healthy' | 'warning' | 'critical';
  };
  metrics: {
    uptime: number;
    memory_usage: number;
    cpu_usage: number;
    disk_usage: number;
  };
}

export interface ScanRisksResponse {
  message: string;
  scanned_at: string;
  new_risks_found: number;
  risk_ids: string[];
}

export interface DailyReportResponse {
  message: string;
  sent_at: string;
  report_date: string;
  recipient_count: number;
}

export interface CleanupRisksResponse {
  message: string;
  cleaned_at: string;
  deleted_count: number;
  total_before: number;
  total_after: number;
}

/**
 * 监控服务类
 * 继承自BaseApiClient，提供监控相关的API调用
 */
class MonitoringService extends BaseApiClient {
  constructor() {
    super(API_CONFIG.BASE_URL, {
      timeout: API_CONFIG.TIMEOUT,
      retries: API_CONFIG.RETRY_ATTEMPTS,
    });
  }

  /**
   * 获取风险事件列表
   */
  async getRisks(params?: {
    page?: number;
    size?: number;
    level?: string;
    type?: string;
    resolved?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<RiskListResponse> {
    try {
      logger.debug('Fetching risks with params:', params);
      
      const response = await this.get<RiskListResponse>(
        API_ENDPOINTS.MONITORING.RISKS,
        params
      );
      
      logger.info('Successfully fetched risks:', response.risks.length);
      return response;
    } catch (error) {
      logger.error('Error fetching risks:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 获取风险统计信息
   */
  async getRiskStatistics(): Promise<RiskStatistics> {
    try {
      logger.debug('Fetching risk statistics');
      
      const response = await this.get<RiskStatistics>(
        API_ENDPOINTS.MONITORING.RISKS_STATS
      );
      
      logger.info('Successfully fetched risk statistics');
      return response;
    } catch (error) {
      logger.error('Error fetching risk statistics:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 解决风险事件
   */
  async resolveRisk(riskId: string, resolveData: ResolveRiskRequest): Promise<ResolveRiskResponse> {
    try {
      logger.debug('Resolving risk:', riskId, resolveData);
      
      const response = await this.post<ResolveRiskResponse>(
        API_ENDPOINTS.MONITORING.RISKS_RESOLVE(riskId),
        resolveData
      );
      
      logger.info('Successfully resolved risk:', riskId);
      return response;
    } catch (error) {
      logger.error('Error resolving risk:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 获取邮件服务状态
   */
  async getEmailStatus(): Promise<EmailStatusResponse> {
    try {
      logger.debug('Fetching email status');
      
      const response = await this.get<EmailStatusResponse>(
        API_ENDPOINTS.MONITORING.EMAIL_STATUS
      );
      
      logger.info('Successfully fetched email status');
      return response;
    } catch (error) {
      logger.error('Error fetching email status:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 测试邮件发送
   */
  async testEmail(testData?: EmailTestRequest): Promise<EmailTestResponse> {
    try {
      logger.debug('Testing email sending:', testData);
      
      const response = await this.post<EmailTestResponse>(
        API_ENDPOINTS.MONITORING.EMAIL_TEST,
        testData || {}
      );
      
      logger.info('Successfully sent test email');
      return response;
    } catch (error) {
      logger.error('Error testing email:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<SystemHealthResponse> {
    try {
      logger.debug('Fetching system health');
      
      const response = await this.get<SystemHealthResponse>(
        API_ENDPOINTS.MONITORING.SYSTEM_HEALTH
      );
      
      logger.info('Successfully fetched system health');
      return response;
    } catch (error) {
      logger.error('Error fetching system health:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 手动扫描风险
   */
  async scanRisks(): Promise<ScanRisksResponse> {
    try {
      logger.debug('Starting manual risk scan');
      
      const response = await this.post<ScanRisksResponse>(
        API_ENDPOINTS.MONITORING.SCAN_RISKS
      );
      
      logger.info('Successfully completed risk scan:', response.new_risks_found, 'new risks');
      return response;
    } catch (error) {
      logger.error('Error scanning risks:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 发送每日报告
   */
  async sendDailyReport(): Promise<DailyReportResponse> {
    try {
      logger.debug('Sending daily report');
      
      const response = await this.post<DailyReportResponse>(
        API_ENDPOINTS.MONITORING.DAILY_REPORT
      );
      
      logger.info('Successfully sent daily report to', response.recipient_count, 'recipients');
      return response;
    } catch (error) {
      logger.error('Error sending daily report:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 清理历史风险事件
   */
  async cleanupRisks(daysToKeep: number = 30): Promise<CleanupRisksResponse> {
    try {
      logger.debug('Cleaning up risks older than', daysToKeep, 'days');
      
      const response = await this.post<CleanupRisksResponse>(
        API_ENDPOINTS.MONITORING.CLEANUP_RISKS,
        { days_to_keep: daysToKeep }
      );
      
      logger.info('Successfully cleaned up', response.deleted_count, 'old risks');
      return response;
    } catch (error) {
      logger.error('Error cleaning up risks:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 批量解决风险
   */
  async batchResolveRisks(
    riskIds: string[], 
    resolveData: ResolveRiskRequest
  ): Promise<ResolveRiskResponse[]> {
    try {
      logger.debug('Batch resolving risks:', riskIds.length, 'risks');
      
      const requests = riskIds.map(riskId => ({
        endpoint: API_ENDPOINTS.MONITORING.RISKS_RESOLVE(riskId),
        method: 'POST' as const,
        data: resolveData,
      }));

      const responses = await this.batch<ResolveRiskResponse>(requests);
      
      logger.info('Successfully batch resolved', responses.length, 'risks');
      return responses;
    } catch (error) {
      logger.error('Error batch resolving risks:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 获取实时监控数据
   */
  async getRealTimeData(): Promise<{
    statistics: RiskStatistics;
    health: SystemHealthResponse;
    recentRisks: RiskEvent[];
  }> {
    try {
      logger.debug('Fetching real-time monitoring data');
      
      const requests = [
        { endpoint: API_ENDPOINTS.MONITORING.RISKS_STATS, method: 'GET' as const },
        { endpoint: API_ENDPOINTS.MONITORING.SYSTEM_HEALTH, method: 'GET' as const },
        { 
          endpoint: API_ENDPOINTS.MONITORING.RISKS, 
          method: 'GET' as const,
          params: { page: 1, size: 10, resolved: false, sort_by: 'timestamp', sort_order: 'desc' }
        },
      ];

      const [statistics, health, recentRisksResponse] = await this.batch<any>(requests);
      
      const result = {
        statistics,
        health,
        recentRisks: recentRisksResponse.risks || [],
      };
      
      logger.info('Successfully fetched real-time monitoring data');
      return result;
    } catch (error) {
      logger.error('Error fetching real-time data:', error);
      throw handleApiError(error);
    }
  }

  /**
   * 获取风险趋势数据
   */
  async getRiskTrends(days: number = 7): Promise<{
    dates: string[];
    total: number[];
    resolved: number[];
    critical: number[];
    high: number[];
    medium: number[];
    low: number[];
  }> {
    try {
      logger.debug('Fetching risk trends for', days, 'days');
      
      const response = await this.get<any>(
        API_ENDPOINTS.MONITORING.RISKS,
        { 
          trends: true,
          days: days.toString()
        }
      );
      
      logger.info('Successfully fetched risk trends');
      return response.trends || {
        dates: [],
        total: [],
        resolved: [],
        critical: [],
        high: [],
        medium: [],
        low: [],
      };
    } catch (error) {
      logger.error('Error fetching risk trends:', error);
      throw handleApiError(error);
    }
  }
}

// 创建单例实例
const monitoringService = new MonitoringService();

export default monitoringService;
