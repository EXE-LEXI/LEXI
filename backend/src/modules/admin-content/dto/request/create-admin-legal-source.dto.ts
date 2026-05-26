import { LegalSourceCrawlStatus } from "@prisma/client";
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

export class CreateAdminLegalSourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  sourceUrl?: string | null;

  @IsOptional()
  @IsString()
  legalDocumentNo?: string | null;

  @IsOptional()
  @IsISO8601()
  effectiveDate?: string | null;

  @IsString()
  @IsNotEmpty()
  rawText: string;

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
