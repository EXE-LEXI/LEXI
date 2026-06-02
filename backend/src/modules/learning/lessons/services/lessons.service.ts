import { Injectable } from "@nestjs/common";
import { LessonDetailResponseDto } from "../dto/response/lesson-detail-response.dto";
import { QuizSubmissionResponseDto } from "../dto/response/quiz-submission-response.dto";
import { LessonQueryService } from "./lesson-query.service";
import { LessonProgressService } from "./lesson-progress.service";
import { QuizSubmissionService } from "./quiz-submission.service";
import { QuizSubmissionAnswer } from "../interfaces/quiz-submission.types";

@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonQueryService: LessonQueryService,
    private readonly lessonProgressService: LessonProgressService,
    private readonly quizSubmissionService: QuizSubmissionService
  ) {}

  async getLessonDetail(
    id: string,
    userId: string
  ): Promise<LessonDetailResponseDto> {
    const lesson = await this.lessonQueryService.getLessonDetail(id);
    await this.lessonProgressService.markLessonStarted(userId, id);
    return lesson;
  }

  async submitQuiz(
    lessonId: string,
    userId: string,
    answers: QuizSubmissionAnswer[]
  ): Promise<QuizSubmissionResponseDto> {
    return this.quizSubmissionService.submitQuiz(lessonId, userId, answers);
  }
}
