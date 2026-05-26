import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from "../../../../../common/dto/pagination-meta.dto";

export class ReviewMistakeOptionDto {
  id: string;
  text: string;
}

export class ReviewMistakeLessonDto {
  id: string;
  title: string;
}

export class ReviewMistakeModuleDto {
  id: string;
  title: string;
}

export class ReviewMistakeCategoryDto {
  id: string;
  title: string;
}

export class ReviewMistakeAttemptDto {
  id: string;
  score: number;
  finishedAt: Date | null;
}

export class ReviewMistakeItemDto {
  questionId: string;
  questionText: string;
  explanation: string | null;
  selectedOption: ReviewMistakeOptionDto;
  correctOption: ReviewMistakeOptionDto | null;
  lesson: ReviewMistakeLessonDto;
  module: ReviewMistakeModuleDto;
  category: ReviewMistakeCategoryDto;
  lastWrongAt: Date;
  attempt: ReviewMistakeAttemptDto;
}

export class ReviewMistakesResponseDto {
  items: ReviewMistakeItemDto[];
  meta: PaginationMetaDto;
}

export type ReviewMistakesListResponseDto =
  PaginatedResponseDto<ReviewMistakeItemDto>;
