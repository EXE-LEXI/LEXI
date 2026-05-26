import { LegalSourceCrawlStatus } from "@prisma/client";
import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

export class UpdateAdminLegalSourceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  sourceUrl?: string | null;

  @IsOptional()
  @IsString()
  legalDocumentNo?: string | null;

  @IsOptional()
  @IsISO8601()
  effectiveDate?: string | null;

  @IsOptional()
  @IsString()
  rawText?: string;

  @IsOptional()
  @IsString()
  normalizedText?: string | null;

  @IsOptional()
  @IsEnum(LegalSourceCrawlStatus)
  crawlStatus?: LegalSourceCrawlStatus;

  @IsOptional()
  @IsISO8601()
  crawledAt?: string | null;
}
