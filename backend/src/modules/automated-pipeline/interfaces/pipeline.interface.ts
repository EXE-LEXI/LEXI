export enum SourceType {
  RSS = 'RSS',
  SITEMAP = 'SITEMAP',
  API = 'API',
  HYBRID = 'HYBRID',
  CRAWLER = 'CRAWLER',
}

export enum CrawlStatus {
  PENDING = 'PENDING',
  CRAWLING = 'CRAWLING',
  VALIDATING = 'VALIDATING',
  PROCESSING_AI = 'PROCESSING_AI',
  PERSISTING = 'PERSISTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ISourceRegistry {
  id?: string;
  _id?: string;
  name: string;
  description?: string | null;
  sourceType: SourceType | string;

  // RSS
  rssUrl?: string | null;

  // Sitemap
  sitemapUrl?: string | null;
  sitemapPattern?: string | null;

  // API
  apiEndpoint?: string | null;
  apiMethod?: 'GET' | 'POST' | string;
  apiHeaders?: any;
  apiPageParam?: string | null;
  apiLimitParam?: string | null;

  // Scraping
  scrapeUrls?: string[];
  scrapeSelectors?: {
    urlPattern?: string;
    titlePattern?: string;
    datePattern?: string;
  };

  // Configuration
  cronExpression?: string | null;
  maxRetries: number;
  retryDelayMs: number;
  rateLimitReqPerSec?: number;
  timeoutMs: number;

  // Status
  status?: string;
  isActive?: boolean;
  lastCrawlTime?: Date;
  lastSuccessfulCrawl?: Date;
  lastFailedCrawl?: Date;
  consecutiveFailures: number;
  lastError?: string | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ICrawlJob {
  _id?: string;
  sourceRegistryId: string;
  sourceUrl: string;
  totalUrlsDiscovered: number;
  newUrlsFound: number;
  urlsQueued: number;
  status: CrawlStatus;
  progress: {
    crawled: number;
    validated: number;
    aiProcessed: number;
    persisted: number;
  };
  errors: Array<{
    url: string;
    stage: string;
    errorCode: string;
    errorMessage: string;
    timestamp: Date;
  }>;
  metrics: {
    startedAt: Date;
    completedAt?: Date;
    durationMs: number;
    documentsCreated: number;
    documentsUpdated: number;
    documentsSkipped: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICrawledDocument {
  sourceUrl: string;
  title: string;
  documentNo?: string;
  effectiveDate?: Date;
  issuedDate?: Date;
  issuedBy?: string;
  rawText: string;
  normalizedText: string;
  contentHash: string;
  sourceType: SourceType;
  crawlJobId: string;
  crawledAt: Date;
}

export interface IPipelineMetrics {
  _id?: string;
  date: Date;
  totalSourcesChecked: number;
  totalUrlsDiscovered: number;
  totalUrlsCrawled: number;
  totalDocumentsCreated: number;
  totalDocumentsUpdated: number;
  totalDocumentsFailed: number;
  aiTokensUsed: number;
  aiCostUSD: number;
  avgCrawlTimeMs: number;
  avgAIProcessingTimeMs: number;
  totalDurationMs: number;
  totalErrors: number;
  errorsByType: Record<string, number>;
  successRate: number;
  createdAt: Date;
}
