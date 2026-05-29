import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { AdminContentService } from "./admin-content.service";

const LEGAL_SOURCE_CRAWL_CRON =
  process.env.LEGAL_SOURCE_CRAWL_CRON ?? "0 2 * * *";

@Injectable()
export class LegalSourceCrawlWorker {
  private readonly logger = new Logger(LegalSourceCrawlWorker.name);

  constructor(private readonly adminContentService: AdminContentService) {}

  @Cron(LEGAL_SOURCE_CRAWL_CRON)
  async handleLegalSourceCrawl() {
    const enabled = this.getBooleanEnv("LEGAL_SOURCE_CRAWL_ENABLED", false);
    if (!enabled) {
      this.logger.log("Legal source crawl job is disabled.");
      return;
    }

    const urls = this.getUrlsEnv("LEGAL_SOURCE_CRAWL_URLS");
    if (urls.length === 0) {
      this.logger.log("No legal source URLs configured for crawl job.");
      return;
    }

    const questionCount = this.getNumberEnv(
      "LEGAL_SOURCE_CRAWL_QUESTION_COUNT",
      3
    );
    const moduleId =
      process.env.LEGAL_SOURCE_CRAWL_MODULE_ID?.trim() || undefined;

    this.logger.log(
      `Running legal source crawl job for ${urls.length} URLs...`
    );
    const result = await this.adminContentService.crawlLegalSources({
      urls,
      moduleId,
      generateDrafts: true,
      questionCount,
    });

    this.logger.log(
      `Legal source crawl job completed. Sources: ${result.sources.length}, drafts: ${result.drafts.length}, errors: ${result.errors.length}.`
    );
  }

  private getUrlsEnv(key: string) {
    return (process.env[key] ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private getBooleanEnv(key: string, defaultValue: boolean) {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }

    return value === "true" || value === "1" || value === "yes";
  }

  private getNumberEnv(key: string, defaultValue: number) {
    const value = Number.parseInt(process.env[key] ?? "", 10);
    return Number.isInteger(value) && value > 0 ? value : defaultValue;
  }
}
