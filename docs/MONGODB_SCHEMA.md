# MongoDB Schema Design for SecureVMS

## Overview

SecureVMS uses MongoDB as the primary datastore, leveraging its flexible document model to efficiently store visitor data with embedded check-in records. This design optimizes for the most common access patterns while maintaining data consistency and performance.

## Schema Design Principles

### 1. Embed vs Reference Strategy
- **Embed**: Check-ins within visitor documents (1-to-few relationship)
- **Reference**: Users/hosts as separate collection (many-to-many relationship)
- **Hybrid**: Pre-approvals as separate collection with references

### 2. Query Optimization
- Compound indexes for common query patterns
- Text indexes for search functionality
- TTL indexes for automatic data cleanup
- Sparse indexes for optional fields

### 3. Data Consistency
- Atomic operations within single documents
- Two-phase commits for cross-collection updates
- Optimistic concurrency control with version fields

## Core Collections

### 1. Visitors Collection

```javascript
// Collection: visitors
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  
  // Basic visitor information
  name: "John Doe",
  email: "john.doe@techcorp.com",
  phone: "+1-555-123-4567",
  company: "TechCorp Inc.",
  
  // Photo storage (S3 URL or GridFS reference)
  photoUrl: "https://s3.amazonaws.com/vms-photos/507f1f77bcf86cd799439011.jpg",
  photoGridFSId: ObjectId("507f1f77bcf86cd799439012"), // Alternative: GridFS
  
  // Embedded check-ins array (optimized for most common queries)
  checkIns: [
    {
      _id: ObjectId("507f1f77bcf86cd799439013"),
      hostId: ObjectId("507f1f77bcf86cd799439014"),
      hostName: "Jane Manager", // Denormalized for performance
      hostDepartment: "Engineering", // Denormalized for reporting
      
      status: "approved", // pending, approved, denied, checked-out
      
      // Timestamps
      checkInTime: ISODate("2024-01-15T09:00:00.000Z"),
      checkOutTime: ISODate("2024-01-15T17:30:00.000Z"),
      
      // Visit details
      purpose: "Weekly team meeting and project review",
      
      // Badge information
      badgeNumber: "VMS001",
      qrCode: "QR_VMS001_20240115_090000",
      
      // Approval workflow
      approvedBy: ObjectId("507f1f77bcf86cd799439015"),
      approvedAt: ISODate("2024-01-15T09:05:00.000Z"),
      
      // Security fields
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      
      // Custom fields for extensibility
      customFields: {
        escortRequired: true,
        accessLevel: "floor-2",
        parkingSpot: "A-15"
      }
    }
  ],
  
  // Visitor metadata
  totalVisits: 5, // Calculated field for performance
  lastVisit: ISODate("2024-01-15T09:00:00.000Z"),
  
  // GDPR compliance
  dataRetentionDate: ISODate("2025-01-15T00:00:00.000Z"),
  consentGiven: true,
  consentDate: ISODate("2024-01-15T09:00:00.000Z"),
  
  // Audit fields
  createdAt: ISODate("2024-01-15T09:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T17:30:00.000Z"),
  version: 3 // For optimistic concurrency control
}
```

#### Visitors Collection Indexes

```javascript
// Primary indexes for common queries
db.visitors.createIndex({ "email": 1 }, { unique: true })
db.visitors.createIndex({ "phone": 1 })
db.visitors.createIndex({ "company": 1, "createdAt": -1 })

// Compound indexes for check-in queries
db.visitors.createIndex({ 
  "checkIns.status": 1, 
  "checkIns.checkInTime": -1 
})
db.visitors.createIndex({ 
  "checkIns.hostId": 1, 
  "checkIns.status": 1,
  "checkIns.checkInTime": -1 
})

// Text search index
db.visitors.createIndex({
  "name": "text",
  "email": "text", 
  "company": "text",
  "checkIns.purpose": "text"
}, {
  weights: {
    "name": 10,
    "email": 5,
    "company": 3,
    "checkIns.purpose": 1
  },
  name: "visitor_search_index"
})

// Sparse index for photo references
db.visitors.createIndex({ "photoGridFSId": 1 }, { sparse: true })

// TTL index for GDPR compliance
db.visitors.createIndex({ "dataRetentionDate": 1 }, { 
  expireAfterSeconds: 0,
  name: "gdpr_cleanup_index"
})

// Performance indexes
db.visitors.createIndex({ "lastVisit": -1 })
db.visitors.createIndex({ "totalVisits": -1 })
```

### 2. Users Collection

```javascript
// Collection: users
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  
  // Basic user information
  name: "Jane Manager",
  email: "jane.manager@company.com",
  
  // Authentication
  passwordHash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZG.Su",
  passwordSalt: "$2b$12$LQv3c1yqBWVHxkd0LHAkCO",
  
  // Authorization
  role: "host", // security, host, admin
  permissions: [
    "visitor:view",
    "visitor:approve", 
    "preapproval:create"
  ],
  
  // Profile information
  department: "Engineering",
  title: "Senior Engineering Manager",
  employeeId: "EMP001234",
  
  // Contact information
  phone: "+1-555-987-6543",
  extension: "1234",
  
  // Notification preferences
  notificationPreferences: {
    email: true,
    sms: false,
    inApp: true,
    desktop: true,
    
    // Notification timing
    workingHours: {
      start: "09:00",
      end: "17:00",
      timezone: "America/New_York"
    },
    
    // Notification types
    visitorCheckIn: true,
    visitorApproval: true,
    preApprovalReminder: true,
    dailySummary: false
  },
  
  // Security settings
  twoFactorEnabled: false,
  lastPasswordChange: ISODate("2024-01-01T00:00:00.000Z"),
  failedLoginAttempts: 0,
  lockedUntil: null,
  
  // Session management
  refreshTokens: [
    {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      createdAt: ISODate("2024-01-15T09:00:00.000Z"),
      expiresAt: ISODate("2024-01-22T09:00:00.000Z"),
      deviceInfo: "Chrome 120.0.0 on Windows 10"
    }
  ],
  
  // Activity tracking
  isActive: true,
  lastLogin: ISODate("2024-01-15T09:00:00.000Z"),
  lastActivity: ISODate("2024-01-15T16:45:00.000Z"),
  
  // Audit fields
  createdAt: ISODate("2024-01-01T00:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T16:45:00.000Z"),
  createdBy: ObjectId("507f1f77bcf86cd799439016"), // Admin who created
  version: 2
}
```

#### Users Collection Indexes

```javascript
// Authentication indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "employeeId": 1 }, { unique: true, sparse: true })

// Authorization indexes
db.users.createIndex({ "role": 1, "isActive": 1 })
db.users.createIndex({ "permissions": 1 })

// Activity indexes
db.users.createIndex({ "lastLogin": -1 })
db.users.createIndex({ "isActive": 1, "department": 1 })

// Security indexes
db.users.createIndex({ "refreshTokens.token": 1 }, { sparse: true })
db.users.createIndex({ "lockedUntil": 1 }, { sparse: true })

// TTL index for expired refresh tokens
db.users.createIndex({ "refreshTokens.expiresAt": 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { "refreshTokens.expiresAt": { $exists: true } }
})
```

### 3. PreApprovals Collection

```javascript
// Collection: preapprovals
{
  _id: ObjectId("507f1f77bcf86cd799439017"),
  
  // Visitor information (denormalized for performance)
  visitorName: "Bob Smith",
  visitorEmail: "bob.smith@consulting.com",
  visitorPhone: "+1-555-456-7890",
  visitorCompany: "Smith Consulting LLC",
  
  // Host information
  hostId: ObjectId("507f1f77bcf86cd799439014"),
  hostName: "Jane Manager", // Denormalized
  hostDepartment: "Engineering", // Denormalized
  
  // Visit scheduling
  scheduledDate: ISODate("2024-01-16T14:00:00.000Z"),
  scheduledEndDate: ISODate("2024-01-16T16:00:00.000Z"), // Optional
  purpose: "Technical consultation and code review",
  
  // Pre-approval details
  accessLevel: "floor-2",
  escortRequired: false,
  parkingRequired: true,
  
  // Status tracking
  status: "active", // active, used, expired, cancelled
  
  // Usage tracking
  usedAt: null, // Set when visitor checks in
  usedByVisitorId: null, // Reference to actual visitor document
  
  // Automatic expiry (TTL)
  expiresAt: ISODate("2024-01-17T14:00:00.000Z"),
  
  // Notification tracking
  remindersSent: [
    {
      type: "24h_reminder",
      sentAt: ISODate("2024-01-15T14:00:00.000Z"),
      recipient: "bob.smith@consulting.com"
    }
  ],
  
  // Custom fields
  customFields: {
    meetingRoom: "Conference Room A",
    equipment: ["laptop", "projector"],
    dietaryRestrictions: "vegetarian"
  },
  
  // Audit fields
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z"),
  createdBy: ObjectId("507f1f77bcf86cd799439014"),
  version: 1
}
```

#### PreApprovals Collection Indexes

```javascript
// TTL index for automatic cleanup
db.preapprovals.createIndex({ "expiresAt": 1 }, { 
  expireAfterSeconds: 0,
  name: "preapproval_ttl_index"
})

// Query indexes
db.preapprovals.createIndex({ "hostId": 1, "status": 1, "scheduledDate": -1 })
db.preapprovals.createIndex({ "visitorEmail": 1, "status": 1 })
db.preapprovals.createIndex({ "scheduledDate": 1, "status": 1 })
db.preapprovals.createIndex({ "status": 1, "createdAt": -1 })

// Search index
db.preapprovals.createIndex({
  "visitorName": "text",
  "visitorEmail": "text",
  "visitorCompany": "text",
  "purpose": "text"
})
```

### 4. AuditLogs Collection

```javascript
// Collection: auditlogs
{
  _id: ObjectId("507f1f77bcf86cd799439018"),
  
  // Event information
  eventType: "visitor_checked_in", // visitor_checked_in, visitor_approved, user_login, etc.
  eventCategory: "visitor_management", // visitor_management, user_management, system
  
  // Actor information
  actorId: ObjectId("507f1f77bcf86cd799439014"),
  actorType: "user", // user, system, api_key
  actorName: "Jane Manager",
  actorRole: "host",
  
  // Target information
  targetId: ObjectId("507f1f77bcf86cd799439011"),
  targetType: "visitor", // visitor, user, preapproval
  targetName: "John Doe",
  
  // Event details
  description: "Visitor John Doe checked in to visit Jane Manager",
  
  // Request context
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  sessionId: "sess_1234567890abcdef",
  
  // Data changes (for update events)
  changes: {
    before: { status: "pending" },
    after: { status: "approved", approvedAt: ISODate("2024-01-15T09:05:00.000Z") }
  },
  
  // Security classification
  severity: "info", // debug, info, warn, error, critical
  sensitive: false, // Flag for PII or sensitive operations
  
  // Compliance tags
  complianceTags: ["gdpr", "sox", "hipaa"],
  
  // Timestamp
  timestamp: ISODate("2024-01-15T09:05:00.000Z"),
  
  // Retention
  retentionDate: ISODate("2031-01-15T09:05:00.000Z") // 7 years for compliance
}
```

#### AuditLogs Collection Indexes

```javascript
// Time-based queries
db.auditlogs.createIndex({ "timestamp": -1 })
db.auditlogs.createIndex({ "eventType": 1, "timestamp": -1 })

// Actor-based queries
db.auditlogs.createIndex({ "actorId": 1, "timestamp": -1 })
db.auditlogs.createIndex({ "actorType": 1, "eventType": 1, "timestamp": -1 })

// Target-based queries
db.auditlogs.createIndex({ "targetId": 1, "timestamp": -1 })
db.auditlogs.createIndex({ "targetType": 1, "eventType": 1, "timestamp": -1 })

// Security and compliance
db.auditlogs.createIndex({ "severity": 1, "timestamp": -1 })
db.auditlogs.createIndex({ "sensitive": 1, "timestamp": -1 })
db.auditlogs.createIndex({ "complianceTags": 1, "timestamp": -1 })

// TTL index for retention
db.auditlogs.createIndex({ "retentionDate": 1 }, { 
  expireAfterSeconds: 0,
  name: "audit_retention_index"
})
```

## Advanced Query Patterns

### 1. Active Visitors Query
```javascript
// Find all currently active visitors
db.visitors.find({
  "checkIns": {
    $elemMatch: {
      "status": "approved",
      "checkOutTime": { $exists: false }
    }
  }
}, {
  "name": 1,
  "company": 1,
  "checkIns.$": 1 // Project only matching check-in
})
```

### 2. Host Dashboard Query
```javascript
// Get pending approvals for a specific host
db.visitors.aggregate([
  {
    $match: {
      "checkIns.hostId": ObjectId("507f1f77bcf86cd799439014"),
      "checkIns.status": "pending"
    }
  },
  {
    $unwind: "$checkIns"
  },
  {
    $match: {
      "checkIns.hostId": ObjectId("507f1f77bcf86cd799439014"),
      "checkIns.status": "pending"
    }
  },
  {
    $project: {
      "name": 1,
      "email": 1,
      "company": 1,
      "photoUrl": 1,
      "checkIn": "$checkIns"
    }
  },
  {
    $sort: { "checkIn.checkInTime": 1 }
  }
])
```

### 3. Visitor Statistics Query
```javascript
// Daily visitor statistics with company breakdown
db.visitors.aggregate([
  {
    $match: {
      "createdAt": {
        $gte: ISODate("2024-01-15T00:00:00.000Z"),
        $lt: ISODate("2024-01-16T00:00:00.000Z")
      }
    }
  },
  {
    $unwind: "$checkIns"
  },
  {
    $group: {
      _id: {
        company: "$company",
        status: "$checkIns.status"
      },
      count: { $sum: 1 },
      avgDuration: {
        $avg: {
          $cond: [
            { $and: [
              { $ne: ["$checkIns.checkOutTime", null] },
              { $ne: ["$checkIns.checkInTime", null] }
            ]},
            { $subtract: ["$checkIns.checkOutTime", "$checkIns.checkInTime"] },
            null
          ]
        }
      },
      visitors: { $addToSet: "$name" }
    }
  },
  {
    $project: {
      company: "$_id.company",
      status: "$_id.status",
      count: 1,
      avgDurationHours: {
        $cond: [
          { $ne: ["$avgDuration", null] },
          { $divide: ["$avgDuration", 1000 * 60 * 60] },
          null
        ]
      },
      uniqueVisitors: { $size: "$visitors" }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

### 4. Security Alert Query
```javascript
// Find visitors who have been in building for more than 8 hours
db.visitors.aggregate([
  {
    $unwind: "$checkIns"
  },
  {
    $match: {
      "checkIns.status": "approved",
      "checkIns.checkOutTime": { $exists: false },
      "checkIns.checkInTime": {
        $lt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      }
    }
  },
  {
    $project: {
      "name": 1,
      "company": 1,
      "checkIn": "$checkIns",
      "hoursInBuilding": {
        $divide: [
          { $subtract: [new Date(), "$checkIns.checkInTime"] },
          1000 * 60 * 60
        ]
      }
    }
  },
  {
    $sort: { "hoursInBuilding": -1 }
  }
])
```

## Data Validation

### Mongoose Schema Validation

```javascript
// visitors.model.js
const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hostName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'checked-out'],
    default: 'pending',
    index: true
  },
  checkInTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  checkOutTime: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > this.checkInTime;
      },
      message: 'Check-out time must be after check-in time'
    }
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  badgeNumber: {
    type: String,
    sparse: true,
    match: /^VMS\d{3,6}$/
  }
}, {
  timestamps: true
});

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^\+?[\d\s\-\(\)]+$/
  },
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },
  photoUrl: {
    type: String,
    match: /^https?:\/\/.+/
  },
  checkIns: [checkInSchema],
  totalVisits: {
    type: Number,
    default: 0,
    min: 0
  },
  consentGiven: {
    type: Boolean,
    default: false
  },
  dataRetentionDate: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  }
}, {
  timestamps: true,
  versionKey: 'version'
});

// Middleware to update totalVisits
visitorSchema.pre('save', function(next) {
  if (this.isModified('checkIns')) {
    this.totalVisits = this.checkIns.length;
  }
  next();
});

// Virtual for active check-ins
visitorSchema.virtual('activeCheckIns').get(function() {
  return this.checkIns.filter(checkIn => 
    checkIn.status === 'approved' && !checkIn.checkOutTime
  );
});

module.exports = mongoose.model('Visitor', visitorSchema);
```

## Performance Optimization

### 1. Connection Pooling
```javascript
// database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      
      // Replica set settings
      readPreference: 'secondaryPreferred', // Read from secondary when possible
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true, wtimeout: 1000 }
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

### 2. Query Optimization
```javascript
// Efficient pagination with cursor-based approach
const getVisitors = async (lastId, limit = 20) => {
  const query = lastId ? { _id: { $gt: lastId } } : {};
  
  return await Visitor
    .find(query)
    .select('name email company checkIns.status checkIns.checkInTime')
    .sort({ _id: 1 })
    .limit(limit)
    .lean(); // Return plain JavaScript objects for better performance
};

// Efficient aggregation with proper indexing
const getVisitorStatsByCompany = async (startDate, endDate) => {
  return await Visitor.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$company',
        totalVisitors: { $sum: 1 },
        approvedVisits: {
          $sum: {
            $size: {
              $filter: {
                input: '$checkIns',
                cond: { $eq: ['$$this.status', 'approved'] }
              }
            }
          }
        }
      }
    },
    {
      $sort: { totalVisitors: -1 }
    },
    {
      $limit: 10
    }
  ]).allowDiskUse(true); // Allow disk usage for large datasets
};
```

### 3. Bulk Operations
```javascript
// Efficient bulk updates for check-out operations
const bulkCheckOut = async (checkInIds) => {
  const bulkOps = checkInIds.map(id => ({
    updateOne: {
      filter: { 'checkIns._id': id },
      update: {
        $set: {
          'checkIns.$.status': 'checked-out',
          'checkIns.$.checkOutTime': new Date()
        }
      }
    }
  }));

  return await Visitor.bulkWrite(bulkOps, { ordered: false });
};
```

This comprehensive MongoDB schema design provides a solid foundation for the SecureVMS system, optimized for performance, scalability, and maintainability while ensuring data consistency and compliance requirements are met.