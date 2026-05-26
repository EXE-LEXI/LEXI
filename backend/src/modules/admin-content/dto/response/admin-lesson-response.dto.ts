import { ApiProperty } from "@nestjs/swagger";
import { LessonReviewStatus } from "@prisma/client";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class AdminContentCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class AdminContentModuleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: AdminContentCategoryDto })
  category: AdminContentCategoryDto;
}

export class AdminOptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  sortOrder: number;
}

export class AdminQuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ nullable: true })
  explanation: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ type: AdminOptionResponseDto, isArray: true })
  options: AdminOptionResponseDto[];
}

export class AdminLessonSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  sourceTitle: string | null;

  @ApiProperty({ nullable: true })
  sourceUrl: string | null;

  @ApiProperty({ nullable: true })
  legalDocumentNo: string | null;

  @ApiProperty({ nullable: true })
  effectiveDate: Date | null;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({ nullable: true })
  reviewerNote: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ enum: LessonReviewStatus })
  reviewStatus: LessonReviewStatus;

  @ApiProperty({ type: AdminContentModuleDto })
  module: AdminContentModuleDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminLessonDetailResponseDto extends AdminLessonSummaryResponseDto {
  @ApiProperty({ nullable: true })
  content: string | null;

  @ApiProperty({ nullable: true })
  videoUrl: string | null;

  @ApiProperty({ type: AdminQuestionResponseDto, isArray: true })
  questions: AdminQuestionResponseDto[];
}

export class AdminLessonListResponseDto
  implements PaginatedResponseDto<AdminLessonSummaryResponseDto>
{
  @ApiProperty({ type: AdminLessonSummaryResponseDto, isArray: true })
  items: AdminLessonSummaryResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<AdminLessonSummaryResponseDto>["meta"];
}
