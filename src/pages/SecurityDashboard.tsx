import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import VisitorCard from '../components/VisitorCard';
import PendingApprovalCard from '../components/PendingApprovalCard';
import VisitorBadge from '../components/VisitorBadge';
import VisitorHistory from '../components/VisitorHistory';
import AuditLog from '../components/AuditLog';
import { useData } from '../contexts/DataContext';
import { Users, UserCheck, Clock, Calendar, AlertTriangle, UserPlus, Shield, FileText, Timer, QrCode, CheckCircle } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    visitors, 
    preApprovals,
    getActiveVisitors, 
    getVisitorStats, 
    getPendingApprovals,
    getApprovedVisitors,
    updateVisitorCheckIn, 
    cancelCheckIn,
    getVisitorBadge,
    getPreApprovalBadge
  } = useData();
  
  const [showBadge, setShowBadge] = useState<{ visitor: any; checkIn: any } | null>(null);
  const [showPreApprovalBadge, setShowPreApprovalBadge] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'preapprovals' | 'audit'>('overview');
  
  const stats = getVisitorStats();
  const activeVisitors = getActiveVisitors();
  const pendingApprovals = getPendingApprovals();
  const approvedVisitors = getApprovedVisitors();

  const handleCheckOut = (visitorId: string, checkInId: string) => {
    updateVisitorCheckIn(visitorId, checkInId, {
      status: 'checked-out',
      checkOutTime: new Date()
    });
  };

  const handleCancelCheckIn = (visitorId: string, checkInId: string) => {
    cancelCheckIn(visitorId, checkInId);
  };

  const handleViewBadge = (visitorId: string, checkInId: string) => {
    const badge = getVisitorBadge(visitorId, checkInId);
    if (badge) {
      setShowBadge(badge);
    } else {
      alert('Badge not available for this visitor');
    }
  };

  const handleViewPreApprovalBadge = (preApprovalId: string) => {
    const badge = getPreApprovalBadge(preApprovalId);
    if (badge) {
      setShowPreApprovalBadge(badge);
    } else {
      alert('Pre-approval badge not available');
    }
  };

  const handlePrintBadge = () => {
    window.print();
  };

  // Sort pending approvals by wait time (longest waiting first)
  const sortedPendingApprovals = pendingApprovals.sort((a, b) => {
    const aWaitTime = new Date().getTime() - a.checkIn.checkInTime.getTime();
    const bWaitTime = new Date().getTime() - b.checkIn.checkInTime.getTime();
    return bWaitTime - aWaitTime;
  });

  const getHighPriorityCount = () => {
    return pendingApprovals.filter(({ checkIn }) => {
      const waitTime = (new Date().getTime() - checkIn.checkInTime.getTime()) / (1000 * 60);
      return waitTime > 20;
    }).length;
  };

  const getCriticalAlerts = () => {
    const alerts = [];
    
    // Long waiting visitors
    const longWaiting = pendingApprovals.filter(({ checkIn }) => {
      const waitTime = (new Date().getTime() - checkIn.checkInTime.getTime()) / (1000 * 60);
      return waitTime > 30;
    });
    
    if (longWaiting.length > 0) {
      alerts.push({
        type: 'critical',
        message: `${longWaiting.length} visitor(s) waiting over 30 minutes`,
        action: 'Review pending approvals'
      });
    }

    // Visitors in building too long
    const longStaying = activeVisitors.filter(visitor => {
      const activeCheckIn = visitor.checkIns.find(ci => ci.status === 'approved' && !ci.checkOutTime);
      if (activeCheckIn) {
        const stayTime = (new Date().getTime() - activeCheckIn.checkInTime.getTime()) / (1000 * 60 * 60);
        return stayTime > 8; // 8 hours
      }
      return false;
    });

    if (longStaying.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${longStaying.length} visitor(s) in building over 8 hours`,
        action: 'Contact visitors for check-out'
      });
    }

    return alerts;
  };

  const criticalAlerts = getCriticalAlerts();

  return (
    <Layout title="Security Dashboard">
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
              Security Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visitor History
            </button>
            <button
              onClick={() => setActiveTab('preapprovals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preapprovals'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pre-approvals
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Audit Log
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Quick Action Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/security/checkin')}
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              New Visitor Check-In
            </button>
          </div>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div className="mb-8 space-y-3">
              {criticalAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'critical'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span className="font-medium">{alert.message}</span>
                    </div>
                    <span className="text-sm">{alert.action}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Visitors Today"
              value={stats.totalToday}
              icon={Users}
              color="primary"
              change={{ value: "+12% from yesterday", trend: "up" }}
            />
            <StatsCard
              title="Currently In Building"
              value={stats.activeNow}
              icon={UserCheck}
              color="success"
            />
            <StatsCard
              title="Pending Approval"
              value={stats.pendingApproval}
              icon={AlertTriangle}
              color={getHighPriorityCount() > 0 ? "error" : "warning"}
              change={getHighPriorityCount() > 0 ? { value: `${getHighPriorityCount()} high priority`, trend: "down" } : undefined}
            />
            <StatsCard
              title="Avg Wait Time"
              value={`${stats.averageWaitTime}m`}
              icon={Timer}
              color="secondary"
              change={{ value: stats.averageWaitTime > 15 ? "Above target" : "Within target", trend: stats.averageWaitTime > 15 ? "down" : "up" }}
            />
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Pre-approved Today"
              value={stats.preApprovedToday}
              icon={Calendar}
              color="accent"
            />
            <StatsCard
              title="Total Check-outs"
              value={stats.totalCheckOuts}
              icon={UserCheck}
              color="success"
            />
            <StatsCard
              title="Security Incidents"
              value={criticalAlerts.length}
              icon={Shield}
              color={criticalAlerts.length > 0 ? "error" : "success"}
            />
          </div>

          {/* Pending Approvals - Information Only */}
          {pendingApprovals.length > 0 && (
            <div className="mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Clock className="w-6 h-6 mr-2 text-warning-600" />
                    Pending Host Approvals ({pendingApprovals.length})
                    {getHighPriorityCount() > 0 && (
                      <span className="ml-2 px-2 py-1 bg-error-100 text-error-700 text-sm font-medium rounded-full">
                        {getHighPriorityCount()} High Priority
                      </span>
                    )}
                  </h2>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Only hosts can approve or deny visitor requests. Security can monitor and assist with the check-in process.
                  </p>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sortedPendingApprovals.map(({ visitor, checkIn }) => {
                    const waitTime = (new Date().getTime() - checkIn.checkInTime.getTime()) / (1000 * 60);
                    const priority = waitTime > 20 ? 'high' : waitTime > 10 ? 'medium' : 'low';
                    
                    return (
                      <PendingApprovalCard
                        key={`${visitor.id}-${checkIn.id}`}
                        visitor={visitor}
                        checkIn={checkIn}
                        priority={priority}
                        showActions={false}
                        onCancel={() => handleCancelCheckIn(visitor.id, checkIn.id)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Visitors */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-success-600" />
                  Active Visitors ({activeVisitors.length})
                </h2>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeVisitors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active visitors</p>
                  </div>
                ) : (
                  activeVisitors.map(visitor => {
                    const activeCheckIn = visitor.checkIns.find(ci => 
                      ci.status === 'approved' && !ci.checkOutTime
                    );
                    if (!activeCheckIn) return null;
                    
                    return (
                      <div key={`${visitor.id}-${activeCheckIn.id}`} className="space-y-2">
                        <VisitorCard
                          visitor={visitor}
                          checkIn={activeCheckIn}
                          showActions
                          onCheckOut={() => handleCheckOut(visitor.id, activeCheckIn.id)}
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleViewBadge(visitor.id, activeCheckIn.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            View Badge
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Approved Visitors */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-success-600" />
                Recent Approved Visitors
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {approvedVisitors.slice(0, 5).map(({ visitor, checkIn }) => (
                  <div key={`${visitor.id}-${checkIn.id}`} className="space-y-2">
                    <VisitorCard
                      visitor={visitor}
                      checkIn={checkIn}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleViewBadge(visitor.id, checkIn.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        View Badge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'history' && <VisitorHistory />}

      {activeTab === 'preapprovals' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-primary-600" />
            All Pre-approvals
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Visitor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Host</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Scheduled</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {preApprovals.map(preApproval => (
                  <tr key={preApproval.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{preApproval.visitorName}</div>
                        <div className="text-sm text-gray-500">{preApproval.visitorEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{preApproval.visitorCompany}</td>
                    <td className="py-3 px-4 text-gray-900">{preApproval.hostName}</td>
                    <td className="py-3 px-4 text-gray-900">
                      {preApproval.scheduledDate.toLocaleDateString()} at{' '}
                      {preApproval.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        preApproval.status === 'active' 
                          ? 'bg-success-50 text-success-700 border border-success-200'
                          : preApproval.status === 'used'
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {preApproval.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewPreApprovalBadge(preApproval.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        View Badge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preApprovals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pre-approvals found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && <AuditLog />}

      {/* Visitor Badge Modal */}
      {showBadge && (
        <VisitorBadge
          visitor={showBadge.visitor}
          checkIn={showBadge.checkIn}
          onPrint={handlePrintBadge}
          onClose={() => setShowBadge(null)}
        />
      )}

      {/* Pre-approval Badge Modal */}
      {showPreApprovalBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pre-approval Details</h2>
            <div className="space-y-4">
              <div>
                <strong>Visitor:</strong> {showPreApprovalBadge.visitorName}
              </div>
              <div>
                <strong>Company:</strong> {showPreApprovalBadge.visitorCompany}
              </div>
              <div>
                <strong>Host:</strong> {showPreApprovalBadge.hostName}
              </div>
              <div>
                <strong>Access Code:</strong> {showPreApprovalBadge.accessCode}
              </div>
              <div>
                <strong>Scheduled:</strong> {showPreApprovalBadge.scheduledDate.toLocaleString()}
              </div>
              <div>
                <strong>Purpose:</strong> {showPreApprovalBadge.purpose}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPreApprovalBadge(null)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SecurityDashboard;