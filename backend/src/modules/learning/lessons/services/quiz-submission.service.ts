import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../core/prisma.service";
import { BadgesService } from "../../../gamification/services/badges.service";
import { QuizSubmissionResponseDto } from "../dto/response/quiz-submission-response.dto";
import { LessonProgressService } from "./lesson-progress.service";
import { LessonQueryService } from "./lesson-query.service";
import { LessonsMapper } from "../mappers/lessons.mapper";
import { QuizGradingService } from "./quiz-grading.service";
import { RewardService } from "./reward.service";
import { QuizSubmissionAnswer } from "../interfaces/quiz-submission.types";

@Injectable()
export class QuizSubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lessonQueryService: LessonQueryService,
    private readonly quizGradingService: QuizGradingService,
    private readonly lessonProgressService: LessonProgressService,
    private readonly rewardService: RewardService,
    private readonly badgesService: BadgesService
  ) {}

  async submitQuiz(
    lessonId: string,
    userId: string,
    answers: QuizSubmissionAnswer[]
  ): Promise<QuizSubmissionResponseDto> {
    const lesson = await this.lessonQueryService.getLessonForSubmission(
      lessonId
    );
    const evaluation = this.quizGradingService.gradeQuiz(
      lesson.questions,
      answers
    );
    const now = new Date();

    const submission = await this.prisma.$transaction(async (tx) => {
      const previousBestAttempt = await tx.lessonAttempt.aggregate({
        where: {
          userId,
          lessonId,
        },
        _max: {
          score: true,
        },
      });

      const previousBestScore = previousBestAttempt._max.score ?? 0;
      const xpAwarded = this.rewardService.calculateQuizXpAward(
        evaluation.score,
        previousBestScore
      );

      const createdAttempt = await tx.lessonAttempt.create({
        data: {
          userId,
          lessonId,
          score: evaluation.score,
          totalQuestions: evaluation.totalQuestions,
          correctAnswers: evaluation.correctCount,
          finishedAt: now,
          answers: {
            create: evaluation.normalizedAnswers.map((answer) => ({
              questionId: answer.questionId,
              selectedOptionId: answer.selectedOptionId,
              isCorrect: answer.isCorrect,
            })),
          },
        },
      });

      const completedAt =
        await this.lessonProgressService.upsertLessonCompletion(
          tx,
          userId,
          lessonId,
          evaluation.score,
          now
        );

      await this.rewardService.applyXpAward(tx, userId, xpAwarded);
      const newBadges = await this.badgesService.awardEarnedBadges(
        tx,
        userId,
        now
      );

      return {
        attemptId: createdAttempt.id,
        xpAwarded,
        bestScore: Math.max(previousBestScore, evaluation.score),
        completedAt,
        newBadges,
      };
    });

    return LessonsMapper.toQuizSubmissionResponse({
      attemptId: submission.attemptId,
      score: evaluation.score,
      correctCount: evaluation.correctCount,
      totalQuestions: evaluation.totalQuestions,
      xpAwarded: submission.xpAwarded,
      bestScore: submission.bestScore,
      completedAt: submission.completedAt,
      newBadges: submission.newBadges,
      results: evaluation.normalizedAnswers,
    });
  }
}
