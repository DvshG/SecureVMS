import React, { useState } from 'react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import VisitorCard from '../components/VisitorCard';
import PreApprovalQR from '../components/PreApprovalQR';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, Clock, Plus, UserPlus, CalendarPlus, Mail, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface PreApprovalFormData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitorCompany: string;
  scheduledDate: string;
  scheduledTime: string;
  purpose: string;
}

const HostDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    visitors, 
    preApprovals, 
    updateVisitorCheckIn, 
    addPreApproval, 
    sendNotification,
    systemRules
  } = useData();
  
  const [showPreApprovalForm, setShowPreApprovalForm] = useState(false);
  const [showPreApprovalQR, setShowPreApprovalQR] = useState<any>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PreApprovalFormData>();

  // Filter data for current host
  const myVisitors = visitors.filter(visitor => 
    visitor.checkIns.some(checkIn => checkIn.hostId === user?.id)
  );

  const myPendingApprovals = visitors.filter(visitor =>
    visitor.checkIns.some(checkIn => 
      checkIn.hostId === user?.id && checkIn.status === 'pending'
    )
  );

  const myActiveVisitors = visitors.filter(visitor =>
    visitor.checkIns.some(checkIn => 
      checkIn.hostId === user?.id && checkIn.status === 'approved' && !checkIn.checkOutTime
    )
  );

  const myPreApprovals = preApprovals.filter(pa => pa.hostId === user?.id);

  const handleApproveVisitor = (visitorId: string, checkInId: string) => {
    const badgeNumber = `VMS${String(Date.now()).slice(-3)}`;
    updateVisitorCheckIn(visitorId, checkInId, {
      status: 'approved',
      badgeNumber,
      qrCode: `QR_${badgeNumber}`,
      approvedAt: new Date(),
      approvedBy: user?.name
    });

    // Send notification to security
    const visitor = visitors.find(v => v.id === visitorId);
    if (visitor) {
      sendNotification(
        'email',
        'security@company.com',
        `Visitor ${visitor.name} has been approved by ${user?.name}. Badge ${badgeNumber} ready for issuance.`
      );
    }
  };

  const handleDenyVisitor = (visitorId: string, checkInId: string) => {
    updateVisitorCheckIn(visitorId, checkInId, {
      status: 'denied',
      deniedAt: new Date(),
      deniedBy: user?.name
    });

    // Send notification to security
    const visitor = visitors.find(v => v.id === visitorId);
    if (visitor) {
      sendNotification(
        'email',
        'security@company.com',
        `Visitor ${visitor.name} has been denied by ${user?.name}.`
      );
    }
  };

  const onSubmitPreApproval = (data: PreApprovalFormData) => {
    const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
    
    // Calculate expiry based on system rules
    const expiryHours = systemRules.autoExpirePreApprovalsAfter;
    const expiresAt = new Date(scheduledDateTime.getTime() + expiryHours * 60 * 60 * 1000);

    const newPreApproval = {
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      visitorPhone: data.visitorPhone,
      visitorCompany: data.visitorCompany,
      hostId: user!.id,
      hostName: user!.name,
      scheduledDate: scheduledDateTime,
      purpose: data.purpose,
      status: 'active' as const,
      expiresAt // Use calculated expiry based on system rules
    };

    addPreApproval(newPreApproval);
    reset();
    setShowPreApprovalForm(false);

    // Show QR code for the new pre-approval
    setTimeout(() => {
      const allPreApprovals = preApprovals.filter(pa => pa.hostId === user?.id);
      const createdPreApproval = allPreApprovals[allPreApprovals.length - 1];
      if (createdPreApproval) {
        setShowPreApprovalQR(createdPreApproval);
      }
    }, 100);
  };

  const handleSendPreApprovalEmail = async () => {
    if (showPreApprovalQR) {
      const success = await sendNotification(
        'email',
        showPreApprovalQR.visitorEmail,
        `Dear ${showPreApprovalQR.visitorName},

Your visit to ${showPreApprovalQR.hostName} has been pre-approved!

Visit Details:
- Date: ${showPreApprovalQR.scheduledDate.toLocaleDateString()}
- Time: ${showPreApprovalQR.scheduledDate.toLocaleTimeString()}
- Purpose: ${showPreApprovalQR.purpose}
- Access Code: ${showPreApprovalQR.accessCode}

Please present this access code at the security checkpoint.

Valid until: ${showPreApprovalQR.expiresAt.toLocaleString()}

Best regards,
${showPreApprovalQR.hostName}`
      );
      
      if (success) {
        alert('Pre-approval email sent successfully!');
      }
    }
  };

  const handleSendPreApprovalSMS = async () => {
    if (showPreApprovalQR) {
      const success = await sendNotification(
        'sms',
        showPreApprovalQR.visitorPhone,
        `VMS Pre-approval: Visit ${showPreApprovalQR.hostName} on ${showPreApprovalQR.scheduledDate.toLocaleDateString()} at ${showPreApprovalQR.scheduledDate.toLocaleTimeString()}. Code: ${showPreApprovalQR.accessCode}. Valid until: ${showPreApprovalQR.expiresAt.toLocaleDateString()}`
      );
      
      if (success) {
        alert('Pre-approval SMS sent successfully!');
      }
    }
  };

  return (
    <Layout title="Host Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="My Visitors Today"
          value={myVisitors.length}
          icon={Users}
          color="secondary"
        />
        <StatsCard
          title="Currently Visiting"
          value={myActiveVisitors.length}
          icon={UserPlus}
          color="success"
        />
        <StatsCard
          title="Pending My Approval"
          value={myPendingApprovals.length}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Pre-approved"
          value={myPreApprovals.filter(pa => pa.status === 'active').length}
          icon={Calendar}
          color="primary"
        />
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex space-x-4">
        <button
          onClick={() => setShowPreApprovalForm(true)}
          className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white text-sm font-medium rounded-lg hover:bg-secondary-700 transition-colors"
        >
          <CalendarPlus className="w-4 h-4 mr-2" />
          Pre-approve Visitor
        </button>
        
        {myPendingApprovals.length > 0 && (
          <div className="flex items-center px-4 py-2 bg-warning-100 text-warning-800 text-sm font-medium rounded-lg border border-warning-200">
            <Clock className="w-4 h-4 mr-2" />
            {myPendingApprovals.length} visitor{myPendingApprovals.length !== 1 ? 's' : ''} waiting for your approval
          </div>
        )}
      </div>

      {/* Pre-Approval Form Modal */}
      {showPreApprovalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-approve Visitor</h3>
            <form onSubmit={handleSubmit(onSubmitPreApproval)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visitor Name
                </label>
                <input
                  {...register('visitorName', { required: 'Name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                />
                {errors.visitorName && (
                  <p className="text-sm text-error-600 mt-1">{errors.visitorName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('visitorEmail', { required: 'Email is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                />
                {errors.visitorEmail && (
                  <p className="text-sm text-error-600 mt-1">{errors.visitorEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...register('visitorPhone', { required: 'Phone is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                />
                {errors.visitorPhone && (
                  <p className="text-sm text-error-600 mt-1">{errors.visitorPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  {...register('visitorCompany', { required: 'Company is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                />
                {errors.visitorCompany && (
                  <p className="text-sm text-error-600 mt-1">{errors.visitorCompany.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register('scheduledDate', { required: 'Date is required' })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                  />
                  {errors.scheduledDate && (
                    <p className="text-sm text-error-600 mt-1">{errors.scheduledDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    {...register('scheduledTime', { required: 'Time is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                  />
                  {errors.scheduledTime && (
                    <p className="text-sm text-error-600 mt-1">{errors.scheduledTime.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Visit
                </label>
                <textarea
                  {...register('purpose', { required: 'Purpose is required' })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                />
                {errors.purpose && (
                  <p className="text-sm text-error-600 mt-1">{errors.purpose.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-xs">
                  <strong>Auto-expiry:</strong> This pre-approval will automatically expire {systemRules.autoExpirePreApprovalsAfter} hours after the scheduled time.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-secondary-600 text-white py-2 px-4 rounded-lg hover:bg-secondary-700 transition-colors"
                >
                  Create Pre-approval
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreApprovalForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pre-Approval QR Modal */}
      {showPreApprovalQR && (
        <PreApprovalQR
          preApproval={showPreApprovalQR}
          onClose={() => setShowPreApprovalQR(null)}
          onSendEmail={handleSendPreApprovalEmail}
          onSendSMS={handleSendPreApprovalSMS}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-warning-600" />
              Pending My Approval ({myPendingApprovals.length})
            </h2>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {myPendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pending approvals</p>
              </div>
            ) : (
              myPendingApprovals.map(visitor => {
                const pendingCheckIn = visitor.checkIns.find(ci => 
                  ci.hostId === user?.id && ci.status === 'pending'
                );
                if (!pendingCheckIn) return null;
                
                return (
                  <VisitorCard
                    key={`${visitor.id}-${pendingCheckIn.id}`}
                    visitor={visitor}
                    checkIn={pendingCheckIn}
                    showActions
                    onApprove={() => handleApproveVisitor(visitor.id, pendingCheckIn.id)}
                    onDeny={() => handleDenyVisitor(visitor.id, pendingCheckIn.id)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* My Active Visitors */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-success-600" />
              Currently Visiting Me ({myActiveVisitors.length})
            </h2>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {myActiveVisitors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active visitors</p>
              </div>
            ) : (
              myActiveVisitors.map(visitor => {
                const activeCheckIn = visitor.checkIns.find(ci => 
                  ci.hostId === user?.id && ci.status === 'approved' && !ci.checkOutTime
                );
                if (!activeCheckIn) return null;
                
                return (
                  <VisitorCard
                    key={`${visitor.id}-${activeCheckIn.id}`}
                    visitor={visitor}
                    checkIn={activeCheckIn}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pre-approvals */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-600" />
          My Pre-approvals
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Visitor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Scheduled</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Expires</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Purpose</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myPreApprovals.map(preApproval => (
                <tr key={preApproval.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{preApproval.visitorName}</div>
                      <div className="text-sm text-gray-500">{preApproval.visitorEmail}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{preApproval.visitorCompany}</td>
                  <td className="py-3 px-4 text-gray-900">
                    {preApproval.scheduledDate.toLocaleDateString()} at{' '}
                    {preApproval.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    <div className="text-sm">
                      {preApproval.expiresAt.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preApproval.expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{preApproval.purpose}</td>
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowPreApprovalQR(preApproval)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View QR
                      </button>
                      <button
                        onClick={() => {
                          setShowPreApprovalQR(preApproval);
                          setTimeout(() => handleSendPreApprovalEmail(), 100);
                        }}
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                      >
                        Email
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myPreApprovals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No pre-approvals created</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HostDashboard;