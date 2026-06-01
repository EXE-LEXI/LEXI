import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAI } from "openai";
import { ICrawledDocument } from "../interfaces/pipeline.interface";

interface ProcessedDocument extends ICrawledDocument {
  legalCategory: string;
  keywords: string[];
  summary: string;
  keyPhrases: string[];
  importantClauses?: string[];
  metadata?: Record<string, any>;
  isProcessedByAI: boolean;
}

@Injectable()
export class AiProcessorService {
  private readonly logger = new Logger(AiProcessorService.name);
  private readonly openai: OpenAI | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
    this.model = this.config.get<string>("OPENAI_MODEL") || "gpt-4o-mini";
  }

  async processDocument(doc: ICrawledDocument): Promise<ProcessedDocument> {
    if (!this.openai) {
      return this.localFallback(doc);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a Vietnamese LegalTech data extraction engine. Return only strict JSON. Do not provide legal advice.",
          },
          {
            role: "user",
            content: this.buildPrompt(doc),
          },
        ],
        temperature: 0.1,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      const aiData = this.parseAiResponse(content);

      return {
        ...doc,
        legalCategory: aiData.legalCategory,
        keywords: aiData.keywords,
        summary: aiData.summary,
        keyPhrases: aiData.keyPhrases,
        importantClauses: aiData.importantClauses,
        metadata: aiData.metadata,
        isProcessedByAI: true,
      };
    } catch (error) {
      this.logger.error(
        `AI processing failed for ${doc.sourceUrl}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return this.localFallback(doc);
    }
  }

  private buildPrompt(doc: ICrawledDocument): string {
    const chunks = this.buildContextWindow(doc.normalizedText || doc.rawText);

    return `
Analyze and normalize this Vietnamese legal document for a LegalTech database.

Return ONLY a valid JSON object with this schema:
{
  "normalizedTitle": "official Vietnamese title if identifiable",
  "documentNo": "official number/symbol, or null",
  "issuedDate": "ISO-8601 date or null",
  "effectiveDate": "ISO-8601 date or null",
  "issuedBy": "issuing authority or null",
  "legalCategory": "CONSTITUTIONAL_LAW|CIVIL_LAW|CRIMINAL_LAW|ADMINISTRATIVE_LAW|COMMERCIAL_LAW|LABOUR_LAW|TAX_LAW|LAND_LAW|TRAFFIC_LAW|EDUCATION_LAW|HEALTH_LAW|ENVIRONMENTAL_LAW|OTHER",
  "keywords": ["5-12 Vietnamese keywords"],
  "summary": "120-180 Vietnamese words, neutral and factual",
  "keyPhrases": ["3-8 important legal phrases"],
  "importantClauses": ["up to 8 concise clause/article references with short reason"],
  "dataQuality": {
    "confidence": 0.0,
    "missingFields": ["field names that are missing"],
    "warnings": ["possible extraction issues"]
  }
}

Rules:
- Use only facts present in the document text. Do not invent dates or authorities.
- Preserve Vietnamese legal terms and document numbers exactly.
- If the text is not a legal normative document, set legalCategory to OTHER and add a warning.
- The summary must not be legal advice.

Source URL: ${doc.sourceUrl}
Crawler title: ${doc.title}
Crawler documentNo: ${doc.documentNo || "null"}
Crawler issuedDate: ${doc.issuedDate?.toISOString() || "null"}
Crawler effectiveDate: ${doc.effectiveDate?.toISOString() || "null"}
Crawler issuedBy: ${doc.issuedBy || "null"}

Document text excerpts:
${chunks.map((chunk, index) => `--- EXCERPT ${index + 1} ---\n${chunk}`).join("\n")}
`;
  }

  private buildContextWindow(text: string): string[] {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= 9000) {
      return [normalized];
    }

    return [
      normalized.slice(0, 5000),
      normalized.slice(Math.max(0, Math.floor(normalized.length / 2) - 2000), Math.floor(normalized.length / 2) + 2000),
      normalized.slice(-5000),
    ];
  }

  private parseAiResponse(content: string): {
    legalCategory: string;
    keywords: string[];
    summary: string;
    keyPhrases: string[];
    importantClauses: string[];
    metadata: Record<string, any>;
  } {
    try {
      const parsed = JSON.parse(content.trim());

      return {
        legalCategory: this.validateCategory(parsed.legalCategory),
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 12) : [],
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
        keyPhrases: Array.isArray(parsed.keyPhrases)
          ? parsed.keyPhrases.slice(0, 8)
          : [],
        importantClauses: Array.isArray(parsed.importantClauses)
          ? parsed.importantClauses.slice(0, 8)
          : [],
        metadata: {
          normalizedTitle: parsed.normalizedTitle,
          documentNo: parsed.documentNo,
          issuedDate: parsed.issuedDate,
          effectiveDate: parsed.effectiveDate,
          issuedBy: parsed.issuedBy,
          dataQuality: parsed.dataQuality,
        },
      };
    } catch (error) {
      this.logger.warn(
        `Could not parse AI response: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return {
        legalCategory: "OTHER",
        keywords: [],
        summary: "",
        keyPhrases: [],
        importantClauses: [],
        metadata: {},
      };
    }
  }

  private validateCategory(category: string): string {
    const validCategories = [
      "CONSTITUTIONAL_LAW",
      "CIVIL_LAW",
      "CRIMINAL_LAW",
      "ADMINISTRATIVE_LAW",
      "COMMERCIAL_LAW",
      "LABOUR_LAW",
      "TAX_LAW",
      "LAND_LAW",
      "TRAFFIC_LAW",
      "EDUCATION_LAW",
      "HEALTH_LAW",
      "ENVIRONMENTAL_LAW",
      "OTHER",
    ];

    return validCategories.includes(category) ? category : "OTHER";
  }

  private localFallback(doc: ICrawledDocument): ProcessedDocument {
    const text = doc.normalizedText || doc.rawText;
    const category = this.classifyLocally(text);

    return {
      ...doc,
      legalCategory: category,
      keywords: this.extractKeywords(text),
      summary: this.summarizeLocally(doc.title, text),
      keyPhrases: this.extractKeyPhrases(text),
      importantClauses: this.extractImportantClauses(text),
      metadata: {
        fallback: true,
        reason: "OPENAI_API_KEY not configured or AI call failed",
      },
      isProcessedByAI: false,
    };
  }

  private classifyLocally(text: string): string {
    const value = text.toLowerCase();
    const rules: Array<[string, string[]]> = [
      ["LABOUR_LAW", ["lao động", "người lao động", "hợp đồng lao động"]],
      ["TRAFFIC_LAW", ["giao thông", "đường bộ", "phương tiện"]],
      ["LAND_LAW", ["đất đai", "quyền sử dụng đất"]],
      ["TAX_LAW", ["thuế", "hóa đơn", "ngân sách"]],
      ["CRIMINAL_LAW", ["hình sự", "tội phạm", "hình phạt"]],
      ["CIVIL_LAW", ["dân sự", "hợp đồng", "thừa kế"]],
      ["COMMERCIAL_LAW", ["doanh nghiệp", "thương mại", "đầu tư"]],
      ["ADMINISTRATIVE_LAW", ["hành chính", "xử phạt", "quyết định"]],
    ];

    return rules.find(([, keywords]) => keywords.some((keyword) => value.includes(keyword)))?.[0] || "OTHER";
  }

  private extractKeywords(text: string): string[] {
    const candidates = [
      "luật",
      "nghị định",
      "thông tư",
      "quyết định",
      "quyền",
      "nghĩa vụ",
      "xử phạt",
      "hiệu lực",
      "cơ quan ban hành",
      "điều khoản",
    ];
    const value = text.toLowerCase();
    return candidates.filter((keyword) => value.includes(keyword)).slice(0, 10);
  }

  private summarizeLocally(title: string, text: string): string {
    const firstSentence = text.split(/[.!?]/).find((item) => item.trim().length > 40);
    return `${title}. ${firstSentence?.trim() || text.slice(0, 400)}`.slice(0, 800);
  }

  private extractKeyPhrases(text: string): string[] {
    const matches = text.match(/(?:Điều|Chương|Mục)\s+\d+[^\n.]{0,120}/giu);
    return (matches || []).slice(0, 8).map((item) => item.trim());
  }

  private extractImportantClauses(text: string): string[] {
    return this.extractKeyPhrases(text).slice(0, 5);
  }

  async processBatch(docs: ICrawledDocument[]): Promise<ProcessedDocument[]> {
    const results: ProcessedDocument[] = [];

    for (const doc of docs) {
      const processed = await this.processDocument(doc);
      results.push(processed);

      if (this.openai) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }

    return results;
  }
}
