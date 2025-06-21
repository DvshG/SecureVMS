import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { User, Mail, Building, X, CheckCircle, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface HostRegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  maxVisitorsPerDay: number;
}

interface HostRegistrationProps {
  onClose: () => void;
}

const HostRegistration: React.FC<HostRegistrationProps> = ({ onClose }) => {
  const { addHost } = useData();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<HostRegistrationFormData>();

  const password = watch('password');

  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Legal',
    'IT',
    'Customer Support',
    'Product Management'
  ];

  const onSubmit = (data: HostRegistrationFormData) => {
    const newHost = {
      name: data.name,
      email: data.email,
      password: data.password,
      department: data.department,
      isActive: true,
      maxVisitorsPerDay: data.maxVisitorsPerDay
    };

    addHost(newHost);
    
    // Store in localStorage for authentication
    const registeredHosts = JSON.parse(localStorage.getItem('vms_registered_hosts') || '[]');
    registeredHosts.push({
      ...newHost,
      id: Date.now().toString(),
      isApproved: false,
      createdAt: new Date()
    });
    localStorage.setItem('vms_registered_hosts', JSON.stringify(registeredHosts));
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your host registration has been submitted for admin approval. You will be able to login once approved.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Next Steps:</strong><br />
              1. Wait for admin approval<br />
              2. You'll receive confirmation<br />
              3. Login with your email and password
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Host Registration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="text-sm text-error-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-error-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Department
            </label>
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select department...</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <p className="text-sm text-error-600 mt-1">{errors.department.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Visitors Per Day
            </label>
            <select
              {...register('maxVisitorsPerDay', { required: 'Please select a limit' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select limit...</option>
              <option value={3}>3 visitors</option>
              <option value={5}>5 visitors</option>
              <option value={10}>10 visitors</option>
              <option value={15}>15 visitors</option>
              <option value={20}>20 visitors</option>
            </select>
            {errors.maxVisitorsPerDay && (
              <p className="text-sm text-error-600 mt-1">{errors.maxVisitorsPerDay.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Your registration will be reviewed by an administrator. 
              You will be able to login with your email and password once approved.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Submit Registration
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostRegistration;