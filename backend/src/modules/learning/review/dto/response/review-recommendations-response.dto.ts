export enum ReviewRecommendationReasonCode {
  RECENT_MISTAKE = "RECENT_MISTAKE",
  LOW_SCORE = "LOW_SCORE",
  IN_PROGRESS = "IN_PROGRESS",
}

export class ReviewRecommendationLessonDto {
  id: string;
  title: string;
}

export class ReviewRecommendationModuleDto {
  id: string;
  title: string;
}

export class ReviewRecommendationCategoryDto {
  id: string;
  title: string;
}

export class ReviewRecommendationItemDto {
  lesson: ReviewRecommendationLessonDto;
  module: ReviewRecommendationModuleDto;
  category: ReviewRecommendationCategoryDto;
  reasonCode: ReviewRecommendationReasonCode;
  reasonText: string;
  questionId: string | null;
  score: number | null;
  lastActivityAt: Date | null;
}

export class ReviewRecommendationsResponseDto {
  items: ReviewRecommendationItemDto[];
}
