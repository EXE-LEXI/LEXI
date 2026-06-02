import { ApiPropertyOptional } from "@nestjs/swagger";
import { FeedbackReportCategory, FeedbackReportStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetFeedbackReportsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: FeedbackReportStatus })
  @IsOptional()
  @IsEnum(FeedbackReportStatus)
  status?: FeedbackReportStatus;

  @ApiPropertyOptional({ enum: FeedbackReportCategory })
  @IsOptional()
  @IsEnum(FeedbackReportCategory)
  category?: FeedbackReportCategory;

  @ApiPropertyOptional({ example: "source metadata" })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
