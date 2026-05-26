import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";
import { LessonReviewStatus } from "@prisma/client";

export class UpdateAdminLessonDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  videoUrl?: string | null;

  @IsOptional()
  @IsString()
  sourceTitle?: string | null;

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
  @IsISO8601()
  reviewedAt?: string | null;

  @IsOptional()
  @IsString()
  reviewerNote?: string | null;

  @IsOptional()
  @IsEnum(LessonReviewStatus)
  reviewStatus?: LessonReviewStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
