import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Phone, 
  FileText, 
  ArrowLeft, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Building
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import PhotoCapture from '../components/PhotoCapture';

interface SecurityCheckInFormData {
  name: string;
  phone: string;
  company?: string;
  hostName: string;
  purpose: string;
  governmentIdType: string;
  governmentIdNumber: string;
}

const SecurityCheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addVisitor, getAllHosts, canCreateWalkInVisit, systemRules } = useData();
  const [photo, setPhoto] = useState<string | null>(null);
  const [idVerified, setIdVerified] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(15);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SecurityCheckInFormData>();

  // Get all hosts (from context + localStorage)
  const allHosts = getAllHosts();
  
  // Filter only approved and active hosts
  const approvedHosts = allHosts.filter(host => host.isApproved && host.isActive);

  const governmentIdTypes = [
    'Driver License',
    'Passport',
    'State ID',
    'Military ID',
    'Other Government ID'
  ];

  const watchedName = watch('name');
  const watchedIdNumber = watch('governmentIdNumber');

  // Check if walk-in visitors are allowed
  const walkInAllowed = canCreateWalkInVisit();

  const handleIdVerification = () => {
    // Mock ID verification process
    if (watchedName && watchedIdNumber) {
      setIdVerified(true);
      // Simulate verification delay
      setTimeout(() => {
        alert('ID verification successful! Photo matches government ID.');
      }, 1000);
    } else {
      alert('Please enter visitor name and ID number first.');
    }
  };

  const onSubmit = (data: SecurityCheckInFormData) => {
    if (!walkInAllowed) {
      alert('Walk-in visitors are not allowed according to current system rules. Please use the pre-approval system.');
      return;
    }

    if (!photo) {
      alert('Please capture visitor photo before submitting.');
      return;
    }

    // Check if government ID is required by system rules
    if (systemRules.requireGovernmentId && !idVerified) {
      alert('Please verify government ID before submitting.');
      return;
    }

    const selectedHost = approvedHosts.find(h => h.name === data.hostName);
    
    try {
      const newVisitor = {
        name: data.name,
        phone: data.phone,
        company: data.company,
        photoUrl: photo,
        governmentId: systemRules.requireGovernmentId ? {
          type: data.governmentIdType,
          number: data.governmentIdNumber,
          verified: idVerified
        } : undefined,
        checkIns: [{
          id: Date.now().toString(),
          hostId: selectedHost?.id || '2',
          hostName: data.hostName,
          status: 'pending' as const,
          checkInTime: new Date(),
          purpose: data.purpose,
          estimatedWaitTime,
          securityOfficerId: user?.id,
          securityOfficerName: user?.name,
          governmentId: systemRules.requireGovernmentId ? {
            type: data.governmentIdType,
            number: data.governmentIdNumber,
            verified: idVerified
          } : undefined
        }]
      };

      addVisitor(newVisitor);
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An error occurred while processing the check-in.');
      }
    }
  };

  if (!walkInAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-error-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Walk-in Visitors Not Allowed</h2>
          <p className="text-gray-600 mb-6">
            According to current system rules, walk-in visitors are not permitted. All visitors must be pre-approved by their hosts.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/security')}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-warning-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check-in Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Visitor has been registered and host notification sent.
          </p>
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
            <p className="text-warning-800 font-medium">Status: Pending Host Approval</p>
            <p className="text-warning-700 text-sm mt-1">
              Estimated wait time: {estimatedWaitTime} minutes
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setPhoto(null);
                setIdVerified(false);
              }}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Check In Another Visitor
            </button>
            <button
              onClick={() => navigate('/security')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-600 to-secondary-600 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/security')}
            className="inline-flex items-center text-primary-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Security Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Security Check-In</h1>
          <p className="text-primary-100">Verify visitor identity and process check-in</p>
        </div>

        {/* Check-in Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Photo Capture Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Visitor Photo Capture
              </h3>
              <PhotoCapture
                onPhotoCapture={setPhoto}
                currentPhoto={photo}
              />
            </div>

            {/* Visitor Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Visitor Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter visitor's full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-error-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Contact Number *
                  </label>
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+1-555-123-4567"
                  />
                  {errors.phone && (
                    <p className="text-sm text-error-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Company/Organization
                  </label>
                  <input
                    {...register('company')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Visitor's company (optional)"
                  />
                </div>
              </div>

              {/* Government ID Verification - Only show if required by system rules */}
              {systemRules.requireGovernmentId && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Government ID Verification
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Type *
                    </label>
                    <select
                      {...register('governmentIdType', { required: systemRules.requireGovernmentId ? 'ID type is required' : false })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select ID type...</option>
                      {governmentIdTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.governmentIdType && (
                      <p className="text-sm text-error-600 mt-1">{errors.governmentIdType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Number *
                    </label>
                    <input
                      {...register('governmentIdNumber', { required: systemRules.requireGovernmentId ? 'ID number is required' : false })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter ID number"
                    />
                    {errors.governmentIdNumber && (
                      <p className="text-sm text-error-600 mt-1">{errors.governmentIdNumber.message}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">ID Verification Status</span>
                      {idVerified ? (
                        <div className="flex items-center text-success-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-warning-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Not Verified</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleIdVerification}
                      disabled={idVerified}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        idVerified 
                          ? 'bg-success-100 text-success-700 cursor-not-allowed'
                          : 'bg-warning-600 text-white hover:bg-warning-700'
                      }`}
                    >
                      {idVerified ? 'ID Verified Successfully' : 'Verify Government ID'}
                    </button>
                    <p className="text-xs text-gray-600 mt-2">
                      Compare visitor's face with government ID photo and verify details match.
                    </p>
                  </div>
                </div>
              )}

              {/* Show message if ID verification is not required */}
              {!systemRules.requireGovernmentId && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center text-blue-800 mb-2">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="font-medium text-sm">Government ID Verification</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Government ID verification is currently disabled in system settings. 
                      Visitors can check in without ID verification.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Visit Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Visit Details
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Host/Employee to Visit *
                  </label>
                  <select
                    {...register('hostName', { required: 'Please select who the visitor is meeting' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a host...</option>
                    {approvedHosts.map(host => (
                      <option key={host.id} value={host.name}>
                        {host.name} - {host.department}
                      </option>
                    ))}
                  </select>
                  {errors.hostName && (
                    <p className="text-sm text-error-600 mt-1">{errors.hostName.message}</p>
                  )}
                  {approvedHosts.length === 0 && (
                    <p className="text-sm text-warning-600 mt-1">
                      No approved hosts available. Please contact administration.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Wait Time
                  </label>
                  <select
                    value={estimatedWaitTime}
                    onChange={(e) => setEstimatedWaitTime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Visit *
                </label>
                <textarea
                  {...register('purpose', { required: 'Purpose of visit is required' })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of the visit purpose..."
                />
                {errors.purpose && (
                  <p className="text-sm text-error-600 mt-1">{errors.purpose.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/security')}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg text-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={approvedHosts.length === 0}
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Check-In Request
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-primary-100 text-sm">
          <p>
            All visitor information is collected for security purposes and will be handled according to company privacy policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityCheckIn;