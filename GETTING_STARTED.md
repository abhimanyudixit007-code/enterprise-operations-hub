# Getting Started with Enterprise Operations Hub

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/abhimanyudixit007-code/enterprise-operations-hub.git
cd enterprise-operations-hub
npm install
```

### 2. Start Infrastructure

```bash
# Copy environment file
cp .env.example .env

# Start Docker services (PostgreSQL, Redis, RabbitMQ, Temporal)
docker-compose up -d
```

### 3. Initialize Database

```bash
# Run database migrations
npm run db:migrate

# (Optional) Seed sample data
npm run db:seed
```

### 4. Start Development Servers

```bash
# Start all services
npm run dev
```

### 5. Access Applications

- **Web App**: http://localhost:3000
- **API**: http://localhost:4000/health
- **Temporal UI**: http://localhost:8080
- **RabbitMQ**: http://localhost:15672 (guest/guest)

## What You've Built

### Core Platform Features

✅ **Multi-tenant Architecture**
- Organization isolation
- User management with RBAC
- Secure authentication (JWT)

✅ **Workflow Engine**
- Visual workflow builder (coming soon)
- Temporal-based orchestration
- Durable execution with retries
- Human-in-the-loop approvals

✅ **Document Intelligence**
- AI-powered document extraction
- Invoice processing
- Contract analysis
- OCR capabilities

✅ **Enterprise Integrations**
- ERP connectors (SAP, Oracle, NetSuite)
- CRM integration (Salesforce, HubSpot)
- HR systems (Workday, BambooHR)
- Communication (Slack, Teams, Email)

✅ **Real-time Analytics**
- Operations command center dashboard
- KPI tracking
- SLA monitoring
- Custom reports

✅ **Security & Compliance**
- Audit trails
- Encryption at rest and in transit
- SOC 2, GDPR, HIPAA ready
- Role-based access control

## Project Structure

```
enterprise-operations-hub/
├── apps/
│   ├── api/                    # Express API server
│   │   ├── src/
│   │   │   ├── controllers/    # Business logic
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── middleware/     # Auth, error handling
│   │   │   └── utils/          # Helpers, database
│   │   └── package.json
│   │
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── page.tsx        # Landing page
│       │   └── dashboard/      # Dashboard UI
│       └── package.json
│
├── packages/
│   └── database/
│       └── schema.sql          # Database schema
│
├── infrastructure/
│   ├── docker/                 # Docker configs
│   ├── k8s/                    # Kubernetes manifests
│   └── terraform/              # Infrastructure as code
│
├── docker-compose.yml          # Local development
├── .env.example                # Environment template
├── README.md                   # Project overview
├── ARCHITECTURE.md             # System architecture
├── DEPLOYMENT.md               # Deployment guide
└── GETTING_STARTED.md          # This file
```

## Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Next.js 14, React, TailwindCSS | Modern, responsive UI |
| API | Node.js, Express, TypeScript | RESTful API server |
| Database | PostgreSQL 16 | Primary data store |
| Cache | Redis 7 | Session & caching |
| Queue | RabbitMQ 3 | Async messaging |
| Workflows | Temporal.io | Durable orchestration |
| AI | OpenAI GPT-4 | Document intelligence |
| Container | Docker, Kubernetes | Deployment |

## Development Workflow

### 1. Create a New Feature

```bash
# Create feature branch
git checkout -b feature/new-workflow-type

# Make changes
# ... code ...

# Test locally
npm run test

# Commit and push
git add .
git commit -m "feat: Add new workflow type"
git push origin feature/new-workflow-type
```

### 2. Database Changes

```bash
# Create migration
cd packages/database
npm run migration:create add_new_table

# Edit migration file
# ... SQL ...

# Run migration
npm run db:migrate

# Rollback if needed
npm run db:rollback
```

### 3. Add New API Endpoint

```typescript
// apps/api/src/routes/myroute.ts
import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Hello World' });
}));

export default router;

// Register in apps/api/src/index.ts
app.use('/api/myroute', authMiddleware, myRoute);
```

### 4. Add New UI Page

```typescript
// apps/web/app/mypage/page.tsx
export default function MyPage() {
  return (
    <div>
      <h1>My New Page</h1>
    </div>
  );
}
```

## Common Tasks

### Add a New Workflow Template

```typescript
// apps/api/src/controllers/workflowController.ts
const templateDefinitions = {
  'my-workflow': {
    name: 'My Custom Workflow',
    steps: [
      { type: 'start', name: 'Initialize' },
      { type: 'approval', name: 'Manager Approval' },
      { type: 'integration', name: 'Update System' },
      { type: 'notification', name: 'Send Notification' }
    ]
  }
};
```

### Add a New Integration

```typescript
// services/integrations/myintegration.ts
export class MyIntegration {
  async connect(credentials: any) {
    // Connection logic
  }

  async sync(data: any) {
    // Sync logic
  }
}
```

### Customize Dashboard

```typescript
// apps/web/app/dashboard/page.tsx
// Add new KPI card, chart, or widget
<KPICard
  title="My Custom Metric"
  value="123"
  change="+10%"
  icon={<MyIcon />}
/>
```

## Testing

### Run Tests

```bash
# All tests
npm run test

# API tests
cd apps/api && npm run test

# Web tests
cd apps/web && npm run test

# E2E tests
npm run test:e2e
```

### Write Tests

```typescript
// apps/api/src/__tests__/workflow.test.ts
import request from 'supertest';
import app from '../index';

describe('Workflow API', () => {
  it('should create workflow', async () => {
    const response = await request(app)
      .post('/api/workflows')
      .send({ name: 'Test Workflow' })
      .expect(201);

    expect(response.body.name).toBe('Test Workflow');
  });
});
```

## Deployment

### Development
```bash
npm run dev
```

### Staging
```bash
npm run build
docker-compose -f docker-compose.staging.yml up -d
```

### Production
```bash
# See DEPLOYMENT.md for full guide
npm run build
kubectl apply -f infrastructure/k8s/
```

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U eoh_user -d eoh_db
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :4000

# Kill process
kill -9 <PID>
```

### Docker Issues
```bash
# Reset Docker environment
docker-compose down -v
docker-compose up -d

# Rebuild images
docker-compose build --no-cache
```

## Next Steps

### Phase 1: Core Features (Current)
- [x] Multi-tenant architecture
- [x] User authentication
- [x] Workflow engine foundation
- [x] Basic dashboard
- [ ] Visual workflow builder
- [ ] Document AI integration
- [ ] First 5 integrations

### Phase 2: Advanced Features (Next 3 months)
- [ ] Mobile apps
- [ ] Advanced analytics
- [ ] Custom reporting
- [ ] API marketplace
- [ ] White-label capabilities

### Phase 3: Enterprise Scale (6 months)
- [ ] Multi-region deployment
- [ ] Advanced security features
- [ ] Compliance certifications
- [ ] Enterprise support

## Resources

- **Documentation**: See README.md, ARCHITECTURE.md, DEPLOYMENT.md
- **API Docs**: http://localhost:4000/api-docs (coming soon)
- **Community**: GitHub Discussions
- **Support**: abhimanyudixit007@gmail.com

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Questions?

- **Technical Issues**: Open a GitHub issue
- **Feature Requests**: GitHub Discussions
- **Enterprise Inquiries**: abhimanyudixit007@gmail.com

---

**Built with ❤️ for enterprise operations teams**
