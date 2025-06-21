# SecureVMS - Visitor Management System

A comprehensive Visitor Management System built with React, TypeScript, and MongoDB, designed for enterprise security and operational excellence.

## 🏢 Executive Summary

SecureVMS is a visitor management solution that streamlines visitor check-in processes while maintaining strict security protocols. The system uses MongoDB for flexible data modeling with embedded documents, supporting complex visitor workflows and real-time operational insights.

### Key Benefits:
- **Enhanced Security**: Multi-role authentication with RBAC
- **Operational Efficiency**: Streamlined check-in/check-out processes
- **Real-time Insights**: Comprehensive analytics and reporting
- **Scalable Architecture**: MongoDB-powered flexible data storage

## 🏗️ High-Level Architecture

### Microservices Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │ Visitor Service │    │  Host Service   │
│   (JWT + RBAC)  │    │  (CRUD + Photo) │    │ (Notifications) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────┐
         │              API Gateway (Express/NestJS)           │
         └─────────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────┐
         │                React Frontend                       │
         └─────────────────────────────────────────────────────┘

Data Layer:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   MongoDB   │    │    Redis    │    │  RabbitMQ   │
│ (Primary DB)│    │   (Cache)   │    │ (Events)    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas)
- **Cache**: Redis for session and hot lookups
- **Queue**: RabbitMQ for async notifications
- **Monitoring**: Prometheus + Grafana + ELK stack

## 👥 User Roles & Workflows

### 1. Security Guard
**Authentication**: JWT-based with 'security' role
**Key Workflows**:
- Monitor all visitor check-ins/check-outs
- Approve/deny visitor requests
- Issue digital badges with QR codes
- View real-time security alerts

### 2. Employee/Host
**Authentication**: JWT-based with 'host' role
**Key Workflows**:
- Receive visitor notifications (email/SMS)
- Approve/deny visitor requests for their meetings
- Create pre-approvals for scheduled visits
- Track their active visitors

### 3. Admin
**Authentication**: JWT-based with 'admin' role
**Key Workflows**:
- System-wide analytics and reporting
- User management and role assignment
- Security monitoring and alert management
- Export compliance reports

## 🗄️ MongoDB Data Modeling

### Core Collections

#### Visitors Collection
```javascript
const VisitorSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  company: { type: String, required: true, index: true },
  photoUrl: String,
  checkIns: [{
    hostId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    hostName: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'denied', 'checked-out'],
      default: 'pending',
      index: true
    },
    checkInTime: { type: Date, default: Date.now, index: true },
    checkOutTime: Date,
    purpose: { type: String, required: true },
    badgeNumber: String,
    qrCode: String
  }],
  createdAt: { type: Date, default: Date.now, index: true }
});

// Compound indexes for performance
VisitorSchema.index({ 'checkIns.status': 1, 'checkIns.checkInTime': -1 });
VisitorSchema.index({ company: 1, createdAt: -1 });
```

#### Users Collection
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['security', 'host', 'admin'],
    required: true,
    index: true
  },
  department: String,
  isActive: { type: Boolean, default: true, index: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});
```

#### PreApprovals Collection
```javascript
const PreApprovalSchema = new mongoose.Schema({
  visitorName: { type: String, required: true, index: true },
  visitorEmail: { type: String, required: true, index: true },
  visitorPhone: { type: String, required: true },
  visitorCompany: { type: String, required: true },
  hostId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, index: true },
  hostName: { type: String, required: true },
  scheduledDate: { type: Date, required: true, index: true },
  purpose: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'used', 'expired'],
    default: 'active',
    index: true
  },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

// TTL index for automatic expiry
PreApprovalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Sample Aggregation Pipeline
```javascript
// Get visitor statistics by company for last 30 days
const companyStats = await Visitor.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: '$company',
      totalVisits: { $sum: 1 },
      avgVisitDuration: { 
        $avg: {
          $subtract: ['$checkIns.checkOutTime', '$checkIns.checkInTime']
        }
      },
      activeVisitors: {
        $sum: {
          $cond: [
            { $eq: ['$checkIns.status', 'approved'] },
            1,
            0
          ]
        }
      }
    }
  },
  { $sort: { totalVisits: -1 } },
  { $limit: 10 }
]);
```

## 📁 Code Organization

```
securevms/
├── src/
│   ├── components/
│   ├── pages/
│   ├── contexts/
└── Dockerfile
├── infrastructure/
│   ├── k8s/
│   ├── helm/
│   ├── terraform/
│   └── docker-compose.yml
├── docs/
│   ├── api/
│   ├── deployment/
│   └── architecture/
└── tests/
    ├── e2e/
    ├── load/
    └── unit/
```

## 🔐 Security & Compliance

### Authentication & Authorization
- JWT tokens with 15-minute expiry + refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints

### Data Protection
- Photo storage with signed URLs (S3 or equivalent)
- PII encryption at rest
- Audit logs for all visitor interactions
- GDPR compliance with data retention policies

### Network Security
- HTTPS/TLS 1.3 only
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (NoSQL injection for MongoDB)

## 📊 Monitoring & Observability

### Metrics (Prometheus)
```javascript
// Custom metrics in each service
const promClient = require('prom-client');

const visitorCheckIns = new promClient.Counter({
  name: 'visitor_checkins_total',
  help: 'Total number of visitor check-ins',
  labelNames: ['status', 'department']
});

const visitDuration = new promClient.Histogram({
  name: 'visit_duration_seconds',
  help: 'Duration of visitor stays',
  labelNames: ['company', 'host_department']
});
```

### Logging (ELK Stack)
```javascript
// Structured logging with Winston
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'visitor-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Visitor check-in event
logger.info('Visitor checked in', {
  visitorId: visitor._id,
  hostId: checkIn.hostId,
  company: visitor.company,
  timestamp: new Date().toISOString()
});
```

## 🚢 Deployment

### Docker Configuration
```dockerfile
# Visitor Service Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3001
CMD ["node", "src/server.js"]
```

### Kubernetes StatefulSet for MongoDB
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  serviceName: mongodb
  replicas: 3
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6.0
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongodb-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

### Helm Chart Values
```yaml
# values.yaml
replicaCount: 3

image:
  repository: securevms/api-gateway
  tag: "1.0.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: vms.company.com
      paths: ["/"]
  tls:
    - secretName: vms-tls
      hosts: ["vms.company.com"]

mongodb:
  auth:
    enabled: true
    rootPassword: "secure-root-password"
  replicaSet:
    enabled: true
    replicas:
      secondary: 2
```

## 🧪 Testing Strategy

### Unit Tests (Jest)
```javascript
// visitor.test.js
describe('Visitor Service', () => {
  beforeEach(async () => {
    await Visitor.deleteMany({});
  });

  test('should create visitor with check-in', async () => {
    const visitorData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Test Corp'
    };

    const visitor = await createVisitor(visitorData);
    
    expect(visitor.name).toBe('John Doe');
    expect(visitor.checkIns).toHaveLength(1);
    expect(visitor.checkIns[0].status).toBe('pending');
  });
});
```

### E2E Tests (Cypress)
```javascript
// visitor-checkin.cy.js
describe('Visitor Check-in Flow', () => {
  it('should complete full check-in process', () => {
    cy.visit('/checkin');
    
    cy.get('[data-cy=visitor-name]').type('Jane Smith');
    cy.get('[data-cy=visitor-email]').type('jane@example.com');
    cy.get('[data-cy=visitor-company]').type('Example Corp');
    cy.get('[data-cy=host-select]').select('John Doe');
    cy.get('[data-cy=purpose]').type('Business meeting');
    
    cy.get('[data-cy=submit-checkin]').click();
    
    cy.contains('Check-in Complete!').should('be.visible');
    cy.contains('Your host has been notified').should('be.visible');
  });
});
```

### Load Testing (k6)
```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '5m',
};

export default function() {
  let payload = JSON.stringify({
    name: 'Load Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    company: 'Load Test Corp',
    hostId: '507f1f77bcf86cd799439011',
    purpose: 'Load testing'
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + __ENV.JWT_TOKEN
    },
  };

  let response = http.post('http://api.vms.local/visitors', payload, params);
  
  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## 🔧 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Redis 6.2+
- Docker & Docker Compose

### Quick Start
```bash
# Clone the repository
git clone https://github.com/company/securevms.git
cd securevms

# Start with Docker Compose
docker-compose up -d

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
```bash
# .env.example
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
MONGODB_URI=mongodb://localhost:27017/securevms
REDIS_URL=redis://localhost:6379
AWS_S3_BUCKET=vms-photos
SMTP_HOST=smtp.company.com
SMTP_USER=noreply@company.com
SMTP_PASS=smtp-password
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
```

## 📈 Performance Benchmarks

### Expected Performance
- **Check-in Processing**: < 500ms (95th percentile)
- **Photo Upload**: < 2s for 2MB images
- **Dashboard Load**: < 300ms
- **Concurrent Users**: 1000+ simultaneous check-ins
- **Database Queries**: < 100ms average response time

### Optimization Strategies
- MongoDB read replicas for analytics queries
- Redis caching for frequent lookups (host lists, company data)
- CDN for photo delivery
- Connection pooling for database connections
- Horizontal scaling with load balancers

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/visitor-badges`)
3. Commit changes (`git commit -am 'Add badge generation'`)
4. Push to branch (`git push origin feature/visitor-badges`)
5. Create Pull Request

### Code Standards
- ESLint + Prettier for code formatting
- Jest for unit testing (90%+ coverage required)
- TypeScript for type safety
- Conventional Commits for commit messages

Built with ❤️ for enterprise security and operational excellence.
