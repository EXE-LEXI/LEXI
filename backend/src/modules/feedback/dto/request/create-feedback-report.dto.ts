import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FeedbackReportCategory } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateFeedbackReportDto {
  @ApiProperty({ enum: FeedbackReportCategory })
  @IsEnum(FeedbackReportCategory)
  category: FeedbackReportCategory;

  @ApiProperty({ example: "Lesson source metadata looks incorrect" })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(160)
  subject: string;

  @ApiProperty({
    example:
      "The lesson cites the wrong legal document number. Please review this content before wider release.",
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(4000)
  message: string;

  @ApiPropertyOptional({ example: "/lessons/abc123" })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(300)
  pagePath?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
