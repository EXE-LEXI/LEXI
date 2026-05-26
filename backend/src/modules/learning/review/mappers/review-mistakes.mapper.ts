import { buildPaginationMeta } from "../../../../common/dto/pagination-meta.dto";
import { ReviewMistakesResponseDto } from "../dto/response/review-mistakes-response.dto";
import { ReviewMistakeRecord } from "../repositories/review-mistakes.repository";

export class ReviewMistakesMapper {
  static toResponse(
    latestMistakes: ReviewMistakeRecord[],
    total: number,
    page: number,
    limit: number
  ): ReviewMistakesResponseDto {
    return {
      items: latestMistakes.map((answer) => {
        const correctOption = answer.question.options[0] ?? null;

        return {
          questionId: answer.questionId,
          questionText: answer.question.questionText,
          explanation: answer.question.explanation,
          selectedOption: {
            id: answer.selectedOption.id,
            text: answer.selectedOption.optionText,
          },
          correctOption: correctOption
            ? {
                id: correctOption.id,
                text: correctOption.optionText,
              }
            : null,
          lesson: {
            id: answer.question.lesson.id,
            title: answer.question.lesson.title,
          },
          module: {
            id: answer.question.lesson.module.id,
            title: answer.question.lesson.module.title,
          },
          category: {
            id: answer.question.lesson.module.category.id,
            title: answer.question.lesson.module.category.title,
          },
          lastWrongAt: answer.createdAt,
          attempt: {
            id: answer.attempt.id,
            score: answer.attempt.score,
            finishedAt: answer.attempt.finishedAt,
          },
        };
      }),
      meta: buildPaginationMeta({
        total,
        page,
        limit,
      }),
    };
  }
}
