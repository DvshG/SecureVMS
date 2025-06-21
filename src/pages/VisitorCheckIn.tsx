import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { User, Building, Phone, Mail, FileText, ArrowLeft, UserPlus, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import PhotoCapture from '../components/PhotoCapture';
import HostRegistration from '../components/HostRegistration';

interface CheckInFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  hostName: string;
  purpose: string;
}

const VisitorCheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { addVisitor, getAllHosts, canCreateWalkInVisit, systemRules } = useData();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHostRegistration, setShowHostRegistration] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CheckInFormData>();

  // Get all hosts (from context + localStorage)
  const allHosts = getAllHosts();
  
  // Filter only approved and active hosts
  const approvedHosts = allHosts.filter(host => host.isApproved && host.isActive);

  // Check if walk-in visitors are allowed
  const walkInAllowed = canCreateWalkInVisit();

  const onSubmit = (data: CheckInFormData) => {
    if (!walkInAllowed) {
      alert('Walk-in visitors are not allowed according to current system rules. Please contact your host to create a pre-approval.');
      return;
    }

    // Check if photo is required but not provided
    if (!photo) {
      alert('Please capture or upload your photo before submitting.');
      return;
    }

    const selectedHost = approvedHosts.find(h => h.name === data.hostName);
    
    try {
      const newVisitor = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        photoUrl: photo || undefined,
        checkIns: [{
          id: Date.now().toString(),
          hostId: selectedHost?.id || '2',
          hostName: data.hostName,
          status: 'pending' as const,
          checkInTime: new Date(),
          purpose: data.purpose
        }]
      };

      addVisitor(newVisitor);
      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An error occurred while processing your check-in.');
      }
    }
  };

  if (!walkInAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-warning-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pre-approval Required</h2>
          <p className="text-gray-600 mb-6">
            Walk-in visitors are currently not allowed. Please contact your host to create a pre-approval for your visit.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>What to do:</strong><br />
              1. Contact your host directly<br />
              2. Ask them to create a pre-approval<br />
              3. You'll receive an access code via email/SMS
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowHostRegistration(true)}
              className="w-full bg-secondary-600 text-white py-2 px-4 rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Register as Host
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Staff Login
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
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check-in Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your host has been notified. Please wait for approval and badge issuance.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setPhoto(null);
              }}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Check In Another Visitor
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Staff Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-600 to-secondary-600 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-primary-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Staff Login
            </button>
            <span className="text-primary-100">|</span>
            <button
              onClick={() => setShowHostRegistration(true)}
              className="inline-flex items-center text-primary-100 hover:text-white transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register as Host
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Visitor Check-In</h1>
          <p className="text-primary-100">Please provide your information to check in</p>
        </div>

        {/* Check-in Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Capture */}
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Visitor Photo</h3>
              <PhotoCapture
                onPhotoCapture={setPhoto}
                currentPhoto={photo}
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-sm text-error-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="your.email@company.com"
                />
                {errors.email && (
                  <p className="text-sm text-error-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
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
                  {...register('company', { required: 'Company is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your company name"
                />
                {errors.company && (
                  <p className="text-sm text-error-600 mt-1">{errors.company.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Person You're Visiting
              </label>
              <select
                {...register('hostName', { required: 'Please select who you are visiting' })}
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
                <div className="mt-2 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <p className="text-sm text-warning-800">
                    <strong>No approved hosts available.</strong> Please contact administration or register as a host if you're an employee.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Purpose of Visit
              </label>
              <textarea
                {...register('purpose', { required: 'Purpose of visit is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of your visit..."
              />
              {errors.purpose && (
                <p className="text-sm text-error-600 mt-1">{errors.purpose.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={approvedHosts.length === 0}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Check-In
            </button>
          </form>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 text-center text-primary-100 text-sm">
          <p>
            By checking in, you agree to our visitor policies and acknowledge that your information 
            will be used for security and contact purposes during your visit.
          </p>
        </div>
      </div>

      {/* Host Registration Modal */}
      {showHostRegistration && (
        <HostRegistration onClose={() => setShowHostRegistration(false)} />
      )}
    </div>
  );
};

export default VisitorCheckIn;