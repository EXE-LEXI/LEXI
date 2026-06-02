import { Injectable, NotFoundException } from "@nestjs/common";
import {
  DEFAULT_MODULES_LIMIT,
  DEFAULT_MODULES_PAGE,
} from "../../modules/constants/modules.constants";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";
import { CreateLessonDiscussionDto } from "../dto/request/create-lesson-discussion.dto";
import { CreateLessonDiscussionReplyDto } from "../dto/request/create-lesson-discussion-reply.dto";
import { CreateLessonNoteDto } from "../dto/request/create-lesson-note.dto";
import {
  LessonDiscussionResponseDto,
  LessonDiscussionsListResponseDto,
  LessonNoteResponseDto,
  LessonNotesListResponseDto,
} from "../dto/response/lesson-interaction-response.dto";
import { LessonInteractionsMapper } from "../mappers/lesson-interactions.mapper";
import { LessonInteractionsRepository } from "../repositories/lesson-interactions.repository";

@Injectable()
export class LessonInteractionsService {
  constructor(
    private readonly lessonInteractionsRepository: LessonInteractionsRepository
  ) {}

  async getNotes(
    userId: string,
    lessonId: string,
    query: PaginationQueryDto
  ): Promise<LessonNotesListResponseDto> {
    await this.assertLessonExists(lessonId);
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, notes] = await this.lessonInteractionsRepository.findNotes({
      userId,
      lessonId,
      page,
      limit,
    });
    return LessonInteractionsMapper.toPaginatedNotes({
      notes,
      total,
      page,
      limit,
    });
  }

  async createNote(
    userId: string,
    lessonId: string,
    dto: CreateLessonNoteDto
  ): Promise<LessonNoteResponseDto> {
    await this.assertLessonExists(lessonId);
    const note = await this.lessonInteractionsRepository.createNote({
      userId,
      lessonId,
      text: dto.text.trim(),
      videoTimeSeconds: dto.videoTimeSeconds,
    });
    return LessonInteractionsMapper.toNote(note);
  }

  async deleteNote(userId: string, noteId: string): Promise<{ deleted: true }> {
    const result = await this.lessonInteractionsRepository.deleteNote({
      userId,
      noteId,
    });
    if (result.count === 0) {
      throw new NotFoundException("Lesson note not found");
    }
    return { deleted: true };
  }

  async getDiscussions(
    lessonId: string,
    query: PaginationQueryDto
  ): Promise<LessonDiscussionsListResponseDto> {
    await this.assertLessonExists(lessonId);
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, discussions] =
      await this.lessonInteractionsRepository.findDiscussions({
        lessonId,
        page,
        limit,
      });
    return LessonInteractionsMapper.toPaginatedDiscussions({
      discussions,
      total,
      page,
      limit,
    });
  }

  async createDiscussion(
    userId: string,
    lessonId: string,
    dto: CreateLessonDiscussionDto
  ): Promise<LessonDiscussionResponseDto> {
    await this.assertLessonExists(lessonId);
    const discussion =
      await this.lessonInteractionsRepository.createDiscussion({
        userId,
        lessonId,
        question: dto.question.trim(),
      });
    return LessonInteractionsMapper.toDiscussion(discussion);
  }

  async createReply(
    userId: string,
    discussionId: string,
    dto: CreateLessonDiscussionReplyDto
  ): Promise<LessonDiscussionResponseDto> {
    const discussion =
      await this.lessonInteractionsRepository.findDiscussionById(discussionId);
    if (!discussion) {
      throw new NotFoundException("Lesson discussion not found");
    }

    const updatedDiscussion =
      await this.lessonInteractionsRepository.createReply({
        userId,
        discussionId,
        body: dto.body.trim(),
      });

    return LessonInteractionsMapper.toDiscussion(updatedDiscussion);
  }

  private async assertLessonExists(lessonId: string): Promise<void> {
    const count = await this.lessonInteractionsRepository.countActiveLesson(
      lessonId
    );
    if (count === 0) {
      throw new NotFoundException("Lesson not found");
    }
  }
}
