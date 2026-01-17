import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Mail, 
  RefreshCw,
  Trash2,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';

// Types for risk monitoring
interface RiskEvent {
  id: string;
  type: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  value: number;
  threshold: number;
  timestamp: string;
  resolved: boolean;
  actions: string[];
  metadata: Record<string, any>;
}

interface RiskStatistics {
  period_hours: number;
  total_risks: number;
  unresolved_risks: number;
  resolved_risks: number;
  risks_by_level: Record<string, number>;
  risks_by_type: Record<string, number>;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

interface EmailStatus {
  configured: boolean;
  api_key_configured: boolean;
  from_email: string;
  alert_email: string;
  cc_email: string;
  service_provider: string;
}

interface SystemHealth {
  monitoring_enabled: boolean;
  risk_detection: string;
  email_service: string;
  database: string;
  last_scan: string;
  active_risks: number;
  critical_risks: number;
  high_risks: number;
  email_configured: boolean;
  system_uptime: string;
  overall_health: 'healthy' | 'warning' | 'critical';
}

const RiskMonitoringPage: React.FC = () => {
  const [risks, setRisks] = useState<RiskEvent[]>([]);
  const [statistics, setStatistics] = useState<RiskStatistics | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // API base URL - should be configured in environment
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Fetch data from API
  const fetchRisks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/monitoring/risks?unresolved_only=true&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRisks(data);
      }
    } catch (error) {
      console.error('Failed to fetch risks:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/monitoring/risks/statistics?hours=24`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchEmailStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/monitoring/email/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch email status:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/monitoring/system/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchRisks(),
      fetchStatistics(),
      fetchEmailStatus(),
      fetchSystemHealth(),
    ]);
    setLoading(false);
  };

  // Trigger risk scan
  const triggerScan = async () => {
    setScanning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/monitoring/risks/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auto_email: true }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Scan completed:', result);
        await loadAllData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to trigger scan:', error);
    } finally {
      setScanning(false);
    }
  };

  // Test email configuration
  const testEmail = async () => {
    setTestingEmail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/monitoring/email/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test_type: 'basic' }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Email test completed:', result);
        alert('Test email sent successfully!');
      } else {
        alert('Failed to send test email');
      }
    } catch (error) {
      console.error('Failed to test email:', error);
      alert('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  // Resolve risk
  const resolveRisk = async (riskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/v1/monitoring/risks/${riskId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolved_by: 'admin' }),
      });
      
      if (response.ok) {
        await fetchRisks(); // Refresh risks
        await fetchStatistics(); // Refresh statistics
      }
    } catch (error) {
      console.error('Failed to resolve risk:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    loadAllData();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchRisks();
      fetchStatistics();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Filter risks by level
  const filteredRisks = selectedLevel === 'all' 
    ? risks 
    : risks.filter(risk => risk.level === selectedLevel);

  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Get risk level icon
  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  // Get system health color
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading risk monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Risk Monitoring
          </h1>
          <p className="text-gray-600 mt-1">Security risk detection and alert management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={triggerScan} 
            disabled={scanning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Run Scan'}
          </Button>
          <Button 
            variant="outline" 
            onClick={testEmail}
            disabled={testingEmail}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {testingEmail ? 'Testing...' : 'Test Email'}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${systemHealth.monitoring_enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">Monitoring</span>
                <Badge variant={systemHealth.monitoring_enabled ? 'default' : 'destructive'}>
                  {systemHealth.monitoring_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${systemHealth.email_configured ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">Email Service</span>
                <Badge variant={systemHealth.email_configured ? 'default' : 'destructive'}>
                  {systemHealth.email_configured ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Active Risks</span>
                <Badge variant="outline">{systemHealth.active_risks}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-4 w-4 ${getHealthColor(systemHealth.overall_health)}`} />
                <span className="text-sm">Overall Health</span>
                <Badge 
                  variant={
                    systemHealth.overall_health === 'healthy' ? 'default' :
                    systemHealth.overall_health === 'warning' ? 'secondary' : 'destructive'
                  }
                  className={getHealthColor(systemHealth.overall_health)}
                >
                  {systemHealth.overall_health}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_risks}</div>
              <p className="text-xs text-gray-600">Last 24 hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.unresolved_risks}</div>
              <p className="text-xs text-gray-600">Need attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.critical_count}</div>
              <p className="text-xs text-gray-600">Immediate action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics.high_count}</div>
              <p className="text-xs text-gray-600">Priority attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks">Risk Events</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
        </TabsList>

        {/* Risk Events Tab */}
        <TabsContent value="risks" className="space-y-4">
          {/* Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Events ({filteredRisks.length})
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={selectedLevel === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLevel('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedLevel === 'critical' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLevel('critical')}
                  >
                    Critical
                  </Button>
                  <Button
                    variant={selectedLevel === 'high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLevel('high')}
                  >
                    High
                  </Button>
                  <Button
                    variant={selectedLevel === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLevel('medium')}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={selectedLevel === 'low' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLevel('low')}
                  >
                    Low
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRisks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No {selectedLevel === 'all' ? '' : selectedLevel} risks found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRisks.map((risk) => (
                    <Card key={risk.id} className="border-l-4" style={{ borderLeftColor: getRiskLevelColor(risk.level).replace('bg-', '#') }}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getRiskLevelColor(risk.level)} text-white`}>
                                {getRiskLevelIcon(risk.level)}
                                <span className="ml-1">{risk.level.toUpperCase()}</span>
                              </Badge>
                              <span className="text-sm text-gray-500">{risk.type}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">
                                {new Date(risk.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <h4 className="font-semibold mb-1">{risk.title}</h4>
                            <p className="text-gray-600 text-sm mb-2">{risk.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Value: {risk.value}</span>
                              <span>Threshold: {risk.threshold}</span>
                            </div>
                            {risk.actions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Recommended Actions:</p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {risk.actions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveRisk(risk.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risks by Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Critical
                      </span>
                      <span className="font-semibold">{statistics.critical_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        High
                      </span>
                      <span className="font-semibold">{statistics.high_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        Medium
                      </span>
                      <span className="font-semibold">{statistics.medium_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        Low
                      </span>
                      <span className="font-semibold">{statistics.low_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risks by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(statistics.risks_by_type).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Total Risks</span>
                      <span className="font-semibold">{statistics.total_risks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Unresolved</span>
                      <span className="font-semibold text-red-600">{statistics.unresolved_risks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Resolved</span>
                      <span className="font-semibold text-green-600">{statistics.resolved_risks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Period</span>
                      <span className="font-semibold">{statistics.period_hours} hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Email Configuration Tab */}
        <TabsContent value="email" className="space-y-4">
          {emailStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Service Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Service Status</p>
                      <p className="text-sm text-gray-600">Email service configuration</p>
                    </div>
                    <Badge variant={emailStatus.configured ? 'default' : 'destructive'}>
                      {emailStatus.configured ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">From Email</p>
                      <p className="text-sm text-gray-600">{emailStatus.from_email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Alert Email</p>
                      <p className="text-sm text-gray-600">{emailStatus.alert_email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">CC Email</p>
                      <p className="text-sm text-gray-600">{emailStatus.cc_email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Service Provider</p>
                      <p className="text-sm text-gray-600">{emailStatus.service_provider}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={testEmail} disabled={testingEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      {testingEmail ? 'Testing...' : 'Send Test Email'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskMonitoringPage;
