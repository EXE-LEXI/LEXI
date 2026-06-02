import { buildPaginationMeta } from "../../../../common/dto/pagination-meta.dto";
import {
  LessonDiscussionResponseDto,
  LessonDiscussionsListResponseDto,
  LessonNoteResponseDto,
  LessonNotesListResponseDto,
} from "../dto/response/lesson-interaction-response.dto";

export class LessonInteractionsMapper {
  static toNote(note: any): LessonNoteResponseDto {
    return {
      id: note.id,
      lessonId: note.lessonId,
      text: note.text,
      videoTimeSeconds: note.videoTimeSeconds,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  static toPaginatedNotes(params: {
    notes: any[];
    total: number;
    page: number;
    limit: number;
  }): LessonNotesListResponseDto {
    return {
      items: params.notes.map((note) => this.toNote(note)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toDiscussion(discussion: any): LessonDiscussionResponseDto {
    return {
      id: discussion.id,
      lessonId: discussion.lessonId,
      question: discussion.question,
      isSolved: discussion.isSolved,
      author: this.toAuthor(discussion.user),
      replies: discussion.replies.map((reply) => ({
        id: reply.id,
        body: reply.body,
        isAccepted: reply.isAccepted,
        author: this.toAuthor(reply.user),
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
    };
  }

  static toPaginatedDiscussions(params: {
    discussions: any[];
    total: number;
    page: number;
    limit: number;
  }): LessonDiscussionsListResponseDto {
    return {
      items: params.discussions.map((discussion) =>
        this.toDiscussion(discussion)
      ),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  private static toAuthor(user: any) {
    return {
      id: user.id,
      fullName: user.profile?.fullName ?? user.email,
      avatarUrl: user.profile?.avatarUrl ?? null,
    };
  }
}
