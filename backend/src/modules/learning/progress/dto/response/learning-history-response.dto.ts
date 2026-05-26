import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from "../../../../../common/dto/pagination-meta.dto";

export class LearningHistoryModuleDto {
  id: string;
  title: string;
}

export class LearningHistoryCategoryDto {
  id: string;
  title: string;
}

export class LearningHistoryItemDto {
  id: string;
  lessonId: string;
  lessonTitle: string;
  module: LearningHistoryModuleDto;
  category: LearningHistoryCategoryDto;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  startedAt: Date;
  finishedAt: Date | null;
}

export class LearningHistoryResponseDto {
  items: LearningHistoryItemDto[];
  meta: PaginationMetaDto;
}

export type LearningHistoryListResponseDto =
  PaginatedResponseDto<LearningHistoryItemDto>;
