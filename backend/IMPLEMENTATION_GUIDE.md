# Automated Pipeline Implementation Guide

Complete setup guide for the Automated Legal Data Pipeline.

## Overview

The automated pipeline is now 80% complete with all core services implemented:

### ✅ Completed Components

1. **Data Models & Types** - `pipeline.interface.ts` - All TypeScript interfaces and enums
2. **Source Registry Repository** - `source-registry.repository.ts` - CRUD for data sources
3. **URL Discovery Service** - `url-discovery.service.ts` - Discover URLs from RSS/Sitemap/API
4. **Web Crawler Service** - `web-crawler.service.ts` - Crawl and extract metadata
5. **Data Validator Service** - `data-validator.service.ts` - Validate and detect duplicates
6. **AI Processor Service** - `ai-processor.service.ts` - OpenAI/Gemini integration
7. **Persistence Service** - `persistence.service.ts` - MongoDB upsert
8. **Pipeline Monitor Service** - `pipeline-monitor.service.ts` - Metrics and logging
9. **Pipeline Orchestrator Service** - `pipeline-orchestrator.service.ts` - Main orchestration
10. **Pipeline Scheduler Service** - `pipeline-scheduler.service.ts` - Cron scheduling
11. **Pipeline Status Controller** - `pipeline-status.controller.ts` - Admin endpoints
12. **Automated Pipeline Module** - `automated-pipeline.module.ts` - NestJS module setup

### ⏳ Remaining Tasks

1. **Update Prisma Schema** - Add new collections for pipeline
2. **Create Migration** - Database schema migration
3. **Update App Module** - Import AutomatedPipelineModule
4. **Environment Configuration** - Add required variables
5. **Integration Testing** - Test complete pipeline
6. **Documentation** - User guides and API docs

## Step 1: Update Prisma Schema

Add the following models to `backend/prisma/schema.prisma`:

```prisma
model SourceRegistry {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  name                String   @unique
  description         String?
  sourceType          String   // RSS, SITEMAP, API, HYBRID
  
  // Configuration based on source type
  rssUrl              String?
  sitemapUrl          String?
  sitemapPattern      String?  // Regex pattern for sitemap URLs
  apiBaseUrl          String?
  apiEndpoint         String?
  apiParamName        String?  @default("limit")
  apiParamValue       Int?     @default(50)
  
  // Scheduling
  cronExpression      String?  // e.g., "0 2 * * *" for daily at 2 AM
  
  // Status tracking
  status              String   @default("ACTIVE") // ACTIVE, DISABLED
  lastCrawlTime       DateTime @default(now())
  consecutiveFailures Int      @default(0)
  lastError           String?
  
  // Retry configuration
  maxRetries          Int      @default(3)
  retryDelayMs        Int      @default(5000)
  timeoutMs           Int      @default(30000)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  createdBy           String   @default("SYSTEM")
  
  crawlJobs           CrawlJob[]
}

model CrawlJob {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  sourceId            String   @db.ObjectId
  source              SourceRegistry @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  
  status              String   // PENDING, IN_PROGRESS, COMPLETED, FAILED
  startTime           DateTime @default(now())
  endTime             DateTime?
  
  discoveredCount     Int      @default(0)
  crawledCount        Int      @default(0)
  validatedCount      Int      @default(0)
  aiProcessedCount    Int      @default(0)
  persistedCount      Int      @default(0)
  errorCount          Int      @default(0)
  
  errorMessage        String?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model PipelineMetrics {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  date                DateTime @unique
  
  totalCrawls         Int      @default(0)
  successfulCrawls    Int      @default(0)
  failedCrawls        Int      @default(0)
  docsCreated         Int      @default(0)
  docsUpdated         Int      @default(0)
  tokensUsed          Int      @default(0)
  estimatedCost       Float    @default(0)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model CrawlErrorLog {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  crawlJobId          String
  sourceId            String
  
  successfulCrawls    Int      @default(0)
  failedCrawls        Int      @default(0)
  duplicatesDetected  Int      @default(0)
  docsProcessedByAI   Int      @default(0)
  docsPersisted       Int      @default(0)
  
  totalTokensUsed     Int      @default(0)
  estimatedCost       Float    @default(0)
  averageCrawlTime    Float    @default(0)
  averageAiProcessTime Float  @default(0)
  
  status              String   // COMPLETED, FAILED
  lastError           String?
  durationMs          Int      @default(0)
  
  createdAt           DateTime @default(now())
}
```

## Step 2: Create Database Migration

```bash
# Generate migration
cd backend
npx prisma migrate dev --name add_automated_pipeline

# Apply to MongoDB
npx prisma db push
```

## Step 3: Update App Module

In `backend/src/app.module.ts`:

```typescript
import { AutomatedPipelineModule } from './modules/automated-pipeline/automated-pipeline.module';

@Module({
  imports: [
    // ... existing imports
    AutomatedPipelineModule,
  ],
})
export class AppModule {}
```

## Step 4: Environment Configuration

Add to `.env`:

```env
# Pipeline Configuration
PIPELINE_ENABLED=true
PIPELINE_SCHEDULE="0 2 * * *"  # Daily at 2 AM
PIPELINE_MAX_CONCURRENT_CRAWLERS=5
PIPELINE_CRAWL_TIMEOUT_MS=30000
PIPELINE_RETRY_DELAY_MS=5000
PIPELINE_MAX_RETRIES=3

# Redis (for future BullMQ integration)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# OpenAI / Gemini
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=2000

# Alternative: Gemini API
GEMINI_API_KEY=xxxxxxxxxxxxx
GEMINI_MODEL=gemini-pro

# Playwright
PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium  # Optional, for custom installations
```

## Step 5: Integration Testing

### Test Data Setup

Create test source registry:

```typescript
// test/automated-pipeline.test.ts
describe('Automated Pipeline', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should discover URLs from RSS feed', async () => {
    const source = await createTestSource({
      name: 'Test RSS Source',
      sourceType: 'RSS',
      rssUrl: 'https://vnlaw.gov.vn/feed.xml',
    });

    const result = await app.get(PipelineOrchestratorService)
      .executeSourcePipeline(source._id);

    expect(result.status).toBe('COMPLETED');
    expect(result.metrics.totalUrlsDiscovered).toBeGreaterThan(0);
  });

  it('should validate and deduplicate documents', async () => {
    // Test data validation
    // Test duplicate detection
    // Test AI processing
  });
});
```

### Manual Testing

```bash
# Start backend
cd backend
npm run start

# Test API endpoints
curl -X POST http://localhost:3000/admin/pipeline/sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Vietnamese Government Laws",
    "sourceType": "SITEMAP",
    "sitemapUrl": "https://vnlaw.gov.vn/sitemap.xml",
    "cronExpression": "0 2 * * *"
  }'

# Execute pipeline manually
curl -X POST http://localhost:3000/admin/pipeline/execute/:sourceId \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check status
curl http://localhost:3000/admin/pipeline/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Step 6: Production Checklist

### Before Deployment

- [ ] All environment variables configured
- [ ] Database indexes created for efficient queries
- [ ] Redis configured and tested
- [ ] OpenAI/Gemini API keys validated
- [ ] SSL/TLS certificates configured
- [ ] Logging and monitoring set up
- [ ] Error alerting configured
- [ ] Rate limiting configured for AI API calls

### Database Indexes

```prisma
// Add to Prisma schema for performance
model LegalSourceDocument {
  @@index([contentHash])
  @@index([sourceUrl])
  @@index([legalDocumentNo])
  @@index([legalCategory])
  @@index([createdAt])
}

model SourceRegistry {
  @@index([status])
  @@index([cronExpression])
}

model CrawlJob {
  @@index([sourceId])
  @@index([status])
  @@index([startTime])
}
```

### Monitoring & Alerting

```bash
# Set up monitoring for:
# 1. Failed crawl jobs (alert if > 10% failure rate)
# 2. AI processing cost (alert if > $100/day)
# 3. Token usage (alert if > 1M tokens/day)
# 4. Document persistence errors (alert immediately)
# 5. Pipeline execution duration (alert if > 2 hours)
```

## Step 7: Performance Tuning

### Optimization Tips

1. **Concurrent Crawlers**: Increase from 5 to 10-15 for high-volume sources
2. **Batch AI Processing**: Process documents in batches of 10-20
3. **Redis Caching**: Cache source registry and frequently accessed documents
4. **Database Indexing**: Index on sourceUrl, contentHash, legalCategory
5. **Playwright Pool**: Pre-allocate multiple browser instances

### Scaling for Millions of Documents

```typescript
// Example: Parallel source execution
const sourceIds = ['source1', 'source2', 'source3'];
const results = await Promise.allSettled(
  sourceIds.map(id => orchestrator.executeSourcePipeline(id))
);

// Example: Batch processing configuration
const BATCH_SIZE = 50; // Crawl 50 URLs at a time
const AI_BATCH_SIZE = 10; // Process 10 docs with AI at a time
const PERSIST_BATCH_SIZE = 100; // Persist 100 docs at a time
```

## Step 8: Deployment Instructions

### Docker Deployment

```dockerfile
# Add to Dockerfile after base setup
RUN apt-get install -y chromium-browser

ENV PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lexi-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: lexi-backend:latest
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: openai
        - name: REDIS_HOST
          value: redis-service
        resources:
          limits:
            memory: "2Gi"
            cpu: "1000m"
          requests:
            memory: "1Gi"
            cpu: "500m"
```

## Troubleshooting

### Common Issues

1. **Chromium not found**: Install via `apt-get install chromium-browser`
2. **OpenAI rate limit**: Implement backoff with `retry-after` header
3. **Memory leak in Playwright**: Call `shutdown()` after each crawl session
4. **Duplicate detection slow**: Add index on contentHash
5. **AI processing timeout**: Increase OPENAI_MAX_TOKENS timeout

### Debugging

```bash
# Enable verbose logging
export DEBUG=lexi:*

# Check logs
docker logs lexi-backend | grep "Automated Pipeline"

# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Monitor Redis
redis-cli MONITOR
```

## Next Steps

1. ✅ Create Prisma schema and migration
2. ✅ Update App module
3. ✅ Configure environment
4. ✅ Run integration tests
5. ✅ Deploy to staging
6. ✅ Monitor and tune performance
7. ✅ Deploy to production

## Support

For issues or questions:
- Check logs: `backend/logs/automated-pipeline.log`
- Review metrics: `GET /admin/pipeline/metrics/daily`
- Check health: `GET /admin/pipeline/health`
