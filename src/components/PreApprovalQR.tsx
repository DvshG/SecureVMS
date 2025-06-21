import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import { PreApproval } from '../contexts/DataContext';
import { format } from 'date-fns';
import { Calendar, User, Building, Clock, Shield, Mail, Phone } from 'lucide-react';

interface PreApprovalQRProps {
  preApproval: PreApproval;
  onClose?: () => void;
  onSendEmail?: () => void;
  onSendSMS?: () => void;
}

const PreApprovalQR: React.FC<PreApprovalQRProps> = ({ 
  preApproval, 
  onClose, 
  onSendEmail, 
  onSendSMS 
}) => {
  const qrData = JSON.stringify({
    type: 'preapproval',
    id: preApproval.id,
    visitorName: preApproval.visitorName,
    visitorEmail: preApproval.visitorEmail,
    hostName: preApproval.hostName,
    scheduledDate: preApproval.scheduledDate.toISOString(),
    purpose: preApproval.purpose,
    validUntil: preApproval.expiresAt.toISOString(),
    issued: new Date().toISOString()
  });

  const accessCode = `PA-${preApproval.id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary-600 to-accent-600 text-white p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">PRE-APPROVAL PASS</h2>
          </div>
          <p className="text-secondary-100 text-sm">SecureVMS Digital Access</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Visitor Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Visitor Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-20">Name:</span>
                <span className="text-gray-900">{preApproval.visitorName}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-20">Email:</span>
                <span className="text-gray-900">{preApproval.visitorEmail}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-20">Phone:</span>
                <span className="text-gray-900">{preApproval.visitorPhone}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-20">Company:</span>
                <span className="text-gray-900">{preApproval.visitorCompany}</span>
              </div>
            </div>
          </div>

          {/* Visit Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Visit Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="font-medium text-blue-700 w-20">Host:</span>
                <span className="text-blue-900">{preApproval.hostName}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium text-blue-700 w-20">Date:</span>
                <span className="text-blue-900">
                  {format(preApproval.scheduledDate, 'EEEE, MMMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium text-blue-700 w-20">Time:</span>
                <span className="text-blue-900">
                  {format(preApproval.scheduledDate, 'h:mm a')}
                </span>
              </div>
              <div className="flex items-start text-sm">
                <span className="font-medium text-blue-700 w-20">Purpose:</span>
                <span className="text-blue-900">{preApproval.purpose}</span>
              </div>
            </div>
          </div>

          {/* Access Code */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm font-medium text-green-700 mb-2">Access Code</p>
            <p className="text-3xl font-bold text-green-800 font-mono tracking-wider">
              {accessCode}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Present this code at security checkpoint
            </p>
          </div>

          {/* QR Code */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Digital Access QR Code</p>
            <div className="flex justify-center">
              <QRCodeGenerator 
                data={qrData} 
                size={200}
                className="border border-gray-200 rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Scan this QR code for instant check-in
            </p>
          </div>

          {/* Validity Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-yellow-800 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium text-sm">Validity Period</span>
            </div>
            <div className="text-yellow-700 text-sm space-y-1">
              <p>Valid from: {format(new Date(), 'MMM dd, yyyy h:mm a')}</p>
              <p>Expires: {format(preApproval.expiresAt, 'MMM dd, yyyy h:mm a')}</p>
              <p className="text-xs mt-2">
                ⚠️ This pass expires automatically and cannot be reused after the scheduled visit.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Check-in Instructions</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Arrive at the main security checkpoint</li>
              <li>Present this QR code or access code to security</li>
              <li>Provide valid government-issued photo ID</li>
              <li>Wait for badge issuance and host notification</li>
              <li>Proceed to designated meeting area</li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3">
          <button
            onClick={onSendEmail}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Pass
          </button>
          <button
            onClick={onSendSMS}
            className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Phone className="w-4 h-4 mr-2" />
            SMS Pass
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

export default PreApprovalQR;