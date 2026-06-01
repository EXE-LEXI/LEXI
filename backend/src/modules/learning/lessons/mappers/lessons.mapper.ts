import { LessonDetailResponseDto } from "../dto/response/lesson-detail-response.dto";
import { QuizSubmissionResponseDto } from "../dto/response/quiz-submission-response.dto";

export class LessonsMapper {
  static toLessonDetailResponse(lesson: any): LessonDetailResponseDto {
    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      sourceTitle: lesson.sourceTitle,
      sourceUrl: lesson.sourceUrl,
      legalDocumentNo: lesson.legalDocumentNo,
      effectiveDate: lesson.effectiveDate,
      reviewedAt: lesson.reviewedAt,
      reviewerNote: lesson.reviewerNote,
      module: {
        id: lesson.module.id,
        title: lesson.module.title,
      },
      category: {
        id: lesson.module.category.id,
        title: lesson.module.category.title,
      },
      questions: lesson.questions.map((question) => ({
        id: question.id,
        text: question.questionText,
        sortOrder: question.sortOrder,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.optionText,
          sortOrder: option.sortOrder,
        })),
      })),
    };
  }

  static toQuizSubmissionResponse(submission: any): QuizSubmissionResponseDto {
    return {
      attemptId: submission.attemptId,
      score: submission.score,
      correctCount: submission.correctCount,
      wrongCount: Math.max(
        submission.totalQuestions - submission.correctCount,
        0
      ),
      totalQuestions: submission.totalQuestions,
      xpAwarded: submission.xpAwarded,
      coinsAwarded: submission.coinsAwarded ?? 0,
      coinBalance: submission.coinBalance ?? 0,
      bestScore: submission.bestScore,
      completedAt: submission.completedAt,
      results: submission.results.map((result) => ({
        questionId: result.questionId,
        selectedOptionId: result.selectedOptionId,
        isCorrect: result.isCorrect,
        correctOptionId: result.correctOptionId,
        explanation: result.explanation,
      })),
      newBadges: submission.newBadges ?? [],
    };
  }
}
