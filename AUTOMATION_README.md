# Carbo-Tracker Automation Guide

This document provides comprehensive instructions for using all automated features implemented in the Carbo-Tracker project.

## 🚀 Quick Start

### 1. Environment Setup
Ensure all required environment variables are configured:

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable

# AI Services
GOOGLE_AI_API_KEY=your_google_ai_key

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@carbo-tracker.com

# Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
FRONTEND_URL=https://your-domain.com
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Automated Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
The project includes a comprehensive CI/CD pipeline (`.github/workflows/ci.yml`) that:

- **Builds** the application on every push/PR
- **Tests** across multiple Node.js versions (18, 20)
- **Lints** code for quality
- **Scans** for security vulnerabilities
- **Deploys** to Vercel on main branch merges
- **Runs performance tests** using Lighthouse

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## ⏰ Scheduled Jobs

### Daily Emissions Aggregation (2:00 AM)
```bash
npm run automate:jobs
```
- Aggregates daily user emissions
- Generates AI insights for high emitters
- Updates daily summary statistics

### Weekly Leaderboard Updates (3:00 AM Mondays)
- Calculates weekly emission rankings
- Updates community leaderboards
- Sends achievement notifications

### Monthly Predictions Refresh (4:00 AM 1st of month)
- Refreshes AI predictions for all users
- Updates seasonal trend analysis
- Generates new carbon reduction goals

### News Feed Updates (Every 6 hours)
- Fetches latest climate news from RSS feeds
- Updates cached news articles
- Cleans old news items

## 🧹 Database Maintenance

### Automated Cleanup
```bash
npm run automate:cleanup
```
- Removes old news cache (30+ days)
- Cleans expired insights (90+ days)
- Archives old predictions (6+ months)
- Removes orphaned booking records
- Optimizes database indexes

### Manual Database Operations
```bash
# Health check
npm run monitor:health

# View cleanup reports
# Check MongoDB collection: cleanup_reports
```

## 📧 Notification System

### Automated Email Notifications
```bash
npm run automate:notifications
```

#### Daily Notifications
- Carbon milestone achievements
- Personalized reduction tips
- Streak maintenance reminders

#### Weekly Notifications
- Progress reports with AI insights
- Community ranking updates
- Weekly challenge summaries

#### Monthly Notifications
- Achievement unlocks
- Monthly carbon summaries
- Goal progress updates

### Email Templates
The system includes pre-built HTML email templates for:
- Milestone celebrations
- Weekly progress reports
- Achievement notifications
- Streak reminders
- Challenge updates

## 🔍 Health Monitoring

### Comprehensive Health Checks
```bash
npm run monitor:health
```

#### Services Monitored
- **Database**: Connection, collection counts, recent activity
- **API Endpoints**: Response times, error rates, availability
- **External Services**: Google AI, Clerk Auth, MongoDB Atlas
- **Performance**: User activity, system metrics, memory usage
- **Security**: Environment variables, data exposure, API security

#### Automated Alerts
- Critical system failures
- Performance degradation
- Security vulnerabilities
- High error rates

### Health Check Reports
Stored in MongoDB collection: `health_checks`
```javascript
{
  timestamp: "2024-01-15T10:00:00Z",
  services: {
    database: { status: "healthy", collections: {...} },
    api: { status: "healthy", endpoints: {...} },
    external: { status: "healthy", services: {...} }
  },
  metrics: {
    users: { total: 1250, active: 340 },
    emissions: { totalTracked: 45000 }
  },
  alerts: [
    { type: "performance", severity: "warning", message: "..." }
  ]
}
```

## 🧪 Testing Framework

### Unit Tests
```bash
npm test
```
- API route testing
- Component logic testing
- Utility function testing
- Error handling validation

### Integration Tests
```bash
npm run test:integration
```
- Database operations
- User workflow testing
- API integration
- Cross-service communication

### End-to-End Tests
```bash
npm run test:e2e
```
- Full user journey testing
- Browser automation with Playwright
- Multi-device testing (Chrome, Firefox, Safari, Mobile)

### Test Configuration
- **Jest**: Unit and integration testing
- **Playwright**: E2E browser testing
- **Testing Library**: React component testing
- **MongoDB Memory Server**: Isolated database testing

## 📊 Monitoring & Analytics

### Performance Metrics
- User activity rates
- API response times
- Error rates and types
- System resource usage

### Automated Reporting
- Daily health summaries
- Weekly performance reports
- Monthly analytics dashboards
- Security incident reports

### Alert System
- Email notifications for critical issues
- Slack/Discord integration (configurable)
- SMS alerts for urgent issues

## 🔧 Maintenance Scripts

### Available NPM Scripts
```json
{
  "automate:jobs": "node scripts/scheduled-jobs.js",
  "automate:cleanup": "node scripts/database-cleanup.js",
  "automate:notifications": "node scripts/send-notifications.js",
  "monitor:health": "node scripts/health-check.js",
  "test": "jest",
  "test:coverage": "jest --coverage",
  "test:integration": "jest --config jest.integration.config.js",
  "test:e2e": "playwright test"
}
```

### Cron Job Setup
For production deployment, set up these cron jobs:

```bash
# Daily jobs (2:00 AM)
0 2 * * * cd /path/to/project && npm run automate:jobs

# Weekly jobs (Mondays 3:00 AM)
0 3 * * 1 cd /path/to/project && npm run automate:notifications

# Monthly jobs (1st of month 4:00 AM)
0 4 1 * * cd /path/to/project && npm run monitor:health

# News updates (every 6 hours)
0 */6 * * * cd /path/to/project && npm run automate:jobs
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB connection
npm run monitor:health

# Verify environment variables
echo $MONGODB_URI
```

#### Email Delivery Problems
```bash
# Test SMTP configuration
node -e "const nodemailer = require('nodemailer'); /* test code */"

# Check email logs
tail -f /var/log/mail.log
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Debug specific test
npm test -- --testNamePattern="specific test name"
```

#### CI/CD Pipeline Issues
```bash
# Check GitHub Actions logs
# Verify Vercel deployment settings
# Confirm environment variables in CI
```

### Performance Optimization

#### Database Optimization
- Regular index maintenance
- Query optimization
- Connection pooling
- Data archiving strategies

#### API Optimization
- Response caching
- Rate limiting
- Load balancing
- CDN integration

#### Monitoring Optimization
- Alert threshold tuning
- Log rotation
- Metrics aggregation
- Dashboard customization

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- Redis caching layer
- Microservices architecture

### Vertical Scaling
- Server resource monitoring
- Auto-scaling policies
- Database performance tuning
- CDN optimization

### Cost Optimization
- Resource usage monitoring
- Automated shutdown policies
- Storage optimization
- Third-party service usage tracking

## 🔐 Security Best Practices

### Environment Security
- Encrypted environment variables
- Secret rotation policies
- Access control lists
- Audit logging

### Data Security
- Data encryption at rest
- Secure API endpoints
- Input validation
- SQL injection prevention

### Network Security
- HTTPS enforcement
- CORS configuration
- Rate limiting
- DDoS protection

---

## 🎯 Next Steps

1. **Configure Environment Variables**: Set up all required environment variables
2. **Test Automation**: Run the complete test suite
3. **Deploy to Production**: Set up CI/CD pipeline
4. **Configure Cron Jobs**: Schedule automated tasks
5. **Monitor Performance**: Set up monitoring dashboards
6. **Scale as Needed**: Implement scaling strategies based on usage

For additional support or questions, refer to the project documentation or create an issue in the repository.
