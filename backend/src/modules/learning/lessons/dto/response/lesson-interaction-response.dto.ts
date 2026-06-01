import { PaginatedResponseDto, PaginationMetaDto } from "../../../../../common/dto/pagination-meta.dto";

export class LessonNoteResponseDto {
  id: string;
  lessonId: string;
  text: string;
  videoTimeSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class LessonNotesListResponseDto
  implements PaginatedResponseDto<LessonNoteResponseDto>
{
  items: LessonNoteResponseDto[];
  meta: PaginationMetaDto;
}

export class LessonDiscussionAuthorResponseDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export class LessonDiscussionReplyResponseDto {
  id: string;
  body: string;
  isAccepted: boolean;
  author: LessonDiscussionAuthorResponseDto;
  createdAt: Date;
  updatedAt: Date;
}

export class LessonDiscussionResponseDto {
  id: string;
  lessonId: string;
  question: string;
  isSolved: boolean;
  author: LessonDiscussionAuthorResponseDto;
  replies: LessonDiscussionReplyResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class LessonDiscussionsListResponseDto
  implements PaginatedResponseDto<LessonDiscussionResponseDto>
{
  items: LessonDiscussionResponseDto[];
  meta: PaginationMetaDto;
}
