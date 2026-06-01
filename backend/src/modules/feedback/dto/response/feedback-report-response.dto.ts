import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  FeedbackReportCategory,
  FeedbackReportStatus,
} from "@prisma/client";
import { PaginationMetaDto } from "../../../../common/dto/pagination-meta.dto";

export class FeedbackReportUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  fullName: string | null;
}

export class FeedbackReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: FeedbackReportCategory })
  category: FeedbackReportCategory;

  @ApiProperty({ enum: FeedbackReportStatus })
  status: FeedbackReportStatus;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ nullable: true })
  pagePath: string | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  metadata: unknown;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: FeedbackReportUserResponseDto, nullable: true })
  user?: FeedbackReportUserResponseDto | null;
}

export class FeedbackReportListResponseDto {
  @ApiProperty({ type: [FeedbackReportResponseDto] })
  items: FeedbackReportResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
