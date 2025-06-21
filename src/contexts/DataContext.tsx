import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VisitorCheckIn {
  id: string;
  hostId: string;
  hostName: string;
  status: 'pending' | 'approved' | 'denied' | 'checked-out' | 'cancelled';
  checkInTime: Date;
  checkOutTime?: Date;
  purpose: string;
  badgeNumber?: string;
  qrCode?: string;
  estimatedWaitTime?: number; // in minutes
  securityOfficerId?: string;
  securityOfficerName?: string;
  governmentId?: {
    type: string;
    number: string;
    verified: boolean;
  };
  approvedAt?: Date;
  approvedBy?: string;
  deniedAt?: Date;
  deniedBy?: string;
  denialReason?: string;
  isPreApproved?: boolean;
  preApprovalId?: string;
}

export interface Visitor {
  id: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  photoUrl?: string;
  governmentId?: {
    type: string;
    number: string;
    verified: boolean;
  };
  checkIns: VisitorCheckIn[];
  createdAt: Date;
  lastVisit?: Date;
  totalVisits: number;
  isBlacklisted?: boolean;
  blacklistReason?: string;
}

export interface PreApproval {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  visitorCompany: string;
  hostId: string;
  hostName: string;
  scheduledDate: Date;
  purpose: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
  accessCode?: string;
  qrCode?: string;
  emailSent?: boolean;
  smsSent?: boolean;
  remindersSent?: Date[];
  badgeNumber?: string;
  approvedVisitorId?: string;
}

export interface Host {
  id: string;
  name: string;
  email: string;
  password?: string;
  department: string;
  isActive: boolean;
  isApproved: boolean;
  maxVisitorsPerDay: number;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetId?: string;
  targetName?: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'visitor_management' | 'user_management' | 'security' | 'system';
}

export interface SystemRules {
  maxVisitorsPerHostPerDay: number;
  requirePreApprovalForExternalVisitors: boolean;
  maxWaitTimeBeforeAlert: number; // minutes
  autoExpirePreApprovalsAfter: number; // hours
  requireGovernmentId: boolean;
  allowWalkInVisitors: boolean;
}

interface DataContextType {
  visitors: Visitor[];
  preApprovals: PreApproval[];
  hosts: Host[];
  auditLog: AuditEntry[];
  systemRules: SystemRules;
  addVisitor: (visitor: Omit<Visitor, 'id' | 'createdAt' | 'totalVisits'>) => void;
  updateVisitorCheckIn: (visitorId: string, checkInId: string, updates: Partial<VisitorCheckIn>) => void;
  cancelCheckIn: (visitorId: string, checkInId: string) => void;
  addPreApproval: (preApproval: Omit<PreApproval, 'id' | 'createdAt' | 'accessCode'>) => void;
  updatePreApproval: (id: string, updates: Partial<PreApproval>) => void;
  usePreApproval: (id: string, visitorId: string) => void;
  addHost: (host: Omit<Host, 'id' | 'createdAt' | 'isApproved'>) => void;
  approveHost: (hostId: string, approvedBy: string, password: string) => void;
  updateSystemRules: (rules: Partial<SystemRules>) => void;
  getActiveVisitors: () => Visitor[];
  getPendingApprovals: () => { visitor: Visitor; checkIn: VisitorCheckIn }[];
  getAllVisitorHistory: () => { visitor: Visitor; checkIn: VisitorCheckIn }[];
  getApprovedVisitors: () => { visitor: Visitor; checkIn: VisitorCheckIn }[];
  getVisitorStats: () => {
    totalToday: number;
    activeNow: number;
    pendingApproval: number;
    preApprovedToday: number;
    averageWaitTime: number;
    totalCheckOuts: number;
  };
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  blacklistVisitor: (visitorId: string, reason: string) => void;
  removeFromBlacklist: (visitorId: string) => void;
  sendNotification: (type: 'email' | 'sms', recipient: string, message: string) => Promise<boolean>;
  generateVisitorReport: (startDate: Date, endDate: Date) => any;
  getVisitorBadge: (visitorId: string, checkInId: string) => { visitor: Visitor; checkIn: VisitorCheckIn } | null;
  getPreApprovalBadge: (preApprovalId: string) => PreApproval | null;
  canCreateWalkInVisit: () => boolean;
  getAllHosts: () => Host[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [preApprovals, setPreApprovals] = useState<PreApproval[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [systemRules, setSystemRules] = useState<SystemRules>({
    maxVisitorsPerHostPerDay: 5,
    requirePreApprovalForExternalVisitors: false,
    maxWaitTimeBeforeAlert: 15,
    autoExpirePreApprovalsAfter: 24,
    requireGovernmentId: true,
    allowWalkInVisitors: true
  });

  // Initialize with enhanced mock data
  useEffect(() => {
    const mockHosts: Host[] = [
      {
        id: '2',
        name: 'John Doe',
        email: 'john@company.com',
        password: 'password',
        department: 'Engineering',
        isActive: true,
        isApproved: true,
        maxVisitorsPerDay: 5,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        approvedBy: 'Admin User',
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Jane Smith',
        email: 'jane@company.com',
        password: 'password',
        department: 'Marketing',
        isActive: true,
        isApproved: true,
        maxVisitorsPerDay: 5,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        approvedBy: 'Admin User',
        approvedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        name: 'Mike Johnson',
        email: 'mike@company.com',
        department: 'Sales',
        isActive: true,
        isApproved: false,
        maxVisitorsPerDay: 5,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockVisitors: Visitor[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Inc.',
        photoUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
        governmentId: {
          type: 'Driver License',
          number: 'DL123456789',
          verified: true
        },
        totalVisits: 3,
        lastVisit: new Date(),
        checkIns: [{
          id: 'ci1',
          hostId: '2',
          hostName: 'John Doe',
          status: 'approved',
          checkInTime: new Date(),
          purpose: 'Business Meeting',
          badgeNumber: 'VMS001',
          qrCode: 'QR_VMS001',
          securityOfficerId: '1',
          securityOfficerName: 'Security Officer Johnson',
          governmentId: {
            type: 'Driver License',
            number: 'DL123456789',
            verified: true
          },
          approvedAt: new Date(),
          approvedBy: 'John Doe'
        }],
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@consulting.com',
        phone: '+1-555-0456',
        company: 'Smith Consulting',
        photoUrl: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150',
        governmentId: {
          type: 'Passport',
          number: 'P987654321',
          verified: true
        },
        totalVisits: 1,
        checkIns: [{
          id: 'ci2',
          hostId: '2',
          hostName: 'John Doe',
          status: 'pending',
          checkInTime: new Date(Date.now() - 15 * 60 * 1000),
          purpose: 'Technical Interview',
          estimatedWaitTime: 10,
          securityOfficerId: '1',
          securityOfficerName: 'Security Officer Johnson',
          governmentId: {
            type: 'Passport',
            number: 'P987654321',
            verified: true
          }
        }],
        createdAt: new Date(Date.now() - 15 * 60 * 1000)
      }
    ];

    const mockPreApprovals: PreApproval[] = [
      {
        id: '1',
        visitorName: 'David Wilson',
        visitorEmail: 'david@consulting.com',
        visitorPhone: '+1-555-0321',
        visitorCompany: 'Wilson Consulting',
        hostId: '2',
        hostName: 'John Doe',
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        purpose: 'Project Planning Session',
        status: 'active',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        accessCode: 'PA-WILSON1',
        qrCode: 'QR_PA_WILSON1',
        emailSent: true,
        smsSent: false,
        remindersSent: [],
        createdAt: new Date()
      }
    ];

    const mockAuditLog: AuditEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        action: 'visitor_approved',
        actorId: '1',
        actorName: 'Security Officer Johnson',
        actorRole: 'security',
        targetId: '1',
        targetName: 'Alice Johnson',
        details: 'Visitor approved for check-in to visit John Doe',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        severity: 'low',
        category: 'visitor_management'
      }
    ];

    setHosts(mockHosts);
    setVisitors(mockVisitors);
    setPreApprovals(mockPreApprovals);
    setAuditLog(mockAuditLog);
  }, []);

  const getAllHosts = () => {
    // Get hosts from context
    const contextHosts = hosts;
    
    // Get registered hosts from localStorage
    const registeredHosts = JSON.parse(localStorage.getItem('vms_registered_hosts') || '[]');
    
    // Combine and deduplicate
    const allHosts = [...contextHosts];
    
    registeredHosts.forEach((regHost: any) => {
      if (!allHosts.find(h => h.email === regHost.email)) {
        allHosts.push({
          id: regHost.id || regHost.email,
          name: regHost.name,
          email: regHost.email,
          password: regHost.password,
          department: regHost.department,
          isActive: regHost.isActive || true,
          isApproved: regHost.isApproved || false,
          maxVisitorsPerDay: regHost.maxVisitorsPerDay || 5,
          createdAt: new Date(regHost.createdAt),
          approvedBy: regHost.approvedBy,
          approvedAt: regHost.approvedAt ? new Date(regHost.approvedAt) : undefined
        });
      }
    });
    
    return allHosts;
  };

  const addAuditEntry = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setAuditLog(prev => [newEntry, ...prev]);
  };

  const addHost = (hostData: Omit<Host, 'id' | 'createdAt' | 'isApproved'>) => {
    const newHost: Host = {
      ...hostData,
      id: Date.now().toString(),
      createdAt: new Date(),
      isApproved: false
    };
    setHosts(prev => [...prev, newHost]);

    addAuditEntry({
      action: 'host_registration',
      actorId: newHost.id,
      actorName: newHost.name,
      actorRole: 'host',
      targetId: newHost.id,
      targetName: newHost.name,
      details: `New host ${newHost.name} registered and pending approval`,
      ipAddress: '192.168.1.100',
      severity: 'low',
      category: 'user_management'
    });
  };

  const approveHost = (hostId: string, approvedBy: string, password: string) => {
    setHosts(prev => prev.map(host => 
      host.id === hostId 
        ? { ...host, isApproved: true, approvedBy, approvedAt: new Date(), password }
        : host
    ));

    const host = hosts.find(h => h.id === hostId);
    addAuditEntry({
      action: 'host_approved',
      actorId: 'admin',
      actorName: approvedBy,
      actorRole: 'admin',
      targetId: hostId,
      targetName: host?.name || 'Unknown',
      details: `Host ${host?.name} approved by ${approvedBy}`,
      ipAddress: '192.168.1.100',
      severity: 'low',
      category: 'user_management'
    });
  };

  const updateSystemRules = (rules: Partial<SystemRules>) => {
    setSystemRules(prev => ({ ...prev, ...rules }));
    
    addAuditEntry({
      action: 'system_rules_updated',
      actorId: 'admin',
      actorName: 'Admin',
      actorRole: 'admin',
      details: `System rules updated: ${Object.keys(rules).join(', ')}`,
      ipAddress: '192.168.1.100',
      severity: 'medium',
      category: 'system'
    });
  };

  const canCreateWalkInVisit = () => {
    return systemRules.allowWalkInVisitors;
  };

  const addVisitor = (visitorData: Omit<Visitor, 'id' | 'createdAt' | 'totalVisits'>) => {
    // Check if walk-in visitors are allowed
    if (!canCreateWalkInVisit()) {
      throw new Error('Walk-in visitors are not allowed. Please use pre-approval system.');
    }

    const newVisitor: Visitor = {
      ...visitorData,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalVisits: 1,
      lastVisit: new Date()
    };
    setVisitors(prev => [...prev, newVisitor]);

    // Add audit entry
    addAuditEntry({
      action: 'visitor_created',
      actorId: 'system',
      actorName: 'System',
      actorRole: 'system',
      targetId: newVisitor.id,
      targetName: newVisitor.name,
      details: `New visitor ${newVisitor.name} registered for check-in`,
      ipAddress: 'system',
      severity: 'low',
      category: 'visitor_management'
    });
  };

  const updateVisitorCheckIn = (visitorId: string, checkInId: string, updates: Partial<VisitorCheckIn>) => {
    setVisitors(prev => prev.map(visitor => {
      if (visitor.id === visitorId) {
        const updatedCheckIns = visitor.checkIns.map(checkIn => {
          if (checkIn.id === checkInId) {
            const updatedCheckIn = { ...checkIn, ...updates };
            
            // If approving, generate badge number if not provided
            if (updates.status === 'approved' && !updatedCheckIn.badgeNumber) {
              updatedCheckIn.badgeNumber = `VMS${String(Date.now()).slice(-3)}`;
              updatedCheckIn.qrCode = `QR_${updatedCheckIn.badgeNumber}`;
            }
            
            return updatedCheckIn;
          }
          return checkIn;
        });
        
        return {
          ...visitor,
          checkIns: updatedCheckIns,
          lastVisit: new Date()
        };
      }
      return visitor;
    }));

    // Update pre-approval if this was a pre-approved visit
    if (updates.status === 'approved' && updates.preApprovalId) {
      setPreApprovals(prev => prev.map(pa => 
        pa.id === updates.preApprovalId 
          ? { 
              ...pa, 
              status: 'used' as const, 
              usedAt: new Date(),
              approvedVisitorId: visitorId,
              badgeNumber: updates.badgeNumber
            }
          : pa
      ));
    }

    // Add audit entry for status changes
    if (updates.status) {
      const visitor = visitors.find(v => v.id === visitorId);
      addAuditEntry({
        action: `visitor_${updates.status}`,
        actorId: updates.approvedBy || updates.deniedBy || 'system',
        actorName: updates.approvedBy || updates.deniedBy || 'System',
        actorRole: 'user',
        targetId: visitorId,
        targetName: visitor?.name || 'Unknown',
        details: `Visitor status changed to ${updates.status}${updates.denialReason ? ` - Reason: ${updates.denialReason}` : ''}`,
        ipAddress: '192.168.1.100',
        severity: updates.status === 'denied' ? 'medium' : 'low',
        category: 'visitor_management'
      });
    }
  };

  const cancelCheckIn = (visitorId: string, checkInId: string) => {
    updateVisitorCheckIn(visitorId, checkInId, { 
      status: 'cancelled',
      checkOutTime: new Date()
    });
  };

  const addPreApproval = (preApprovalData: Omit<PreApproval, 'id' | 'createdAt' | 'accessCode'>) => {
    const accessCode = `PA-${Date.now().toString().slice(-6).toUpperCase()}`;
    
    // Calculate expiry based on system rules
    const expiryHours = systemRules.autoExpirePreApprovalsAfter;
    const calculatedExpiresAt = new Date(preApprovalData.scheduledDate.getTime() + expiryHours * 60 * 60 * 1000);
    
    const newPreApproval: PreApproval = {
      ...preApprovalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      accessCode,
      qrCode: `QR_${accessCode}`,
      emailSent: false,
      smsSent: false,
      remindersSent: [],
      expiresAt: calculatedExpiresAt // Use calculated expiry
    };
    setPreApprovals(prev => [...prev, newPreApproval]);

    // Send notifications immediately
    setTimeout(async () => {
      try {
        const emailMessage = `Dear ${preApprovalData.visitorName},

Your visit to ${preApprovalData.hostName} has been pre-approved!

Visit Details:
- Date: ${preApprovalData.scheduledDate.toLocaleDateString()}
- Time: ${preApprovalData.scheduledDate.toLocaleTimeString()}
- Purpose: ${preApprovalData.purpose}
- Access Code: ${accessCode}

Please present this access code at the security checkpoint.

Valid until: ${calculatedExpiresAt.toLocaleString()}

Best regards,
SecureVMS Team`;

        const smsMessage = `VMS: Visit pre-approved. Host: ${preApprovalData.hostName}. Date: ${preApprovalData.scheduledDate.toLocaleDateString()}. Code: ${accessCode}. Valid until: ${calculatedExpiresAt.toLocaleDateString()}`;
        
        await sendNotification('email', preApprovalData.visitorEmail, emailMessage);
        await sendNotification('sms', preApprovalData.visitorPhone, smsMessage);
        
        // Update the pre-approval to mark notifications as sent
        setPreApprovals(prev => prev.map(pa => 
          pa.id === newPreApproval.id 
            ? { ...pa, emailSent: true, smsSent: true }
            : pa
        ));
      } catch (error) {
        console.error('Failed to send notifications:', error);
      }
    }, 1000);

    // Add audit entry
    addAuditEntry({
      action: 'preapproval_created',
      actorId: preApprovalData.hostId,
      actorName: preApprovalData.hostName,
      actorRole: 'host',
      targetName: preApprovalData.visitorName,
      details: `Pre-approval created for ${preApprovalData.visitorName}, expires at ${calculatedExpiresAt.toLocaleString()}`,
      ipAddress: '192.168.1.100',
      severity: 'low',
      category: 'visitor_management'
    });
  };

  const updatePreApproval = (id: string, updates: Partial<PreApproval>) => {
    setPreApprovals(prev => prev.map(preApproval => 
      preApproval.id === id ? { ...preApproval, ...updates } : preApproval
    ));
  };

  const usePreApproval = (id: string, visitorId: string) => {
    updatePreApproval(id, { 
      status: 'used',
      usedAt: new Date(),
      approvedVisitorId: visitorId
    });

    // Add audit entry
    addAuditEntry({
      action: 'preapproval_used',
      actorId: visitorId,
      actorName: 'Visitor',
      actorRole: 'visitor',
      targetId: id,
      targetName: 'Pre-approval',
      details: `Pre-approval ${id} used for check-in`,
      ipAddress: '192.168.1.100',
      severity: 'low',
      category: 'visitor_management'
    });
  };

  const blacklistVisitor = (visitorId: string, reason: string) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === visitorId 
        ? { ...visitor, isBlacklisted: true, blacklistReason: reason }
        : visitor
    ));

    // Add audit entry
    const visitor = visitors.find(v => v.id === visitorId);
    addAuditEntry({
      action: 'visitor_blacklisted',
      actorId: 'admin',
      actorName: 'Admin',
      actorRole: 'admin',
      targetId: visitorId,
      targetName: visitor?.name || 'Unknown',
      details: `Visitor blacklisted: ${reason}`,
      ipAddress: '192.168.1.100',
      severity: 'high',
      category: 'security'
    });
  };

  const removeFromBlacklist = (visitorId: string) => {
    setVisitors(prev => prev.map(visitor => 
      visitor.id === visitorId 
        ? { ...visitor, isBlacklisted: false, blacklistReason: undefined }
        : visitor
    ));

    // Add audit entry
    const visitor = visitors.find(v => v.id === visitorId);
    addAuditEntry({
      action: 'visitor_unblacklisted',
      actorId: 'admin',
      actorName: 'Admin',
      actorRole: 'admin',
      targetId: visitorId,
      targetName: visitor?.name || 'Unknown',
      details: 'Visitor removed from blacklist',
      ipAddress: '192.168.1.100',
      severity: 'medium',
      category: 'security'
    });
  };

  const sendNotification = async (type: 'email' | 'sms', recipient: string, message: string): Promise<boolean> => {
    // Enhanced mock notification sending with actual simulation
    console.log(`📧 Sending ${type.toUpperCase()} to ${recipient}:`);
    console.log(`📝 Message: ${message}`);
    console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add audit entry
    addAuditEntry({
      action: `notification_sent_${type}`,
      actorId: 'system',
      actorName: 'Notification System',
      actorRole: 'system',
      details: `${type.toUpperCase()} notification sent to ${recipient}`,
      ipAddress: 'system',
      severity: 'low',
      category: 'system'
    });

    // Show user-friendly notification
    if (type === 'email') {
      alert(`📧 Email sent successfully to ${recipient}!\n\nMessage preview:\n${message.substring(0, 200)}${message.length > 200 ? '...' : ''}`);
    } else {
      alert(`📱 SMS sent successfully to ${recipient}!\n\nMessage: ${message}`);
    }

    return true; // Mock success
  };

  const getActiveVisitors = () => {
    return visitors.filter(visitor => 
      visitor.checkIns.some(checkIn => 
        checkIn.status === 'approved' && !checkIn.checkOutTime
      )
    );
  };

  const getPendingApprovals = () => {
    const pendingApprovals: { visitor: Visitor; checkIn: VisitorCheckIn }[] = [];
    visitors.forEach(visitor => {
      visitor.checkIns.forEach(checkIn => {
        if (checkIn.status === 'pending') {
          pendingApprovals.push({ visitor, checkIn });
        }
      });
    });
    return pendingApprovals.sort((a, b) => 
      a.checkIn.checkInTime.getTime() - b.checkIn.checkInTime.getTime()
    );
  };

  const getAllVisitorHistory = () => {
    const allHistory: { visitor: Visitor; checkIn: VisitorCheckIn }[] = [];
    visitors.forEach(visitor => {
      visitor.checkIns.forEach(checkIn => {
        allHistory.push({ visitor, checkIn });
      });
    });
    return allHistory.sort((a, b) => 
      b.checkIn.checkInTime.getTime() - a.checkIn.checkInTime.getTime()
    );
  };

  const getApprovedVisitors = () => {
    const approvedVisitors: { visitor: Visitor; checkIn: VisitorCheckIn }[] = [];
    visitors.forEach(visitor => {
      visitor.checkIns.forEach(checkIn => {
        if (checkIn.status === 'approved') {
          approvedVisitors.push({ visitor, checkIn });
        }
      });
    });
    return approvedVisitors.sort((a, b) => 
      b.checkIn.checkInTime.getTime() - a.checkIn.checkInTime.getTime()
    );
  };

  const getVisitorBadge = (visitorId: string, checkInId: string) => {
    const visitor = visitors.find(v => v.id === visitorId);
    if (!visitor) return null;
    
    const checkIn = visitor.checkIns.find(ci => ci.id === checkInId);
    if (!checkIn || checkIn.status !== 'approved') return null;
    
    return { visitor, checkIn };
  };

  const getPreApprovalBadge = (preApprovalId: string) => {
    return preApprovals.find(pa => pa.id === preApprovalId) || null;
  };

  const getVisitorStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayVisitors = visitors.filter(v => v.createdAt >= today);
    const activeNow = getActiveVisitors().length;
    const pendingApproval = getPendingApprovals().length;
    const preApprovedToday = preApprovals.filter(pa => 
      pa.scheduledDate >= today && pa.scheduledDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
    ).length;

    // Calculate average wait time
    const completedCheckIns = visitors.flatMap(v => v.checkIns)
      .filter(ci => ci.status === 'approved' && ci.approvedAt);
    
    const totalWaitTime = completedCheckIns.reduce((sum, ci) => {
      if (ci.approvedAt) {
        return sum + (ci.approvedAt.getTime() - ci.checkInTime.getTime());
      }
      return sum;
    }, 0);
    
    const averageWaitTime = completedCheckIns.length > 0 
      ? Math.round(totalWaitTime / completedCheckIns.length / (1000 * 60)) 
      : 0;

    const totalCheckOuts = visitors.flatMap(v => v.checkIns)
      .filter(ci => ci.status === 'checked-out').length;

    return {
      totalToday: todayVisitors.length,
      activeNow,
      pendingApproval,
      preApprovedToday,
      averageWaitTime,
      totalCheckOuts
    };
  };

  const generateVisitorReport = (startDate: Date, endDate: Date) => {
    const filteredVisitors = visitors.filter(v => 
      v.createdAt >= startDate && v.createdAt <= endDate
    );

    const report = {
      period: { startDate, endDate },
      totalVisitors: filteredVisitors.length,
      totalCheckIns: filteredVisitors.flatMap(v => v.checkIns).length,
      approvedVisits: filteredVisitors.flatMap(v => v.checkIns).filter(ci => ci.status === 'approved').length,
      deniedVisits: filteredVisitors.flatMap(v => v.checkIns).filter(ci => ci.status === 'denied').length,
      topCompanies: {},
      averageVisitDuration: 0,
      securityIncidents: auditLog.filter(entry => 
        entry.severity === 'high' || entry.severity === 'critical'
      ).length
    };

    return report;
  };

  return (
    <DataContext.Provider value={{
      visitors,
      preApprovals,
      hosts,
      auditLog,
      systemRules,
      addVisitor,
      updateVisitorCheckIn,
      cancelCheckIn,
      addPreApproval,
      updatePreApproval,
      usePreApproval,
      addHost,
      approveHost,
      updateSystemRules,
      getActiveVisitors,
      getPendingApprovals,
      getAllVisitorHistory,
      getApprovedVisitors,
      getVisitorStats,
      addAuditEntry,
      blacklistVisitor,
      removeFromBlacklist,
      sendNotification,
      generateVisitorReport,
      getVisitorBadge,
      getPreApprovalBadge,
      canCreateWalkInVisit,
      getAllHosts
    }}>
      {children}
    </DataContext.Provider>
  );
};