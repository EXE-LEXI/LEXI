import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Browser, chromium } from "playwright";
import * as cheerio from "cheerio";
import { ICrawledDocument } from "../interfaces/pipeline.interface";

type CrawledDocumentBase = Omit<ICrawledDocument, "sourceType" | "crawlJobId"> & {
  attachmentUrls?: string[];
};

@Injectable()
export class WebCrawlerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebCrawlerService.name);
  private browser: Browser | null = null;
  private browserUnavailable = false;

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  async initialize(): Promise<void> {
    if (this.browser || this.browserUnavailable) {
      return;
    }

    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      this.logger.log("Playwright browser initialized for legal crawler");
    } catch (error) {
      this.browserUnavailable = true;
      this.logger.warn(
        `Playwright browser unavailable, using HTTP fallback: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async crawlUrl(
    url: string,
    maxRetries = 3,
    retryDelayMs = 5000,
    timeoutMs = 30000
  ): Promise<CrawledDocumentBase> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.crawlUrlInternal(url, timeoutMs);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed for ${url}: ${lastError.message}`
        );

        if (attempt < maxRetries) {
          const delay = retryDelayMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error(`Failed to crawl ${url}`);
  }

  private async crawlUrlInternal(
    url: string,
    timeoutMs: number
  ): Promise<CrawledDocumentBase> {
    if (!this.browser && !this.browserUnavailable) {
      await this.initialize();
    }

    if (!this.browser) {
      return this.crawlWithHttpFallback(url, timeoutMs);
    }

    const page = await this.browser.newPage();

    try {
      page.setDefaultTimeout(timeoutMs);
      page.setDefaultNavigationTimeout(timeoutMs);
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const content = await page.content();
      return this.extractDocumentFromHtml(url, content);
    } finally {
      await page.close();
    }
  }

  private async crawlWithHttpFallback(
    url: string,
    timeoutMs: number
  ): Promise<CrawledDocumentBase> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "text/html,text/plain,application/xhtml+xml,application/pdf",
          "User-Agent": "LEXI-AutoLegalCrawler/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const body = await response.text();

      if (contentType.includes("text/plain")) {
        return this.extractDocumentFromText(url, body, url);
      }

      return this.extractDocumentFromHtml(url, body);
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractDocumentFromHtml(url: string, html: string): CrawledDocumentBase {
    const $ = cheerio.load(html);
    $("script, style, noscript, nav, header, footer").remove();

    const title =
      $("h1").first().text().trim() ||
      $(".title, .Title, .document-title, .detail-title").first().text().trim() ||
      $("title").text().trim() ||
      $("meta[property='og:title']").attr("content") ||
      "Untitled";

    const attachmentUrls = this.extractAttachmentUrls($ as any, url);
    const rawText = $("body").text().replace(/\s+/g, " ").trim();
    return this.extractDocumentFromText(url, rawText, title, attachmentUrls);
  }

  private extractDocumentFromText(
    url: string,
    text: string,
    title: string,
    attachmentUrls: string[] = []
  ): CrawledDocumentBase {
    const rawText = text.replace(/\s+/g, " ").trim();
    const normalizedText = this.normalizeText(rawText);

    return {
      sourceUrl: url,
      title: this.cleanTitle(title),
      documentNo: this.extractDocumentNumber(rawText),
      effectiveDate: this.extractDate(rawText, [
        "Ngày có hiệu lực",
        "Hiệu lực",
        "Có hiệu lực",
        "Effective Date",
      ]),
      issuedDate: this.extractDate(rawText, [
        "Ngày ban hành",
        "Ban hành",
        "Ngày ký",
        "Issued Date",
      ]),
      issuedBy: this.extractIssuedBy(rawText),
      rawText,
      normalizedText,
      contentHash: this.generateHash(normalizedText),
      crawledAt: new Date(),
      attachmentUrls,
    };
  }

  private extractDocumentNumber(text: string): string | undefined {
    const match = text.match(
      /\b\d{1,4}\/\d{4}\/[A-Z0-9Đ]+(?:-[A-Z0-9Đ]+){0,4}\b/u
    );
    return match?.[0];
  }

  private extractDate(text: string, patterns: string[]): Date | undefined {
    for (const pattern of patterns) {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(
        `${escaped}[^0-9]{0,120}(\\d{1,2})[/\\-.](\\d{1,2})[/\\-.](\\d{4})`,
        "iu"
      );
      const match = text.match(regex);

      if (match) {
        const [, day, month, year] = match;
        return new Date(
          Date.UTC(Number(year), Number(month) - 1, Number(day))
        );
      }
    }

    return undefined;
  }

  private extractIssuedBy(text: string): string | undefined {
    const match = text.match(
      /(?:Cơ quan ban hành|Ban hành bởi|Cơ quan|Người ký)[:\s]+([A-ZÀ-Ỹa-zà-ỹ\s,.-]{3,120})(?:,|\.|\n|$)/iu
    );
    return match?.[1]?.trim();
  }

  private normalizeText(text: string): string {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
  }

  private cleanTitle(title: string): string {
    return title.replace(/\s+/g, " ").trim().slice(0, 300) || "Untitled";
  }

  private extractAttachmentUrls(
    $: any,
    pageUrl: string
  ): string[] {
    const urls = new Set<string>();

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      if (!href || !/\.(pdf|doc|docx|xls|xlsx)(\?|#|$)/i.test(href)) {
        return;
      }

      try {
        urls.add(new URL(href, pageUrl).toString());
      } catch {
        // Ignore malformed attachment URLs.
      }
    });

    return Array.from(urls);
  }

  private generateHash(text: string): string {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(text).digest("hex");
  }
}
