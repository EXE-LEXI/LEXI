import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { LessonDetailResponseDto } from "../dto/response/lesson-detail-response.dto";
import { LessonsMapper } from "../mappers/lessons.mapper";
import { LessonsRepository } from "../repositories/lessons.repository";

@Injectable()
export class LessonQueryService {
  constructor(private readonly lessonsRepository: LessonsRepository) {}

  async getLessonDetail(id: string): Promise<LessonDetailResponseDto> {
    const lesson = await this.lessonsRepository.findActiveLessonDetail(id);

    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    return LessonsMapper.toLessonDetailResponse(lesson);
  }

  async getLessonForSubmission(lessonId: string) {
    const lesson = await this.lessonsRepository.findActiveLessonForSubmission(
      lessonId
    );

    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    if (lesson.questions.length === 0) {
      throw new BadRequestException("Lesson has no quiz questions");
    }

    return lesson;
  }
}
