import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { CreateLessonDiscussionDto } from "../dto/request/create-lesson-discussion.dto";
import { CreateLessonDiscussionReplyDto } from "../dto/request/create-lesson-discussion-reply.dto";
import { CreateLessonNoteDto } from "../dto/request/create-lesson-note.dto";
import {
  LessonDiscussionResponseDto,
  LessonDiscussionsListResponseDto,
  LessonNoteResponseDto,
  LessonNotesListResponseDto,
} from "../dto/response/lesson-interaction-response.dto";
import { LessonInteractionsService } from "../services/lesson-interactions.service";

@ApiTags("lessons")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("lessons")
export class LessonInteractionsController {
  constructor(
    private readonly lessonInteractionsService: LessonInteractionsService
  ) {}

  @Get(":lessonId/notes")
  @ApiOperation({ summary: "Get personal notes for a lesson" })
  @ApiOkResponse({ type: LessonNotesListResponseDto })
  getNotes(
    @CurrentUser() user: AuthUserDto,
    @Param("lessonId") lessonId: string,
    @Query() query: PaginationQueryDto
  ): Promise<LessonNotesListResponseDto> {
    return this.lessonInteractionsService.getNotes(user.id, lessonId, query);
  }

  @Post(":lessonId/notes")
  @ApiOperation({ summary: "Create a personal note for a lesson" })
  @ApiOkResponse({ type: LessonNoteResponseDto })
  createNote(
    @CurrentUser() user: AuthUserDto,
    @Param("lessonId") lessonId: string,
    @Body() dto: CreateLessonNoteDto
  ): Promise<LessonNoteResponseDto> {
    return this.lessonInteractionsService.createNote(user.id, lessonId, dto);
  }

  @Delete("notes/:noteId")
  @ApiOperation({ summary: "Delete a personal lesson note" })
  deleteNote(
    @CurrentUser() user: AuthUserDto,
    @Param("noteId") noteId: string
  ): Promise<{ deleted: true }> {
    return this.lessonInteractionsService.deleteNote(user.id, noteId);
  }

  @Get(":lessonId/discussions")
  @ApiOperation({ summary: "Get lesson discussion threads" })
  @ApiOkResponse({ type: LessonDiscussionsListResponseDto })
  getDiscussions(
    @Param("lessonId") lessonId: string,
    @Query() query: PaginationQueryDto
  ): Promise<LessonDiscussionsListResponseDto> {
    return this.lessonInteractionsService.getDiscussions(lessonId, query);
  }

  @Post(":lessonId/discussions")
  @ApiOperation({ summary: "Create a lesson discussion thread" })
  @ApiOkResponse({ type: LessonDiscussionResponseDto })
  createDiscussion(
    @CurrentUser() user: AuthUserDto,
    @Param("lessonId") lessonId: string,
    @Body() dto: CreateLessonDiscussionDto
  ): Promise<LessonDiscussionResponseDto> {
    return this.lessonInteractionsService.createDiscussion(
      user.id,
      lessonId,
      dto
    );
  }

  @Post("discussions/:discussionId/replies")
  @ApiOperation({ summary: "Reply to a lesson discussion thread" })
  @ApiOkResponse({ type: LessonDiscussionResponseDto })
  createReply(
    @CurrentUser() user: AuthUserDto,
    @Param("discussionId") discussionId: string,
    @Body() dto: CreateLessonDiscussionReplyDto
  ): Promise<LessonDiscussionResponseDto> {
    return this.lessonInteractionsService.createReply(
      user.id,
      discussionId,
      dto
    );
  }
}
