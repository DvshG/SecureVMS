import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Clock, User, Building, CheckCircle, XCircle, AlertCircle, Eye, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import VisitorBadge from './VisitorBadge';

const VisitorHistory: React.FC = () => {
  const { getAllVisitorHistory, getVisitorBadge } = useData();
  const [selectedBadge, setSelectedBadge] = useState<{ visitor: any; checkIn: any } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allHistory = getAllVisitorHistory();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-50 text-success-700 border-success-200';
      case 'denied':
        return 'bg-error-50 text-error-700 border-error-200';
      case 'pending':
        return 'bg-warning-50 text-warning-700 border-warning-200';
      case 'checked-out':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'denied':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'checked-out':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredHistory = allHistory.filter(({ visitor, checkIn }) => {
    const matchesStatus = filterStatus === 'all' || checkIn.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.company && visitor.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      checkIn.hostName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleViewBadge = (visitorId: string, checkInId: string) => {
    const badge = getVisitorBadge(visitorId, checkInId);
    if (badge) {
      setSelectedBadge(badge);
    } else {
      alert('Badge not available for this visitor');
    }
  };

  const calculateDuration = (checkIn: any) => {
    if (!checkIn.checkOutTime) return 'Still visiting';
    
    const duration = new Date(checkIn.checkOutTime).getTime() - new Date(checkIn.checkInTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-primary-600" />
          Visitor History
        </h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Search visitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="checked-out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          {filteredHistory.length} of {allHistory.length} records
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Visitor</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Host</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Check-in</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Check-out</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map(({ visitor, checkIn }) => (
              <tr key={`${visitor.id}-${checkIn.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    {visitor.photoUrl ? (
                      <img
                        src={visitor.photoUrl}
                        alt={visitor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{visitor.name}</div>
                      <div className="text-sm text-gray-500">{visitor.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center text-gray-900">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    {visitor.company || 'N/A'}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-900">{checkIn.hostName}</td>
                <td className="py-3 px-4 text-gray-900">
                  {format(new Date(checkIn.checkInTime), 'MMM dd, yyyy h:mm a')}
                </td>
                <td className="py-3 px-4 text-gray-900">
                  {checkIn.checkOutTime 
                    ? format(new Date(checkIn.checkOutTime), 'MMM dd, yyyy h:mm a')
                    : checkIn.status === 'approved' ? 'Still visiting' : 'N/A'
                  }
                </td>
                <td className="py-3 px-4 text-gray-900">
                  {calculateDuration(checkIn)}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(checkIn.status)}`}>
                    {getStatusIcon(checkIn.status)}
                    <span className="capitalize">{checkIn.status}</span>
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert(`Purpose: ${checkIn.purpose}`)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {checkIn.status === 'approved' && checkIn.badgeNumber && (
                      <button
                        onClick={() => handleViewBadge(visitor.id, checkIn.id)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                        title="View badge"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No visitor history found</p>
          </div>
        )}
      </div>

      {/* Badge Modal */}
      {selectedBadge && (
        <VisitorBadge
          visitor={selectedBadge.visitor}
          checkIn={selectedBadge.checkIn}
          onPrint={() => window.print()}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default VisitorHistory;