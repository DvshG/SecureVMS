import React from 'react';
import { Clock, User, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Visitor, VisitorCheckIn } from '../contexts/DataContext';
import { format } from 'date-fns';

interface VisitorCardProps {
  visitor: Visitor;
  checkIn: VisitorCheckIn;
  onApprove?: () => void;
  onDeny?: () => void;
  onCheckOut?: () => void;
  showActions?: boolean;
}

const VisitorCard: React.FC<VisitorCardProps> = ({ 
  visitor, 
  checkIn, 
  onApprove, 
  onDeny, 
  onCheckOut, 
  showActions = false 
}) => {
  const getStatusColor = () => {
    switch (checkIn.status) {
      case 'approved':
        return 'bg-success-50 text-success-700 border-success-200';
      case 'denied':
        return 'bg-error-50 text-error-700 border-error-200';
      case 'pending':
        return 'bg-warning-50 text-warning-700 border-warning-200';
      case 'checked-out':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (checkIn.status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'denied':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'checked-out':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* Visitor Photo */}
        <div className="flex-shrink-0">
          {visitor.photoUrl ? (
            <img
              src={visitor.photoUrl}
              alt={visitor.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Visitor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">{visitor.name}</h3>
              <div className="mt-1 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  <span>{visitor.company}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>Host: {checkIn.hostName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{format(checkIn.checkInTime, 'h:mm a')}</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="capitalize">{checkIn.status}</span>
            </div>
          </div>

          {/* Purpose */}
          <div className="mt-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Purpose:</span> {checkIn.purpose}
            </p>
          </div>

          {/* Badge Number */}
          {checkIn.badgeNumber && (
            <div className="mt-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Badge:</span> {checkIn.badgeNumber}
              </p>
            </div>
          )}

          {/* Actions */}
          {showActions && checkIn.status === 'pending' && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={onDeny}
                className="px-4 py-2 bg-error-600 text-white text-sm font-medium rounded-lg hover:bg-error-700 transition-colors"
              >
                Deny
              </button>
            </div>
          )}

          {showActions && checkIn.status === 'approved' && !checkIn.checkOutTime && (
            <div className="mt-4">
              <button
                onClick={onCheckOut}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Check Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorCard;