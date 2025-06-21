import React, { useState } from 'react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import AuditLog from '../components/AuditLog';
import { useData } from '../contexts/DataContext';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Building, 
  Shield,
  AlertTriangle,
  Download,
  FileText,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Lock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { 
    visitors, 
    preApprovals, 
    hosts,
    systemRules,
    getVisitorStats, 
    generateVisitorReport,
    approveHost,
    updateSystemRules
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'hosts' | 'rules' | 'audit'>('overview');
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [hostPasswords, setHostPasswords] = useState<{ [key: string]: string }>({});

  const stats = getVisitorStats();
  
  // Get pending hosts from both context and localStorage
  const registeredHosts = JSON.parse(localStorage.getItem('vms_registered_hosts') || '[]');
  const pendingHosts = [...hosts.filter(host => !host.isApproved), ...registeredHosts.filter((h: any) => !h.isApproved)];

  // Enhanced mock data for charts
  const weeklyData = [
    { day: 'Mon', visitors: 45, preApprovals: 12, avgWaitTime: 8 },
    { day: 'Tue', visitors: 52, preApprovals: 8, avgWaitTime: 12 },
    { day: 'Wed', visitors: 38, preApprovals: 15, avgWaitTime: 6 },
    { day: 'Thu', visitors: 61, preApprovals: 10, avgWaitTime: 15 },
    { day: 'Fri', visitors: 55, preApprovals: 18, avgWaitTime: 9 },
    { day: 'Sat', visitors: 23, preApprovals: 5, avgWaitTime: 5 },
    { day: 'Sun', visitors: 15, preApprovals: 3, avgWaitTime: 4 },
  ];

  const monthlyTrend = [
    { month: 'Jan', visitors: 1250, avgTime: 45, incidents: 2 },
    { month: 'Feb', visitors: 1180, avgTime: 42, incidents: 1 },
    { month: 'Mar', visitors: 1420, avgTime: 48, incidents: 3 },
    { month: 'Apr', visitors: 1350, avgTime: 46, incidents: 1 },
    { month: 'May', visitors: 1580, avgTime: 52, incidents: 4 },
    { month: 'Jun', visitors: 1680, avgTime: 49, incidents: 2 },
  ];

  const topCompanies = [
    { name: 'TechCorp Inc.', visits: 45, percentage: 25, avgDuration: 3.2 },
    { name: 'Smith Consulting', visits: 32, percentage: 18, avgDuration: 2.8 },
    { name: 'Design Studio', visits: 28, percentage: 16, avgDuration: 4.1 },
    { name: 'Global Solutions', visits: 24, percentage: 13, avgDuration: 2.5 },
    { name: 'Innovation Labs', visits: 21, percentage: 12, avgDuration: 3.7 },
  ];

  const visitStatusData = [
    { name: 'Approved', value: 78, color: '#10B981' },
    { name: 'Pending', value: 12, color: '#F59E0B' },
    { name: 'Denied', value: 8, color: '#EF4444' },
    { name: 'Cancelled', value: 2, color: '#6B7280' },
  ];

  const securityAlerts = [
    { id: '1', type: 'Long Visit', message: 'Visitor "John Smith" has been in building for 4+ hours', severity: 'warning', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
    { id: '2', type: 'Expired Badge', message: '3 visitors have expired badges still active', severity: 'error', timestamp: new Date(Date.now() - 45 * 60 * 1000) },
    { id: '3', type: 'Multiple Attempts', message: 'Visitor attempted check-in 5 times with invalid pre-approval', severity: 'warning', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
    { id: '4', type: 'Blacklist Alert', message: 'Blacklisted visitor attempted entry', severity: 'critical', timestamp: new Date(Date.now() - 90 * 60 * 1000) },
  ];

  const handleGenerateReport = () => {
    const startDate = new Date(reportDateRange.startDate);
    const endDate = new Date(reportDateRange.endDate);
    const report = generateVisitorReport(startDate, endDate);
    
    // In a real implementation, this would generate and download a PDF/Excel report
    console.log('Generated report:', report);
    alert('Report generated successfully! (Check console for details)');
  };

  const handleApproveHost = (hostId: string) => {
    const password = hostPasswords[hostId];
    if (!password) {
      alert('Please set a password for this host first.');
      return;
    }

    // Update in context
    approveHost(hostId, 'Admin User', password);
    
    // Update in localStorage
    const registeredHosts = JSON.parse(localStorage.getItem('vms_registered_hosts') || '[]');
    const updatedHosts = registeredHosts.map((h: any) => 
      h.id === hostId || h.email === hostId
        ? { ...h, isApproved: true, password, approvedBy: 'Admin User', approvedAt: new Date() }
        : h
    );
    localStorage.setItem('vms_registered_hosts', JSON.stringify(updatedHosts));
    
    alert('Host approved successfully! They can now login with their credentials.');
  };

  const handleDenyHost = (hostId: string) => {
    // Remove from localStorage
    const registeredHosts = JSON.parse(localStorage.getItem('vms_registered_hosts') || '[]');
    const updatedHosts = registeredHosts.filter((h: any) => h.id !== hostId && h.email !== hostId);
    localStorage.setItem('vms_registered_hosts', JSON.stringify(updatedHosts));
    
    alert('Host registration denied and removed.');
    window.location.reload(); // Refresh to update the list
  };

  const handleUpdateRules = (newRules: Partial<typeof systemRules>) => {
    updateSystemRules(newRules);
    alert('System rules updated successfully!');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout title="Admin Dashboard">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Executive Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics & Reports
            </button>
            <button
              onClick={() => setActiveTab('hosts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hosts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Host Management
              {pendingHosts.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-warning-100 text-warning-700 text-xs font-medium rounded-full">
                  {pendingHosts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Rules
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security Audit
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Executive Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Visitors Today"
              value={stats.totalToday}
              icon={Users}
              color="primary"
              change={{ value: "+15% vs last week", trend: "up" }}
            />
            <StatsCard
              title="Average Visit Duration"
              value="2.3h"
              icon={Clock}
              color="secondary"
              change={{ value: "+5 min vs last week", trend: "up" }}
            />
            <StatsCard
              title="Pre-approval Usage"
              value="78%"
              icon={Calendar}
              color="success"
              change={{ value: "+12% vs last month", trend: "up" }}
            />
            <StatsCard
              title="Security Alerts"
              value={securityAlerts.length}
              icon={AlertTriangle}
              color="warning"
            />
          </div>

          {/* Security Alerts Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-error-600" />
              Recent Security Alerts
            </h3>
            <div className="space-y-4">
              {securityAlerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-600' : 
                        alert.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{alert.type}</p>
                        <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {alert.timestamp.toLocaleTimeString()} - {alert.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weekly Trends */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                
                <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                Weekly Visitor Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="#1E40AF" name="Walk-ins" />
                  <Bar dataKey="preApprovals" fill="#059669" name="Pre-approved" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Visit Status Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-secondary-600" />
                Visit Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={visitStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {visitStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Companies */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-accent-600" />
              Top Visiting Companies
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Visits</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Percentage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {topCompanies.map((company, index) => (
                    <tr key={company.name} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 font-medium text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{company.name}</td>
                      <td className="py-3 px-4 text-gray-900">{company.visits}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-gray-900 mr-2">{company.percentage}%</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-accent-600 rounded-full"
                              style={{ width: `${company.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{company.avgDuration}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Report Generation */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Generate Custom Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={reportDateRange.startDate}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={reportDateRange.endDate}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>Comprehensive Report</option>
                  <option>Security Summary</option>
                  <option>Company Analysis</option>
                  <option>Performance Metrics</option>
                </select>
              </div>
              <button
                onClick={handleGenerateReport}
                className="flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Trends */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-secondary-600" />
                6-Month Visitor Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#1E40AF" 
                    strokeWidth={3}
                    name="Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Wait Time Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-warning-600" />
                Average Wait Times
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgWaitTime" fill="#F59E0B" name="Wait Time (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">97.5%</div>
              <div className="text-sm text-gray-600">System Uptime</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-secondary-600 mb-2">4.8/5</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
              <div className="text-xs text-gray-500 mt-1">Based on feedback</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-accent-600 mb-2">99.2%</div>
              <div className="text-sm text-gray-600">Badge Accuracy</div>
              <div className="text-xs text-gray-500 mt-1">Photo verification rate</div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'hosts' && (
        <div className="space-y-8">
          {/* Pending Host Approvals */}
          {pendingHosts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-warning-600" />
                Pending Host Approvals ({pendingHosts.length})
              </h3>
              <div className="space-y-4">
                {pendingHosts.map(host => (
                  <div key={host.id || host.email} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{host.name}</h4>
                        <p className="text-sm text-gray-600">{host.email} • {host.department}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Registered: {new Date(host.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Max visitors per day: {host.maxVisitorsPerDay}
                        </p>
                      </div>
                      <div className="ml-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            placeholder="Set password"
                            value={hostPasswords[host.id || host.email] || ''}
                            onChange={(e) => setHostPasswords(prev => ({
                              ...prev,
                              [host.id || host.email]: e.target.value
                            }))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveHost(host.id || host.email)}
                            className="flex items-center px-3 py-1 bg-success-600 text-white text-sm font-medium rounded hover:bg-success-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleDenyHost(host.id || host.email)}
                            className="flex items-center px-3 py-1 bg-error-600 text-white text-sm font-medium rounded hover:bg-error-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Hosts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              All Hosts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Max Visitors/Day</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {hosts.map(host => (
                    <tr key={host.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{host.name}</td>
                      <td className="py-3 px-4 text-gray-900">{host.email}</td>
                      <td className="py-3 px-4 text-gray-900">{host.department}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          host.isApproved && host.isActive
                            ? 'bg-success-50 text-success-700 border border-success-200'
                            : host.isApproved && !host.isActive
                            ? 'bg-gray-50 text-gray-700 border border-gray-200'
                            : 'bg-warning-50 text-warning-700 border border-warning-200'
                        }`}>
                          {host.isApproved ? (host.isActive ? 'Active' : 'Inactive') : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{host.maxVisitorsPerDay}</td>
                      <td className="py-3 px-4 text-gray-900">{host.createdAt.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-primary-600" />
            System Rules & Policies
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Visitors Per Host Per Day
                </label>
                <input
                  type="number"
                  value={systemRules.maxVisitorsPerHostPerDay}
                  onChange={(e) => handleUpdateRules({ maxVisitorsPerHostPerDay: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Wait Time Before Alert (minutes)
                </label>
                <input
                  type="number"
                  value={systemRules.maxWaitTimeBeforeAlert}
                  onChange={(e) => handleUpdateRules({ maxWaitTimeBeforeAlert: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="5"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-expire Pre-approvals After (hours)
                </label>
                <input
                  type="number"
                  value={systemRules.autoExpirePreApprovalsAfter}
                  onChange={(e) => handleUpdateRules({ autoExpirePreApprovalsAfter: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                  max="168"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requirePreApproval"
                  checked={systemRules.requirePreApprovalForExternalVisitors}
                  onChange={(e) => handleUpdateRules({ requirePreApprovalForExternalVisitors: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="requirePreApproval" className="ml-2 block text-sm text-gray-900">
                  Require pre-approval for external visitors
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireGovernmentId"
                  checked={systemRules.requireGovernmentId}
                  onChange={(e) => handleUpdateRules({ requireGovernmentId: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="requireGovernmentId" className="ml-2 block text-sm text-gray-900">
                  Require government ID verification
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowWalkIns"
                  checked={systemRules.allowWalkInVisitors}
                  onChange={(e) => handleUpdateRules({ allowWalkInVisitors: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allowWalkIns" className="ml-2 block text-sm text-gray-900">
                  Allow walk-in visitors (without pre-approval)
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Changes to system rules take effect immediately and will be logged in the audit trail.
                Some changes may require system restart for full implementation.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && <AuditLog />}
    </Layout>
  );
};

export default AdminDashboard;