import { Injectable, Logger } from "@nestjs/common";

/**
 * Service to crawl Vietnamese legal documents from various official sources
 * Supports: VnLaw, LuatCaoDan, official government websites
 */
@Injectable()
export class VietnameseLawCrawlerService {
  private readonly logger = new Logger(VietnameseLawCrawlerService.name);

  /**
   * Official Vietnamese legal sources
   */
  private readonly LEGAL_SOURCES = {
    vnlaw: {
      baseUrl: "https://vnlaw.gov.vn",
      paths: [
        "/search?q=luat",
        "/search?q=decree",
        "/search?q=decision",
      ],
      type: "VNLAW",
    },
    luatcaodan: {
      baseUrl: "https://luatcaodanvietnam.com",
      paths: ["/all-laws", "/decrees"],
      type: "LUATCAODAN",
    },
    moha: {
      baseUrl: "https://moj.gov.vn",
      paths: ["/tin-tuc", "/van-ban-phap-luat"],
      type: "MINISTRY",
    },
  };

  /**
   * Crawl legal sources and extract Vietnamese law documents
   * Returns list of URLs for legal documents
   */
  async crawlVietnameseLegalSources(
    sourceType?: string,
    maxResults: number = 50
  ): Promise<
    Array<{
      url: string;
      title: string;
      source: string;
      lastModified?: Date;
    }>
  > {
    const results: Array<{
      url: string;
      title: string;
      source: string;
      lastModified?: Date;
    }> = [];

    const sources = sourceType
      ? Object.values(this.LEGAL_SOURCES).filter(
          (s) => s.type === sourceType
        )
      : Object.values(this.LEGAL_SOURCES);

    for (const source of sources) {
      try {
        const sourceResults = await this.crawlSource(source, maxResults);
        results.push(...sourceResults);
      } catch (error) {
        this.logger.warn(
          `Failed to crawl ${source.type}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return results.slice(0, maxResults);
  }

  /**
   * Crawl specific government law database
   */
  async crawlGovernmentDatabase(): Promise<
    Array<{
      url: string;
      title: string;
      legalDocumentNo?: string;
      effectiveDate?: Date;
    }>
  > {
    const results: Array<{
      url: string;
      title: string;
      legalDocumentNo?: string;
      effectiveDate?: Date;
    }> = [];

    try {
      // Crawl from official government sources
      const govResults = await this.fetchGovernmentLawIndex();
      results.push(...govResults);
    } catch (error) {
      this.logger.error(
        `Failed to crawl government database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    return results;
  }

  /**
   * Extract metadata from legal document URL
   */
  async extractLegalDocumentMetadata(
    url: string
  ): Promise<{
    title?: string;
    legalDocumentNo?: string;
    effectiveDate?: Date;
    description?: string;
  }> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "LEXI-LawCrawler/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) {
        return {};
      }

      const html = await response.text();
      return this.parseDocumentMetadata(html);
    } catch (error) {
      this.logger.warn(
        `Failed to extract metadata from ${url}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return {};
    }
  }

  /**
   * Get list of relevant legal topics for Vietnamese law education
   */
  getRelevantLegalTopics(): Array<{
    topic: string;
    keywords: string[];
    relevance: "high" | "medium" | "low";
  }> {
    return [
      {
        topic: "Constitutional Law",
        keywords: ["constitution", "basic law", "state system"],
        relevance: "high",
      },
      {
        topic: "Civil Law",
        keywords: [
          "family law",
          "marriage",
          "inheritance",
          "contract",
          "property",
        ],
        relevance: "high",
      },
      {
        topic: "Criminal Law",
        keywords: ["criminal code", "penalty", "crime", "punishment"],
        relevance: "high",
      },
      {
        topic: "Commercial Law",
        keywords: ["business", "trade", "enterprise", "commerce"],
        relevance: "high",
      },
      {
        topic: "Labor Law",
        keywords: ["employment", "labor", "worker", "wage"],
        relevance: "high",
      },
      {
        topic: "Administrative Law",
        keywords: ["administration", "government", "regulation", "decision"],
        relevance: "medium",
      },
      {
        topic: "Environmental Law",
        keywords: ["environment", "pollution", "conservation"],
        relevance: "medium",
      },
      {
        topic: "Education Law",
        keywords: ["education", "school", "student"],
        relevance: "low",
      },
    ];
  }

  private async crawlSource(
    source: any,
    maxResults: number
  ): Promise<
    Array<{
      url: string;
      title: string;
      source: string;
      lastModified?: Date;
    }>
  > {
    const results: Array<{
      url: string;
      title: string;
      source: string;
      lastModified?: Date;
    }> = [];

    for (const path of source.paths) {
      try {
        const url = `${source.baseUrl}${path}`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "LEXI-LawCrawler/1.0",
          },
        });

        if (!response.ok) {
          continue;
        }

        const html = await response.text();
        const items = this.extractLegalItems(html, source.type);
        results.push(
          ...items.map((item) => ({
            ...item,
            source: source.type,
          }))
        );

        if (results.length >= maxResults) {
          break;
        }
      } catch (error) {
        this.logger.debug(
          `Failed to crawl ${source.type}${path}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return results;
  }

  private async fetchGovernmentLawIndex(): Promise<
    Array<{
      url: string;
      title: string;
      legalDocumentNo?: string;
      effectiveDate?: Date;
    }>
  > {
    // This would call official government law API if available
    // For now, return hardcoded popular Vietnamese laws
    return [
      {
        url: "https://luatcaodanvietnam.com/Quoc-Hoi/Luat-Hop-dong-Lao-dong-2012-so-10-2012-QH13",
        title: "Law on Labor Code 2012",
        legalDocumentNo: "10/2012/QH13",
        effectiveDate: new Date("2013-01-01"),
      },
      {
        url: "https://luatcaodanvietnam.com/Quoc-Hoi/Luat-Dang-Ky-Kinh-Doanh-2014-so-68-2014-QH13",
        title: "Law on Business Registration 2014",
        legalDocumentNo: "68/2014/QH13",
        effectiveDate: new Date("2015-03-01"),
      },
      {
        url: "https://luatcaodanvietnam.com/Quoc-Hoi/Bo-Luat-Dan-su-2015-so-91-2015-QH13",
        title: "Civil Code 2015",
        legalDocumentNo: "91/2015/QH13",
        effectiveDate: new Date("2017-01-01"),
      },
      {
        url: "https://luatcaodanvietnam.com/Quoc-Hoi/Bo-Luat-Hinh-su-2015-so-100-2015-QH13",
        title: "Criminal Code 2015",
        legalDocumentNo: "100/2015/QH13",
        effectiveDate: new Date("2018-01-01"),
      },
    ];
  }

  private extractLegalItems(
    html: string,
    sourceType: string
  ): Array<{ url: string; title: string }> {
    // Simple regex-based extraction - in production, use proper HTML parser
    const items: Array<{ url: string; title: string }> = [];

    // Extract links and titles based on source type
    const linkRegex = /<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html))) {
      const [, href, title] = match;
      if (this.isValidLegalDocumentLink(href, sourceType)) {
        items.push({
          url: this.normalizeLegalUrl(href),
          title: title.trim(),
        });
      }
    }

    return items;
  }

  private parseDocumentMetadata(html: string): {
    title?: string;
    legalDocumentNo?: string;
    effectiveDate?: Date;
    description?: string;
  } {
    const metadata: {
      title?: string;
      legalDocumentNo?: string;
      effectiveDate?: Date;
      description?: string;
    } = {};

    // Extract title from h1 or og:title
    const titleMatch = html.match(
      /<h1[^>]*>([^<]+)<\/h1>|og:title[^>]*content=["']([^"']+)/i
    );
    if (titleMatch) {
      metadata.title = (titleMatch[1] || titleMatch[2] || "").trim();
    }

    // Extract legal document number (pattern: NN/YYYY/XX)
    const docNoMatch = html.match(/(\d{1,3}\/\d{4}\/[A-Z]{2})/);
    if (docNoMatch) {
      metadata.legalDocumentNo = docNoMatch[1];
    }

    // Extract effective date
    const dateMatch = html.match(
      /(?:Hiệu lực|Effective Date|Ngày hiệu lực)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
    );
    if (dateMatch) {
      const dateParts = dateMatch[1].split(/[\/-]/);
      metadata.effectiveDate = new Date(
        `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
      );
    }

    return metadata;
  }

  private isValidLegalDocumentLink(url: string, sourceType: string): boolean {
    const legalKeywords = [
      "luat",
      "law",
      "decree",
      "decision",
      "ordinance",
      "regulation",
      "nghi-dinh",
      "quyet-dinh",
    ];

    return legalKeywords.some((keyword) =>
      url.toLowerCase().includes(keyword)
    );
  }

  private normalizeLegalUrl(url: string): string {
    // Convert relative URLs to absolute
    if (url.startsWith("http")) {
      return url;
    }

    if (url.startsWith("/")) {
      // Find the base domain
      return `https://luatcaodanvietnam.com${url}`;
    }

    return url;
  }
}
