import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from "class-validator";
import { LessonReviewStatus } from "@prisma/client";

export class CreateAdminLessonDto {
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @IsOptional()
  @IsString()
  slug?: string | null;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  content?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  videoUrl?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  sourceUrl?: string | null;

  @IsOptional()
  @IsString()
  sourceTitle?: string | null;

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
  @Transform(({ value }) =>
    value === undefined || value === "" ? undefined : Number.parseInt(value, 10)
  )
  @IsInt()
  @Min(0)
  sortOrder?: number;

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
