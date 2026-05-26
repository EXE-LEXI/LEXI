import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LessonOptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  sortOrder: number;
}

export class LessonQuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ type: [LessonOptionResponseDto] })
  options: LessonOptionResponseDto[];
}

export class LessonModuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class LessonCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class LessonDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  content: string | null;

  @ApiPropertyOptional({ nullable: true })
  videoUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  sourceTitle: string | null;

  @ApiPropertyOptional({ nullable: true })
  sourceUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  legalDocumentNo: string | null;

  @ApiPropertyOptional({ nullable: true })
  effectiveDate: Date | null;

  @ApiPropertyOptional({ nullable: true })
  reviewedAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  reviewerNote: string | null;

  @ApiProperty({ type: LessonModuleResponseDto })
  module: LessonModuleResponseDto;

  @ApiProperty({ type: LessonCategoryResponseDto })
  category: LessonCategoryResponseDto;

  @ApiProperty({ type: [LessonQuestionResponseDto] })
  questions: LessonQuestionResponseDto[];
}
