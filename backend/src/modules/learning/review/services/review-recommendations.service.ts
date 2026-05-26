import { Injectable } from "@nestjs/common";
import {
  ReviewRecommendationItemDto,
  ReviewRecommendationReasonCode,
  ReviewRecommendationsResponseDto,
} from "../dto/response/review-recommendations-response.dto";
import {
  InProgressRecommendationRecord,
  LowScoreRecommendationRecord,
  RecentMistakeRecommendationRecord,
  RecommendationLessonRecord,
  ReviewRecommendationsRepository,
} from "../repositories/review-recommendations.repository";

const DEFAULT_RECOMMENDATION_LIMIT = 5;
const RECOMMENDATION_SOURCE_SCAN_LIMIT = 20;
const LOW_SCORE_THRESHOLD = 80;

type Candidate = ReviewRecommendationItemDto & {
  priority: number;
  rankScore: number;
};

@Injectable()
export class ReviewRecommendationsService {
  constructor(
    private readonly reviewRecommendationsRepository: ReviewRecommendationsRepository
  ) {}

  async getRecommendations(
    userId: string,
    limit = DEFAULT_RECOMMENDATION_LIMIT
  ): Promise<ReviewRecommendationsResponseDto> {
    const [recentMistakes, lowScoreAttempts, inProgressLessons] =
      await Promise.all([
        this.reviewRecommendationsRepository.findRecentMistakes(
          userId,
          RECOMMENDATION_SOURCE_SCAN_LIMIT
        ),
        this.reviewRecommendationsRepository.findLowScoreAttempts(
          userId,
          RECOMMENDATION_SOURCE_SCAN_LIMIT,
          LOW_SCORE_THRESHOLD
        ),
        this.reviewRecommendationsRepository.findInProgressLessons(
          userId,
          RECOMMENDATION_SOURCE_SCAN_LIMIT
        ),
      ]);

    const bestByLesson = new Map<string, Candidate>();

    const addCandidate = (candidate: Candidate) => {
      const existing = bestByLesson.get(candidate.lesson.id);
      if (
        !existing ||
        candidate.priority > existing.priority ||
        (candidate.priority === existing.priority &&
          candidate.rankScore > existing.rankScore)
      ) {
        bestByLesson.set(candidate.lesson.id, candidate);
      }
    };

    for (const mistake of recentMistakes) {
      addCandidate(this.fromRecentMistake(mistake));
    }

    for (const attempt of lowScoreAttempts) {
      addCandidate(this.fromLowScoreAttempt(attempt));
    }

    for (const progress of inProgressLessons) {
      addCandidate(this.fromInProgress(progress));
    }

    const items = Array.from(bestByLesson.values())
      .sort((left, right) => {
        if (right.priority !== left.priority) {
          return right.priority - left.priority;
        }
        if (right.rankScore !== left.rankScore) {
          return right.rankScore - left.rankScore;
        }
        return left.lesson.title.localeCompare(right.lesson.title);
      })
      .slice(0, limit)
      .map(({ priority: _priority, rankScore: _rankScore, ...item }) => item);

    return { items };
  }

  private fromRecentMistake(
    record: RecentMistakeRecommendationRecord
  ): Candidate {
    const activityAt = record.createdAt;

    return {
      ...this.baseItem(record.question.lesson),
      reasonCode: ReviewRecommendationReasonCode.RECENT_MISTAKE,
      reasonText: "Bạn có câu trả lời sai gần đây trong bài này.",
      questionId: record.questionId,
      score: record.attempt.score,
      lastActivityAt: activityAt,
      priority: 3,
      rankScore: activityAt.getTime(),
    };
  }

  private fromLowScoreAttempt(record: LowScoreRecommendationRecord): Candidate {
    const activityAt = record.finishedAt ?? null;

    return {
      ...this.baseItem(record.lesson),
      reasonCode: ReviewRecommendationReasonCode.LOW_SCORE,
      reasonText: "Điểm gần đây còn thấp, nên ôn lại bài này.",
      questionId: null,
      score: record.score,
      lastActivityAt: activityAt,
      priority: 2,
      rankScore: 100 - record.score,
    };
  }

  private fromInProgress(record: InProgressRecommendationRecord): Candidate {
    const activityAt = record.updatedAt;

    return {
      ...this.baseItem(record.lesson),
      reasonCode: ReviewRecommendationReasonCode.IN_PROGRESS,
      reasonText: "Bạn đang học dở bài này.",
      questionId: null,
      score: record.lastScore,
      lastActivityAt: activityAt,
      priority: 1,
      rankScore: activityAt.getTime(),
    };
  }

  private baseItem(lesson: RecommendationLessonRecord) {
    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
      },
      module: {
        id: lesson.module.id,
        title: lesson.module.title,
      },
      category: {
        id: lesson.module.category.id,
        title: lesson.module.category.title,
      },
    };
  }
}
