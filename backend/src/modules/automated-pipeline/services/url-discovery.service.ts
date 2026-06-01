import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import * as Parser from "rss-parser";
import { parseStringPromise } from "xml2js";
import * as cheerio from "cheerio";
import { ISourceRegistry } from "../interfaces/pipeline.interface";
import { SourceRegistryRepository } from "../repositories/source-registry.repository";

const OFFICIAL_DOMAINS = [
  "vbpl.vn",
  "moj.gov.vn",
  "vbpl.moj.gov.vn",
  "chinhphu.vn",
  "congbao.chinhphu.vn",
  "congbaocdn.chinhphu.vn",
  "quochoi.vn",
  "vanban.chinhphu.vn",
];

@Injectable()
export class UrlDiscoveryService {
  private readonly logger = new Logger(UrlDiscoveryService.name);
  private readonly rssParser = new Parser();

  constructor(
    private readonly httpService: HttpService,
    private readonly sourceRegistry: SourceRegistryRepository
  ) {}

  async discoverUrls(sourceId?: string): Promise<
    Array<{
      url: string;
      source: ISourceRegistry;
      title?: string;
      date?: Date;
    }>
  > {
    const sources = sourceId
      ? [await this.sourceRegistry.findById(sourceId)]
      : await this.sourceRegistry.findAll();

    const allUrls = [];

    for (const source of sources) {
      if (!source) {
        continue;
      }

      try {
        let urls: Array<{ url: string; title?: string; date?: Date }> = [];

        if (source.sourceType === "RSS") {
          urls = await this.discoverFromRss(source);
        } else if (source.sourceType === "SITEMAP") {
          urls = await this.discoverFromSitemap(source);
        } else if (source.sourceType === "API") {
          urls = await this.discoverFromApi(source);
        } else if (source.sourceType === "HYBRID") {
          urls = [
            ...(await this.safeDiscover(() => this.discoverFromRss(source))),
            ...(await this.safeDiscover(() => this.discoverFromSitemap(source))),
            ...(await this.safeDiscover(() => this.discoverFromHtmlIndex(source))),
          ];
        } else if (source.sourceType === "CRAWLER") {
          urls = await this.discoverFromHtmlIndex(source);
        }

        const filteredUrls = this.dedupeUrls(urls).filter((item) =>
          this.isOfficialUrl(item.url)
        );

        allUrls.push(
          ...filteredUrls.map((u) => ({
            ...u,
            source,
          }))
        );

        this.logger.log(
          `Discovered ${filteredUrls.length}/${urls.length} official URLs from source: ${source.name}`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        this.logger.error(`Error discovering URLs from ${source.name}: ${message}`);
        await this.sourceRegistry.updateLastCrawl(source.id, false, message);
      }
    }

    return allUrls;
  }

  private async safeDiscover(
    fn: () => Promise<Array<{ url: string; title?: string; date?: Date }>>
  ): Promise<Array<{ url: string; title?: string; date?: Date }>> {
    try {
      return await fn();
    } catch {
      return [];
    }
  }

  private async discoverFromRss(
    source: ISourceRegistry
  ): Promise<Array<{ url: string; title?: string; date?: Date }>> {
    if (!source.rssUrl) {
      throw new Error("RSS URL not configured");
    }

    const feed = await this.rssParser.parseURL(source.rssUrl);
    return feed.items
      .map((item) => ({
        url: item.link || "",
        title: item.title,
        date: item.pubDate ? new Date(item.pubDate) : undefined,
      }))
      .filter((item) => item.url);
  }

  private async discoverFromSitemap(
    source: ISourceRegistry
  ): Promise<Array<{ url: string; date?: Date }>> {
    if (!source.sitemapUrl) {
      throw new Error("Sitemap URL not configured");
    }

    const response = await this.httpService.axiosRef.get(source.sitemapUrl, {
      timeout: source.timeoutMs || 10000,
    });

    const parsed = await parseStringPromise(response.data);
    const urlset = parsed.urlset?.url || [];

    return urlset
      .map((item: any) => ({
        url: item.loc?.[0] || "",
        date: item.lastmod?.[0] ? new Date(item.lastmod[0]) : undefined,
      }))
      .filter(
        (item: any) =>
          item.url &&
          (!source.sitemapPattern || item.url.includes(source.sitemapPattern))
      );
  }

  private async discoverFromApi(
    source: ISourceRegistry
  ): Promise<Array<{ url: string; title?: string; date?: Date }>> {
    if (!source.apiEndpoint) {
      throw new Error("API endpoint not configured");
    }

    const allUrls = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore && page <= 20) {
      const response = await this.httpService.axiosRef.get(source.apiEndpoint, {
        params: {
          [source.apiPageParam || "page"]: page,
          [source.apiLimitParam || "limit"]: limit,
        },
        headers: source.apiHeaders || {},
        timeout: source.timeoutMs,
      });

      const documents =
        response.data.items || response.data.documents || response.data.data || [];

      if (!documents.length) {
        break;
      }

      allUrls.push(
        ...documents
          .map((doc: any) => ({
            url: doc.url || doc.documentUrl || doc.href,
            title: doc.title || doc.name,
            date: doc.date ? new Date(doc.date) : undefined,
          }))
          .filter((item: any) => item.url)
      );

      page++;
      hasMore = documents.length >= limit;
    }

    return allUrls;
  }

  private async discoverFromHtmlIndex(
    source: ISourceRegistry
  ): Promise<Array<{ url: string; title?: string; date?: Date }>> {
    const indexUrl = source.apiEndpoint || source.sitemapUrl || source.rssUrl;
    if (!indexUrl) {
      throw new Error("HTML index URL not configured");
    }

    const urls: Array<{ url: string; title?: string; date?: Date }> = [];
    const pagesToVisit = this.buildIndexPages(indexUrl);

    for (const pageUrl of pagesToVisit) {
      const response = await this.httpService.axiosRef.get(pageUrl, {
        timeout: source.timeoutMs,
        headers: {
          "User-Agent": "LEXI-AutoLegalCrawler/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      const $ = cheerio.load(response.data);
      $("a[href]").each((_, element) => {
        const href = $(element).attr("href");
        if (!href) {
          return;
        }

        const text = $(element).text().replace(/\s+/g, " ").trim();
        const url = this.toAbsoluteUrl(href, pageUrl);

        if (url && this.looksLikeLegalDocumentUrl(url, text)) {
          urls.push({ url, title: text || undefined });
        }
      });
    }

    return urls.slice(0, 500);
  }

  private buildIndexPages(indexUrl: string): string[] {
    const pages = [indexUrl];
    const url = new URL(indexUrl);

    for (let page = 2; page <= 5; page++) {
      const next = new URL(url.toString());
      next.searchParams.set("page", String(page));
      next.searchParams.set("Page", String(page));
      pages.push(next.toString());
    }

    return pages;
  }

  private looksLikeLegalDocumentUrl(url: string, text: string): boolean {
    const value = `${url} ${text}`.toLowerCase();
    return [
      "vbpq-toanvan",
      "thuoc-tinh-van-ban",
      "van-ban",
      "vbqppl",
      "nghi-dinh",
      "quyet-dinh",
      "thong-tu",
      "luat-",
      "bo-luat",
      ".pdf",
    ].some((keyword) => value.includes(keyword));
  }

  private toAbsoluteUrl(href: string, baseUrl: string): string | null {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return null;
    }
  }

  private dedupeUrls(
    urls: Array<{ url: string; title?: string; date?: Date }>
  ): Array<{ url: string; title?: string; date?: Date }> {
    const seen = new Set<string>();
    return urls.filter((item) => {
      if (!item.url || seen.has(item.url)) {
        return false;
      }
      seen.add(item.url);
      return true;
    });
  }

  private isOfficialUrl(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return OFFICIAL_DOMAINS.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }
}
