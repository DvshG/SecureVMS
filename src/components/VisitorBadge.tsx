import React from 'react';
import { Visitor, VisitorCheckIn } from '../contexts/DataContext';
import QRCodeGenerator from './QRCodeGenerator';
import { format } from 'date-fns';
import { Building, User, Clock, Shield } from 'lucide-react';

interface VisitorBadgeProps {
  visitor: Visitor;
  checkIn: VisitorCheckIn;
  onPrint?: () => void;
  onClose?: () => void;
}

const VisitorBadge: React.FC<VisitorBadgeProps> = ({ 
  visitor, 
  checkIn, 
  onPrint, 
  onClose 
}) => {
  const badgeData = JSON.stringify({
    visitorId: visitor.id,
    checkInId: checkIn.id,
    badgeNumber: checkIn.badgeNumber,
    name: visitor.name,
    company: visitor.company,
    host: checkIn.hostName,
    validUntil: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd HH:mm'),
    issued: format(new Date(), 'yyyy-MM-dd HH:mm')
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Badge Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 mr-2" />
            <h2 className="text-lg font-bold">VISITOR BADGE</h2>
          </div>
          <p className="text-primary-100 text-sm">SecureVMS Access Pass</p>
        </div>

        {/* Badge Content */}
        <div className="p-6">
          {/* Visitor Photo and Basic Info */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0">
              {visitor.photoUrl ? (
                <img
                  src={visitor.photoUrl}
                  alt={visitor.name}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">{visitor.name}</h3>
              <div className="space-y-1">
                {visitor.company && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    <span className="truncate">{visitor.company}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="truncate">Host: {checkIn.hostName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{format(checkIn.checkInTime, 'MMM dd, yyyy h:mm a')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badge Number */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">Badge Number</p>
            <p className="text-2xl font-bold text-primary-600 font-mono tracking-wider">
              {checkIn.badgeNumber}
            </p>
          </div>

          {/* QR Code */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Access QR Code</p>
            <div className="flex justify-center">
              <QRCodeGenerator 
                data={badgeData} 
                size={150}
                className="border border-gray-200 rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Scan at security checkpoints for verification
            </p>
          </div>

          {/* Visit Details */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Visit Purpose</h4>
            <p className="text-blue-800 text-sm">{checkIn.purpose}</p>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-yellow-800 text-xs font-medium">
              ⚠️ SECURITY NOTICE: This badge must be worn visibly at all times. 
              Report to security if lost or damaged. Valid for single visit only.
            </p>
          </div>

          {/* Validity */}
          <div className="text-center text-xs text-gray-500 mb-6">
            <p>Valid until: {format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'MMM dd, yyyy h:mm a')}</p>
            <p>Issued: {format(new Date(), 'MMM dd, yyyy h:mm a')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3">
          <button
            onClick={onPrint}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Print Badge
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorBadge;