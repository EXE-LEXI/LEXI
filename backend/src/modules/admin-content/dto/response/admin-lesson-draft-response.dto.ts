import { ApiProperty } from "@nestjs/swagger";
import {
  AiGenerationStatus,
  AiGenerationType,
  LessonDraftStatus,
  LessonReviewStatus,
} from "@prisma/client";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class AdminLessonDraftSourceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  legalDocumentNo: string | null;

  @ApiProperty({ nullable: true })
  sourceUrl: string | null;
}

export class AdminLessonDraftModuleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class AdminLessonDraftJobDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: AiGenerationType })
  type: AiGenerationType;

  @ApiProperty({ enum: AiGenerationStatus })
  status: AiGenerationStatus;

  @ApiProperty()
  promptVersion: string;

  @ApiProperty()
  model: string;
}

export class AdminLessonDraftCreatedLessonDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: LessonReviewStatus })
  reviewStatus: LessonReviewStatus;

  @ApiProperty()
  isActive: boolean;
}

export class AdminLessonDraftOptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  sortOrder: number;
}

export class AdminLessonDraftQuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ nullable: true })
  explanation: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ type: AdminLessonDraftOptionResponseDto, isArray: true })
  options: AdminLessonDraftOptionResponseDto[];
}

export class AdminLessonDraftResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: AdminLessonDraftJobDto, nullable: true })
  generationJob: AdminLessonDraftJobDto | null;

  @ApiProperty({ type: AdminLessonDraftSourceDto })
  sourceDocument: AdminLessonDraftSourceDto;

  @ApiProperty({ type: AdminLessonDraftModuleDto, nullable: true })
  module: AdminLessonDraftModuleDto | null;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true })
  videoScript: string | null;

  @ApiProperty({ nullable: true })
  videoPrompt: string | null;

  @ApiProperty({ nullable: true })
  reviewerNote: string | null;

  @ApiProperty({ enum: LessonDraftStatus })
  status: LessonDraftStatus;

  @ApiProperty({ type: AdminLessonDraftCreatedLessonDto, nullable: true })
  createdLesson: AdminLessonDraftCreatedLessonDto | null;

  @ApiProperty({ type: AdminLessonDraftQuestionResponseDto, isArray: true })
  questions: AdminLessonDraftQuestionResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminLessonDraftListResponseDto
  implements PaginatedResponseDto<AdminLessonDraftResponseDto>
{
  @ApiProperty({ type: AdminLessonDraftResponseDto, isArray: true })
  items: AdminLessonDraftResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<AdminLessonDraftResponseDto>["meta"];
}
