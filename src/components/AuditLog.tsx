import React, { useState } from 'react';
import { Shield, User, Clock, Filter, Search, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  details: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const AuditLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // Mock audit data - in production, this would come from your audit service
  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      action: 'visitor_approved',
      actor: 'Security Officer Johnson',
      actorRole: 'security',
      target: 'Alice Johnson (Visitor)',
      details: 'Visitor approved for check-in to visit John Doe',
      ipAddress: '192.168.1.100',
      severity: 'low'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      action: 'visitor_denied',
      actor: 'John Doe',
      actorRole: 'host',
      target: 'Bob Smith (Visitor)',
      details: 'Visitor request denied - unauthorized visit attempt',
      ipAddress: '192.168.1.105',
      severity: 'medium'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      action: 'security_alert',
      actor: 'System',
      actorRole: 'system',
      target: 'Carol Davis (Visitor)',
      details: 'Visitor exceeded maximum visit duration (8 hours)',
      ipAddress: 'system',
      severity: 'high'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      action: 'badge_issued',
      actor: 'Security Officer Johnson',
      actorRole: 'security',
      target: 'David Wilson (Visitor)',
      details: 'Digital badge VMS123 issued for pre-approved visit',
      ipAddress: '192.168.1.100',
      severity: 'low'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      action: 'failed_login',
      actor: 'Unknown User',
      actorRole: 'unknown',
      target: 'System Login',
      details: 'Multiple failed login attempts from suspicious IP',
      ipAddress: '203.0.113.42',
      severity: 'critical'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'visitor_approved':
      case 'visitor_denied':
        return <User className="w-4 h-4" />;
      case 'security_alert':
      case 'failed_login':
        return <Shield className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || entry.severity === filterSeverity;
    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Actor', 'Role', 'Target', 'Details', 'IP Address', 'Severity'],
      ...filteredEntries.map(entry => [
        format(entry.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        entry.action,
        entry.actor,
        entry.actorRole,
        entry.target,
        entry.details,
        entry.ipAddress,
        entry.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-primary-600" />
          Security Audit Log
        </h2>
        <button
          onClick={exportAuditLog}
          className="flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Log
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search audit log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Actions</option>
          <option value="visitor_approved">Visitor Approved</option>
          <option value="visitor_denied">Visitor Denied</option>
          <option value="security_alert">Security Alert</option>
          <option value="badge_issued">Badge Issued</option>
          <option value="failed_login">Failed Login</option>
        </select>

        <div className="flex items-center text-sm text-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          {filteredEntries.length} of {auditEntries.length} entries
        </div>
      </div>

      {/* Audit Entries */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEntries.map(entry => (
          <div
            key={entry.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(entry.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{entry.action.replace('_', ' ')}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(entry.severity)}`}>
                      {entry.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{entry.details}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Actor: {entry.actor} ({entry.actorRole})</span>
                    <span>Target: {entry.target}</span>
                    <span>IP: {entry.ipAddress}</span>
                    <span>{format(entry.timestamp, 'MMM dd, yyyy h:mm a')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(entry)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No audit entries found matching your criteria</p>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Entry Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{format(selectedEntry.timestamp, 'EEEE, MMMM dd, yyyy h:mm:ss a')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <p className="text-sm text-gray-900">{selectedEntry.action.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Actor</label>
                  <p className="text-sm text-gray-900">{selectedEntry.actor} ({selectedEntry.actorRole})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target</label>
                  <p className="text-sm text-gray-900">{selectedEntry.target}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Address</label>
                  <p className="text-sm text-gray-900">{selectedEntry.ipAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedEntry.severity)}`}>
                    {selectedEntry.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedEntry.details}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;