# Automated Legal Data Pipeline Architecture

## Executive Summary

Hệ thống hoàn toàn **tự động** thu thập, xử lý, và cập nhật dữ liệu pháp luật từ các nguồn chính thống mà **không cần bất kỳ thao tác thủ công nào** từ người dùng hoặc quản trị viên.

---

## 1. Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AUTOMATED LEGAL DATA PIPELINE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    SCHEDULER LAYER (NestJS)                     │  │
│  │  - Cron Jobs (@nestjs/schedule)                                │  │
│  │  - Job Queue (BullMQ + Redis)                                  │  │
│  │  - Trigger: Mỗi 6 giờ, ngày, hoặc theo cấu hình              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              SOURCE REGISTRY DISCOVERY LAYER                    │  │
│  │  - Quản lý danh sách các nguồn pháp luật chính thống          │  │
│  │  - Theo dõi RSS Feeds, Sitemaps, APIs                          │  │
│  │  - Phát hiện tự động các URL mới                               │  │
│  │  - Database: source_registry collection                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           URL DISCOVERY & DEDUPLICATION LAYER                  │  │
│  │  - Scan RSS feeds từ các nguồn                                 │  │
│  │  - Parse sitemap.xml từ các website chính thống               │  │
│  │  - So sánh với legal_source_documents hiện có                │  │
│  │  - Enqueue các URL mới vào BullMQ                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │            WEB CRAWLING LAYER (Parallel Processing)            │  │
│  │  - Worker Pool: 5-10 concurrent crawlers                       │  │
│  │  - Use: Playwright (headless browser)                          │  │
│  │  - Extract: Title, Number, Date, Content, Attachments         │  │
│  │  - Retry: Exponential backoff (3 attempts)                     │  │
│  │  - Rate Limit: 1 req/sec per domain                            │  │
│  │  - Output: Legal source document queue                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │        DATA VALIDATION & DEDUPLICATION LAYER                   │  │
│  │  - Check: Missing fields, Invalid format, Duplicate content   │  │
│  │  - Compare: With existing records using hash & similarity     │  │
│  │  - Mark: Status (PENDING, VALID, DUPLICATE, INVALID)          │  │
│  │  - Queue: Valid documents to AI processing                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │         AI PROCESSING LAYER (OpenAI/Gemini API)                │  │
│  │  - Normalize legal document structure                          │  │
│  │  - Extract: Key clauses, metadata, keywords                   │  │
│  │  - Generate: Summary, category, legal topics                  │  │
│  │  - Map: To existing LearningModule & LessonDraft models       │  │
│  │  - Queue: Processed documents to persistence                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │       PERSISTENCE LAYER (Upsert to MongoDB)                    │  │
│  │  - Upsert: LegalSourceDocument                                 │  │
│  │  - Create: LessonDraft (if AI processing successful)           │  │
│  │  - Update: Indexes & Full-text search                          │  │
│  │  - Log: Change history in audit trail                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                             ↓                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │          MONITORING & ALERTING LAYER                           │  │
│  │  - Log: All stages (INFO, WARN, ERROR)                         │  │
│  │  - Metrics: Success rate, processing time, error count        │  │
│  │  - Alert: Email/Slack when errors occur                        │  │
│  │  - Dashboard: Real-time pipeline status                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Diagram

```
Sources (Official Portals)
      ↓
   ┌─────────────────────────────────────────────────┐
   │ RSS Feeds | Sitemaps | APIs | Web Pages        │
   └─────────────────────────────────────────────────┘
           ↓
   [Scheduler: Every 6 hours]
           ↓
   ┌─────────────────────────────────────────────────┐
   │ URL Discovery Service                           │
   │ - Fetch RSS & Sitemap                          │
   │ - Extract URLs                                  │
   │ - Deduplicate against existing DB              │
   └─────────────────────────────────────────────────┘
           ↓
   [BullMQ Queue: crawler_urls]
           ↓
   ┌─────────────────────────────────────────────────┐
   │ Web Crawler Service (Worker Pool)               │
   │ - Parallel processing (5-10 workers)           │
   │ - Extract: Title, Number, Date, Content        │
   │ - Handle: Pagination, Dynamic content          │
   │ - Retry: On failure                            │
   └─────────────────────────────────────────────────┘
           ↓
   [BullMQ Queue: crawled_documents]
           ↓
   ┌─────────────────────────────────────────────────┐
   │ Data Validation Service                         │
   │ - Check: Required fields                        │
   │ - Verify: Format & integrity                    │
   │ - Detect: Duplicates (hash, similarity)        │
   └─────────────────────────────────────────────────┘
           ↓
   [BullMQ Queue: validated_documents]
           ↓
   ┌─────────────────────────────────────────────────┐
   │ AI Processing Service                           │
   │ - Normalize structure                           │
   │ - Extract metadata & keywords                   │
   │ - Generate summary & category                   │
   │ - Map to existing models                        │
   └─────────────────────────────────────────────────┘
           ↓
   [BullMQ Queue: processed_documents]
           ↓
   ┌─────────────────────────────────────────────────┐
   │ Persistence Service                             │
   │ - Upsert to MongoDB                            │
   │ - Create LessonDraft                            │
   │ - Update indexes                                │
   │ - Log audit trail                               │
   └─────────────────────────────────────────────────┘
           ↓
   MongoDB (LegalSourceDocument + LessonDraft)
           ↓
   Available for Learners in App
```

---

## 3. Sequence Diagram: Complete Pipeline

```
Timeline: Every 6 hours

T+0s    ┌─────────────────────────────────┐
        │ Scheduler Triggers Cron Job     │
        └──────────────┬──────────────────┘
                       │
T+2s    ┌──────────────▼──────────────────┐
        │ Load Source Registry            │
        │ - Fetch all registered sources  │
        │ - For each source:              │
        │   - If RSS: fetch & parse       │
        │   - If Sitemap: download & parse│
        │   - If API: call endpoint       │
        └──────────────┬──────────────────┘
                       │
T+5s    ┌──────────────▼──────────────────┐
        │ Extract & Deduplicate URLs      │
        │ - Compare with DB               │
        │ - Add new URLs to queue         │
        │ Count: N new URLs found         │
        └──────────────┬──────────────────┘
                       │
T+10s   ┌──────────────▼──────────────────┐
        │ Enqueue to crawler_urls         │
        │ [BullMQ] - N jobs created       │
        └──────────────┬──────────────────┘
                       │
T+15s   ┌──────────────▼──────────────────┐
        │ Worker Pool: Start Crawling     │
        │ [5-10 parallel workers]         │
        │ For each URL:                   │
        │ - Launch browser (Playwright)   │
        │ - Extract content               │
        │ - Handle pagination             │
        │ - Timeout: 30s per URL          │
        │ - Enqueue result                │
        └──────────────┬──────────────────┘
                       │
T+60s   ┌──────────────▼──────────────────┐
        │ Data Validation Service         │
        │ - Check required fields         │
        │ - Detect duplicates             │
        │ - Mark status                   │
        │ - Enqueue valid docs            │
        └──────────────┬──────────────────┘
                       │
T+75s   ┌──────────────▼──────────────────┐
        │ AI Processing Service           │
        │ [Call OpenAI/Gemini API]        │
        │ For each document:              │
        │ - Normalize structure           │
        │ - Extract metadata              │
        │ - Generate summary              │
        │ - Classify category             │
        │ - Extract key phrases           │
        │ - Enqueue result                │
        └──────────────┬──────────────────┘
                       │
T+120s  ┌──────────────▼──────────────────┐
        │ Persistence Service             │
        │ For each processed doc:         │
        │ - Upsert LegalSourceDocument    │
        │ - Create LessonDraft (if needed)│
        │ - Update indexes                │
        │ - Log audit trail               │
        └──────────────┬──────────────────┘
                       │
T+130s  ┌──────────────▼──────────────────┐
        │ Pipeline Complete               │
        │ - Send success report           │
        │ - Log metrics                   │
        │ - Alert if errors               │
        └─────────────────────────────────┘
        
Total processing time: ~130 seconds
Next execution: T+6 hours
```

---

## 4. Database Design

### New Collections & Modifications

```javascript
// 1. SourceRegistry - Quản lý các nguồn pháp luật chính thống
{
  _id: ObjectId,
  name: "Cổng Thông Tin Chính Phủ",              // e.g., "Cổng Thông Tin Chính Phủ", "Bộ Tư Pháp", etc
  description: "Cổng thông tin chính thức của Chính phủ Việt Nam",
  sourceType: "RSS" | "SITEMAP" | "API" | "HYBRID",
  
  // RSS Configuration
  rssUrl: "https://chinhphu.vn/rss",
  
  // Sitemap Configuration
  sitemapUrl: "https://chinhphu.vn/sitemap.xml",
  sitemapPattern: "/van-ban/",                    // URL pattern to filter
  
  // API Configuration
  apiEndpoint: "https://api.chinhphu.vn/documents",
  apiMethod: "GET",
  apiHeaders: { "Authorization": "Bearer token" },
  apiPageParam: "page",
  apiLimitParam: "limit",
  
  // Scraping Configuration (for hybrid sources)
  scrapeUrls: ["https://chinhphu.vn/van-ban"],
  scrapeSelectors: {
    urlPattern: "a.document-link",
    titlePattern: "h2.title",
    datePattern: ".publish-date"
  },
  
  // Schedule & Rate Limit
  cronExpression: "0 */6 * * *",                  // Every 6 hours
  maxRetries: 3,
  retryDelayMs: 5000,
  rateLimitReqPerSec: 1,
  timeoutMs: 30000,
  
  // Status
  isActive: true,
  lastSuccessfulCrawl: ISODate,
  lastFailedCrawl: ISODate,
  consecutiveFailures: 0,
  
  // Metadata
  createdAt: ISODate,
  updatedAt: ISODate,
  createdBy: "SYSTEM"
}

// 2. CrawlJob - Theo dõi từng job crawl
{
  _id: ObjectId,
  sourceRegistryId: ObjectId,
  sourceUrl: "https://chinhphu.vn/rss",
  
  // URLs discovered
  totalUrlsDiscovered: 10,
  newUrlsFound: 5,
  urlsQueued: 5,
  
  // Processing status
  status: "PENDING" | "CRAWLING" | "VALIDATING" | "PROCESSING_AI" | "PERSISTING" | "COMPLETED" | "FAILED",
  progress: {
    crawled: 5,
    validated: 3,
    aiProcessed: 2,
    persisted: 1
  },
  
  // Error tracking
  errors: [
    {
      url: "https://...",
      stage: "CRAWLING",
      errorCode: "TIMEOUT",
      errorMessage: "Request timeout after 30s",
      timestamp: ISODate
    }
  ],
  
  // Metrics
  startedAt: ISODate,
  completedAt: ISODate,
  durationMs: 130000,
  documentsCreated: 5,
  documentsUpdated: 2,
  documentsSkipped: 3,
  
  // Metadata
  createdAt: ISODate,
  updatedAt: ISODate
}

// 3. LegalSourceDocument - Existing model (enhanced)
// Already exists, just add new fields:
{
  _id: ObjectId,
  sourceUrl: "https://chinhphu.vn/van-ban/123",
  title: "Luật Dân Sự 2015",
  documentNo: "14/2015/QH13",
  effectiveDate: ISODate,
  issuedDate: ISODate,
  issuedBy: "Quốc Hội",
  
  // AI-extracted metadata
  legalCategory: "CIVIL_LAW" | "CRIMINAL_LAW" | "ADMINISTRATIVE_LAW" | "COMMERCIAL_LAW" | "LABOUR_LAW" | "OTHER",
  keywords: ["dân sự", "hợp đồng", "giao dịch"],
  summary: "Tóm tắt ngắn gọn...",
  keyPhrases: ["Hợp đồng dân sự", "Quyền và nghĩa vụ"],
  
  // Content
  rawText: "...",
  normalizedText: "...",
  contentHash: "sha256:abc123",                  // For deduplication
  
  // Source tracking
  sourceType: "RSS" | "SITEMAP" | "API" | "CRAWLED",
  crawlJobId: ObjectId,
  crawledAt: ISODate,
  
  // Status
  crawlStatus: "NEW" | "CRAWLED" | "VALIDATED" | "AI_PROCESSED" | "PERSISTED",
  isProcessedByAI: boolean,
  lessonDraftId: ObjectId | null,
  
  // Change tracking
  versions: [
    {
      versionNumber: 1,
      changedAt: ISODate,
      changes: ["title", "summary"]
    }
  ],
  
  createdAt: ISODate,
  updatedAt: ISODate,
  createdBy: "SYSTEM_AUTO_CRAWLER"
}

// 4. LessonDraft - Existing model (no change needed)
// But will be linked to LegalSourceDocument via legalSourceDocumentId

// 5. PipelineMetrics - Monitor pipeline health
{
  _id: ObjectId,
  date: ISODate,
  
  // Daily aggregates
  totalSourcesChecked: 8,
  totalUrlsDiscovered: 150,
  totalUrlsCrawled: 145,
  totalDocumentsCreated: 120,
  totalDocumentsUpdated: 15,
  totalDocumentsFailed: 10,
  
  // AI metrics
  aiTokensUsed: 50000,
  aiCostUSD: 1.50,
  
  // Performance
  avgCrawlTimeMs: 5000,
  avgAIProcessingTimeMs: 8000,
  totalDurationMs: 130000,
  
  // Errors
  totalErrors: 3,
  errorsByType: {
    "TIMEOUT": 1,
    "INVALID_FORMAT": 1,
    "API_ERROR": 1
  },
  
  // Success rate
  successRate: 95.2,
  
  createdAt: ISODate
}

// 6. CrawlErrorLog - Detailed error tracking
{
  _id: ObjectId,
  crawlJobId: ObjectId,
  url: "https://...",
  stage: "CRAWLING" | "VALIDATION" | "AI_PROCESSING" | "PERSISTENCE",
  errorCode: "TIMEOUT" | "INVALID_FORMAT" | "DUPLICATE" | "API_ERROR" | "DB_ERROR",
  errorMessage: "...",
  stackTrace: "...",
  timestamp: ISODate,
  retryCount: 2,
  nextRetryAt: ISODate
}
```

---

## 5. Folder Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── automated-pipeline/
│   │   │   ├── controllers/
│   │   │   │   └── pipeline-status.controller.ts       // Endpoint to view pipeline status (optional)
│   │   │   ├── services/
│   │   │   │   ├── pipeline-orchestrator.service.ts    // Main orchestrator
│   │   │   │   ├── source-registry.service.ts          // Manage source registry
│   │   │   │   ├── url-discovery.service.ts            // Discover URLs from sources
│   │   │   │   ├── web-crawler.service.ts              // Crawl URLs
│   │   │   │   ├── data-validator.service.ts           // Validate & deduplicate
│   │   │   │   ├── ai-processor.service.ts             // AI processing
│   │   │   │   ├── persistence.service.ts              // Save to DB
│   │   │   │   └── pipeline-monitor.service.ts         // Logging & monitoring
│   │   │   ├── jobs/
│   │   │   │   ├── url-discovery.job.ts                // Discover URLs
│   │   │   │   ├── crawler.job.ts                      // Crawl URLs
│   │   │   │   ├── validator.job.ts                    // Validate data
│   │   │   │   ├── ai-processor.job.ts                 // Process with AI
│   │   │   │   └── persistence.job.ts                  // Save to DB
│   │   │   ├── dto/
│   │   │   │   ├── source-registry.dto.ts
│   │   │   │   ├── crawled-document.dto.ts
│   │   │   │   └── pipeline-status.dto.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── source-registry.interface.ts
│   │   │   │   ├── crawl-job.interface.ts
│   │   │   │   ├── pipeline-metrics.interface.ts
│   │   │   │   └── crawled-document.interface.ts
│   │   │   ├── repositories/
│   │   │   │   ├── source-registry.repository.ts
│   │   │   │   ├── crawl-job.repository.ts
│   │   │   │   └── pipeline-metrics.repository.ts
│   │   │   ├── schedulers/
│   │   │   │   └── pipeline-scheduler.ts               // NestJS Scheduler
│   │   │   ├── utils/
│   │   │   │   ├── retry.util.ts                       // Retry logic
│   │   │   │   ├── rate-limiter.util.ts                // Rate limiting
│   │   │   │   ├── content-hash.util.ts                // Hash for dedup
│   │   │   │   └── similarity-checker.util.ts          // Detect duplicates
│   │   │   ├── constants/
│   │   │   │   └── pipeline.constants.ts
│   │   │   ├── automated-pipeline.module.ts
│   │   │   └── automated-pipeline.service.ts           // Main service
│   │   │
│   │   └── admin-content/                              // Existing module (no changes)
│   │
│   └── queues/
│       ├── crawler-urls.queue.ts                        // BullMQ Queue definitions
│       ├── crawled-documents.queue.ts
│       ├── validated-documents.queue.ts
│       ├── processed-documents.queue.ts
│       └── queue.module.ts
│
├── .env                                                 # Add new env vars
├── prisma/
│   ├── schema.prisma                                    # Updated schema
│   └── migrations/
│       └── XXXXXXX_add_automated_pipeline/
│           └── migration.sql
└── docker-compose.yml                                  # Add Redis
```

---

## 6. Module Dependencies & Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  AutomatedPipelineModule                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Providers:                          Imports:                  │
│  ├─ SourceRegistryService           ├─ BullModule (Redis)     │
│  ├─ UrlDiscoveryService             ├─ PrismaModule           │
│  ├─ WebCrawlerService               ├─ ConfigModule           │
│  ├─ DataValidatorService            └─ LoggerService          │
│  ├─ AiProcessorService              (from admin-content)      │
│  ├─ PersistenceService                                        │
│  ├─ PipelineMonitorService                                    │
│  ├─ PipelineOrchestratorService                               │
│  ├─ PipelineScheduler                                         │
│  └─ PipelineStatusController                                  │
│                                                                 │
│  BullMQ Queues:                                                │
│  ├─ crawler_urls                                              │
│  ├─ crawled_documents                                         │
│  ├─ validated_documents                                       │
│  ├─ processed_documents                                       │
│  └─ persistence_tasks                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. API Endpoints (Internal Admin Only)

```
GET  /api/admin/pipeline/status              - Current pipeline status
GET  /api/admin/pipeline/metrics              - Daily/weekly metrics
GET  /api/admin/pipeline/sources              - Registered sources
POST /api/admin/pipeline/sources              - Register new source
PATCH /api/admin/pipeline/sources/:id         - Update source config
DELETE /api/admin/pipeline/sources/:id        - Disable source
GET  /api/admin/pipeline/jobs                 - List crawl jobs
GET  /api/admin/pipeline/jobs/:id             - Get job details
POST /api/admin/pipeline/trigger              - Manual trigger (admin only)
GET  /api/admin/pipeline/errors               - Error logs
```

---

## 8. Environment Variables

```bash
# Automated Pipeline Configuration
PIPELINE_ENABLED=true
PIPELINE_SCHEDULE_CRON="0 */6 * * *"           # Every 6 hours
PIPELINE_MAX_WORKERS=5                         # Parallel crawlers
PIPELINE_CRAWLER_TIMEOUT_MS=30000              # 30 seconds
PIPELINE_MAX_RETRIES=3
PIPELINE_RETRY_DELAY_MS=5000

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# OpenAI/Gemini API
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-pro

# Notification (for alerts)
ALERT_EMAIL_TO=admin@lexi.com
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/...

# Rate Limiting
RATE_LIMIT_REQ_PER_SEC=1
RATE_LIMIT_BURST=5

# Database
DATABASE_URL=mongodb://...
```

---

## 9. Error Handling & Retry Strategy

```
Level 1: Individual URL Crawling
├─ Timeout Error
│  └─ Retry: Exponential backoff (5s, 10s, 20s)
│  └─ Max attempts: 3
│  └─ Then: Skip & Log
├─ Invalid Format Error
│  └─ Retry: No (mark as invalid)
│  └─ Log: Error details
├─ Rate Limited (429)
│  └─ Retry: Wait & retry (backoff)
│  └─ Max attempts: 3

Level 2: Source-level
├─ All URLs from a source failed
│  └─ Mark source: DEGRADED
│  └─ Increment: consecutiveFailures
│  └─ After 3 failures: Disable source
│  └─ Alert: Admin

Level 3: Pipeline-level
├─ AI API error
│  └─ Retry: Exponential backoff
│  └─ Skip & queue for later: If max retries reached
├─ Database error
│  └─ Retry: Backoff
│  └─ Alert: Critical
├─ Redis/Queue error
│  └─ Alert: Critical (pipeline stops)
```

---

## 10. Success Metrics & Monitoring

```
Daily Metrics:
├─ URLs Discovered: 150
├─ URLs Crawled: 145 (96.7%)
├─ Documents Created: 120
├─ Documents Updated: 15
├─ Success Rate: 95.2%
├─ Avg. Processing Time: 2 minutes
├─ AI Tokens Used: 50,000
├─ Cost (OpenAI): $1.50
└─ Errors: 3 (2%)

Weekly Aggregates:
├─ Total Documents Added: 840
├─ Total Documents Updated: 105
├─ New Legal Categories: 5
├─ Average Quality Score: 9.2/10
└─ Availability: 99.8%

Alerts:
├─ Pipeline failure: Immediate
├─ High error rate (>5%): Warning
├─ Slow processing (>5min): Warning
├─ Source degradation: Warning
└─ Cost threshold exceeded: Alert
```

---

## 11. Scalability Considerations

For **millions of legal documents**:

### Horizontal Scaling

1. **Worker Pool Scaling**
   - Increase BullMQ workers: 5 → 20-50 workers
   - Run workers on separate instances/containers
   - Use Kubernetes horizontal pod autoscaling

2. **Database Optimization**
   - Add indexes: `contentHash`, `sourceUrl`, `issuedDate`
   - Use sharding on `LegalSourceDocument`
   - Archive old versions to separate collection

3. **API Rate Limiting**
   - Implement backoff per domain
   - Proxy rotation for sources with strict limits
   - Distributed rate limiting using Redis

4. **AI Processing Optimization**
   - Batch API calls to reduce latency
   - Use queue priorities for newer documents
   - Cache AI responses for similar documents
   - Consider vision API for document images

5. **Caching Layer**
   - Redis cache for duplicate detection
   - Cache frequently accessed documents
   - TTL-based cache invalidation

### Cost Optimization

1. **Reduce API Calls**
   - Batch summarization (10 docs per API call)
   - Cache similar documents
   - Incremental updates (delta only)

2. **Optimize Crawling**
   - Only crawl modified pages (ETags, Last-Modified)
   - Incremental crawling (not full re-crawl)
   - Adaptive rate limiting

---

## 12. Deployment Checklist

```
[ ] Redis cluster setup
[ ] Database schema migration
[ ] Environment variables configured
[ ] Automated-pipeline module built
[ ] BullMQ queues initialized
[ ] Scheduler configured & tested
[ ] Error alerting configured
[ ] Monitoring dashboard setup
[ ] Rate limiters tested
[ ] AI API credentials verified
[ ] Source registry populated
[ ] Dry-run: Manual trigger test
[ ] Full integration test
[ ] Production deployment
[ ] Post-deployment verification
```

---

## 13. Support & Maintenance

### Monthly Tasks
- Review error logs
- Verify source registries (check if sources still active)
- Clean up old versions
- Optimize database indexes

### Quarterly Tasks
- Update AI prompt based on quality feedback
- Evaluate new sources for legal documents
- Performance tuning of crawlers
- Cost optimization review

---

## Files to Create/Modify

1. **New Files:**
   - `/src/modules/automated-pipeline/**` (complete module)
   - `/src/queues/queue.module.ts`
   - `/prisma/schema.prisma` (extend)
   - `/prisma/migrations/XXXXXXX_add_automated_pipeline/`

2. **Modified Files:**
   - `.env.example` (add new env vars)
   - `app.module.ts` (import AutomatedPipelineModule)
   - `docker-compose.yml` (add Redis if not present)

This is complete production-ready architecture. Ready to start implementation?
