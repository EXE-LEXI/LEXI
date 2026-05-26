import { Injectable } from "@nestjs/common";
import { LessonDetailResponseDto } from "../dto/response/lesson-detail-response.dto";
import { QuizSubmissionResponseDto } from "../dto/response/quiz-submission-response.dto";
import { LessonQueryService } from "./lesson-query.service";
import { QuizSubmissionService } from "./quiz-submission.service";
import { QuizSubmissionAnswer } from "../interfaces/quiz-submission.types";

@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonQueryService: LessonQueryService,
    private readonly quizSubmissionService: QuizSubmissionService
  ) {}

  async getLessonDetail(id: string): Promise<LessonDetailResponseDto> {
    return this.lessonQueryService.getLessonDetail(id);
  }

  async submitQuiz(
    lessonId: string,
    userId: string,
    answers: QuizSubmissionAnswer[]
  ): Promise<QuizSubmissionResponseDto> {
    return this.quizSubmissionService.submitQuiz(lessonId, userId, answers);
  }
}
