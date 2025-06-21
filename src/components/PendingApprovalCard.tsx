import React from 'react';
import { Clock, User, Building, Phone, CreditCard, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { Visitor, VisitorCheckIn } from '../contexts/DataContext';
import { format } from 'date-fns';

interface PendingApprovalCardProps {
  visitor: Visitor;
  checkIn: VisitorCheckIn;
  onApprove?: () => void;
  onDeny?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

const PendingApprovalCard: React.FC<PendingApprovalCardProps> = ({ 
  visitor, 
  checkIn, 
  onApprove, 
  onDeny, 
  onCancel,
  showActions = false,
  priority = 'medium'
}) => {
  const getWaitTime = () => {
    const now = new Date();
    const checkInTime = new Date(checkIn.checkInTime);
    const diffMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  const getPriorityColor = () => {
    const waitTime = getWaitTime();
    if (waitTime > 20) return 'border-error-300 bg-error-50';
    if (waitTime > 10) return 'border-warning-300 bg-warning-50';
    return 'border-gray-200 bg-white';
  };

  const getPriorityIcon = () => {
    const waitTime = getWaitTime();
    if (waitTime > 20) return <AlertTriangle className="w-4 h-4 text-error-600" />;
    if (waitTime > 10) return <Clock className="w-4 h-4 text-warning-600" />;
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className={`rounded-xl border-2 p-6 hover:shadow-md transition-all duration-200 ${getPriorityColor()}`}>
      <div className="flex items-start space-x-4">
        {/* Visitor Photo */}
        <div className="flex-shrink-0">
          {visitor.photoUrl ? (
            <img
              src={visitor.photoUrl}
              alt={visitor.name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* Visitor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 truncate">{visitor.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {getPriorityIcon()}
                <span className="text-sm font-medium text-gray-600">
                  Waiting {getWaitTime()} minutes
                </span>
                {checkIn.estimatedWaitTime && (
                  <span className="text-xs text-gray-500">
                    (Est. {checkIn.estimatedWaitTime} min)
                  </span>
                )}
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="px-3 py-1 rounded-full text-sm font-medium border bg-warning-50 text-warning-700 border-warning-200 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Pending Approval</span>
            </div>
          </div>

          {/* Contact & Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{visitor.phone}</span>
            </div>
            {visitor.company && (
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{visitor.company}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Host: {checkIn.hostName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{format(checkIn.checkInTime, 'h:mm a')}</span>
            </div>
          </div>

          {/* Government ID Info */}
          {checkIn.governmentId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {checkIn.governmentId.type}: {checkIn.governmentId.number}
                  </span>
                </div>
                {checkIn.governmentId.verified && (
                  <div className="flex items-center text-success-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Purpose:</span> {checkIn.purpose}
            </p>
          </div>

          {/* Security Officer Info */}
          {checkIn.securityOfficerName && (
            <div className="text-xs text-gray-500 mb-4">
              Processed by: {checkIn.securityOfficerName}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2">
              <button
                onClick={onApprove}
                className="flex-1 px-4 py-2 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700 transition-colors flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={onDeny}
                className="flex-1 px-4 py-2 bg-error-600 text-white text-sm font-medium rounded-lg hover:bg-error-700 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-1" />
                Deny
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalCard;