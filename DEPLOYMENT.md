# Deployment Guide - Enterprise Operations Hub

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ and npm 9+
- PostgreSQL 16
- Redis 7
- RabbitMQ 3
- Kubernetes cluster (for production)
- Terraform (for infrastructure)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/abhimanyudixit007-code/enterprise-operations-hub.git
cd enterprise-operations-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Infrastructure Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- RabbitMQ (port 5672, management UI on 15672)
- Temporal (port 7233, UI on 8080)

### 5. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 6. Start Development Servers

```bash
# Start all services
npm run dev

# Or start individually:
cd apps/api && npm run dev      # API on port 4000
cd apps/web && npm run dev      # Web on port 3000
```

### 7. Access Applications

- **Web App**: http://localhost:3000
- **API**: http://localhost:4000
- **Temporal UI**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## Production Deployment

### Option 1: Kubernetes (Recommended)

#### 1. Build Docker Images

```bash
# Build API image
docker build -t eoh-api:latest -f apps/api/Dockerfile .

# Build Web image
docker build -t eoh-web:latest -f apps/web/Dockerfile .

# Push to registry
docker tag eoh-api:latest your-registry/eoh-api:latest
docker push your-registry/eoh-api:latest

docker tag eoh-web:latest your-registry/eoh-web:latest
docker push your-registry/eoh-web:latest
```

#### 2. Configure Kubernetes

```bash
cd infrastructure/k8s

# Update image references in deployments
# Edit api-deployment.yaml and web-deployment.yaml

# Create namespace
kubectl create namespace eoh-production

# Create secrets
kubectl create secret generic eoh-secrets \
  --from-env-file=../../.env.production \
  -n eoh-production

# Apply configurations
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f rabbitmq-deployment.yaml
kubectl apply -f api-deployment.yaml
kubectl apply -f web-deployment.yaml
kubectl apply -f ingress.yaml
```

#### 3. Verify Deployment

```bash
kubectl get pods -n eoh-production
kubectl get services -n eoh-production
kubectl logs -f deployment/eoh-api -n eoh-production
```

### Option 2: AWS ECS/Fargate

#### 1. Infrastructure Setup with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="production.tfvars"

# Apply infrastructure
terraform apply -var-file="production.tfvars"
```

This creates:
- VPC with public/private subnets
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- Amazon MQ (RabbitMQ)
- ECS cluster with Fargate
- Application Load Balancer
- CloudWatch logs and metrics
- S3 bucket for documents

#### 2. Deploy Application

```bash
# Build and push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t eoh-api:latest -f apps/api/Dockerfile .
docker tag eoh-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/eoh-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/eoh-api:latest

docker build -t eoh-web:latest -f apps/web/Dockerfile .
docker tag eoh-web:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/eoh-web:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/eoh-web:latest

# Update ECS services
aws ecs update-service --cluster eoh-production --service eoh-api --force-new-deployment
aws ecs update-service --cluster eoh-production --service eoh-web --force-new-deployment
```

### Option 3: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml eoh

# Check services
docker service ls
docker service logs eoh_api
```

## Database Migrations

### Running Migrations

```bash
# Development
npm run db:migrate

# Production (with backup)
npm run db:backup
npm run db:migrate:production
```

### Rollback Migration

```bash
npm run db:rollback
```

## Monitoring Setup

### 1. Prometheus

```bash
cd infrastructure/monitoring

# Deploy Prometheus
kubectl apply -f prometheus-config.yaml
kubectl apply -f prometheus-deployment.yaml
```

### 2. Grafana

```bash
# Deploy Grafana
kubectl apply -f grafana-deployment.yaml

# Import dashboards
# Access Grafana UI and import dashboards from infrastructure/monitoring/dashboards/
```

### 3. ELK Stack

```bash
# Deploy Elasticsearch
kubectl apply -f elasticsearch-deployment.yaml

# Deploy Logstash
kubectl apply -f logstash-deployment.yaml

# Deploy Kibana
kubectl apply -f kibana-deployment.yaml
```

## SSL/TLS Configuration

### Using Let's Encrypt with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f infrastructure/k8s/cert-issuer.yaml

# Certificates will be automatically provisioned via Ingress annotations
```

## Backup & Restore

### Database Backup

```bash
# Automated daily backups (configured in cron)
0 2 * * * /scripts/backup-database.sh

# Manual backup
pg_dump -h localhost -U eoh_user eoh_db > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U eoh_user eoh_db < backup_20240101.sql
```

### Document Storage Backup

```bash
# S3 cross-region replication (configured in Terraform)
# Or manual sync
aws s3 sync s3://eoh-documents s3://eoh-documents-backup --region us-west-2
```

## Scaling

### Horizontal Pod Autoscaling (HPA)

```bash
# API autoscaling
kubectl autoscale deployment eoh-api \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n eoh-production

# Web autoscaling
kubectl autoscale deployment eoh-web \
  --cpu-percent=70 \
  --min=2 \
  --max=8 \
  -n eoh-production
```

### Database Scaling

```bash
# Add read replicas
# Update RDS instance to enable read replicas
# Configure connection pooling to route read queries to replicas
```

## Health Checks

### API Health Endpoint

```bash
curl http://api.eoh.com/health

# Response:
{
  "status": "healthy",
  "timestamp": "2024-12-06T00:00:00.000Z",
  "uptime": 86400,
  "environment": "production"
}
```

### Kubernetes Liveness/Readiness Probes

Already configured in deployment manifests:
- Liveness: `/health`
- Readiness: `/health/ready`

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U eoh_user -d eoh_db

# Check logs
docker logs eoh-postgres
```

#### 2. Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Check Redis logs
docker logs eoh-redis
```

#### 3. Temporal Workflow Failures

```bash
# Access Temporal UI
open http://localhost:8080

# Check workflow history
# Review error messages in UI
```

#### 4. High Memory Usage

```bash
# Check container stats
docker stats

# Kubernetes pod resources
kubectl top pods -n eoh-production

# Adjust resource limits in deployment manifests
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up VPN for database access
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable DDoS protection
- [ ] Regular security updates
- [ ] Penetration testing

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_workflows_org_active ON workflows(organization_id, is_active);
CREATE INDEX idx_executions_status_created ON workflow_executions(status, created_at);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM workflows WHERE organization_id = 'xxx';
```

### Caching Strategy

```javascript
// Cache frequently accessed data
// - User sessions (Redis)
// - Workflow definitions (Redis)
// - Organization settings (Redis)
// - API responses (Redis with TTL)
```

### CDN Configuration

```bash
# Configure CloudFront for static assets
# Cache Next.js static files
# Set appropriate cache headers
```

## Maintenance Windows

### Recommended Schedule

- **Database maintenance**: Sunday 2:00 AM - 4:00 AM UTC
- **Application updates**: Saturday 10:00 PM - 11:00 PM UTC
- **Security patches**: As needed (emergency maintenance)

### Maintenance Procedure

1. Notify users 48 hours in advance
2. Enable maintenance mode
3. Backup database
4. Apply updates
5. Run smoke tests
6. Disable maintenance mode
7. Monitor for issues

## Support & Monitoring

### 24/7 Monitoring

- Uptime monitoring (UptimeRobot)
- Error tracking (Sentry)
- Performance monitoring (New Relic/Datadog)
- Log aggregation (ELK Stack)

### Alerting Channels

- PagerDuty for critical alerts
- Slack for warnings
- Email for daily reports

## Cost Optimization

### AWS Cost Reduction

- Use Reserved Instances for predictable workloads
- Enable auto-scaling to match demand
- Use S3 lifecycle policies for old documents
- Implement CloudWatch alarms for cost anomalies
- Regular review of unused resources

### Resource Limits

```yaml
# Kubernetes resource limits
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Compliance & Auditing

### Audit Log Retention

- Application logs: 90 days
- Database audit logs: 1 year
- Access logs: 1 year
- Security logs: 2 years

### Compliance Reports

```bash
# Generate compliance report
npm run compliance:report

# Export audit logs
npm run audit:export --start-date=2024-01-01 --end-date=2024-12-31
```
