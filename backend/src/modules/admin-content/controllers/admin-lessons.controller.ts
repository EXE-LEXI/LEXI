import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CreateAdminQuestionDto } from "../dto/request/create-admin-question.dto";
import { GetAdminLessonsQueryDto } from "../dto/request/get-admin-lessons-query.dto";
import { UpdateAdminLessonDto } from "../dto/request/update-admin-lesson.dto";
import { UpdateAdminQuestionDto } from "../dto/request/update-admin-question.dto";
import {
  AdminLessonDetailResponseDto,
  AdminLessonListResponseDto,
  AdminQuestionResponseDto,
} from "../dto/response/admin-lesson-response.dto";
import { AdminContentService } from "../services/admin-content.service";

@ApiTags("admin-content")
@ApiBearerAuth()
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminLessonsController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get("lessons")
  @ApiOperation({ summary: "List lessons for content operations" })
  @ApiOkResponse({ type: AdminLessonListResponseDto })
  getLessons(
    @Query() query: GetAdminLessonsQueryDto
  ): Promise<AdminLessonListResponseDto> {
    return this.adminContentService.getLessons(query);
  }

  @Get("lessons/:lessonId")
  @ApiOperation({ summary: "Get admin lesson detail" })
  @ApiOkResponse({ type: AdminLessonDetailResponseDto })
  getLesson(
    @Param("lessonId") lessonId: string
  ): Promise<AdminLessonDetailResponseDto> {
    return this.adminContentService.getLesson(lessonId);
  }

  @Patch("lessons/:lessonId")
  @ApiOperation({ summary: "Update lesson content and legal metadata" })
  @ApiOkResponse({ type: AdminLessonDetailResponseDto })
  updateLesson(
    @Param("lessonId") lessonId: string,
    @Body() updateDto: UpdateAdminLessonDto
  ): Promise<AdminLessonDetailResponseDto> {
    return this.adminContentService.updateLesson(lessonId, updateDto);
  }

  @Get("lessons/:lessonId/questions")
  @ApiOperation({ summary: "List quiz questions for a lesson" })
  @ApiOkResponse({ type: AdminQuestionResponseDto, isArray: true })
  getQuestions(
    @Param("lessonId") lessonId: string
  ): Promise<AdminQuestionResponseDto[]> {
    return this.adminContentService.getQuestions(lessonId);
  }

  @Post("lessons/:lessonId/questions")
  @ApiOperation({ summary: "Create a quiz question for a lesson" })
  @ApiOkResponse({ type: AdminQuestionResponseDto })
  createQuestion(
    @Param("lessonId") lessonId: string,
    @Body() createDto: CreateAdminQuestionDto
  ): Promise<AdminQuestionResponseDto> {
    return this.adminContentService.createQuestion(lessonId, createDto);
  }

  @Patch("questions/:questionId")
  @ApiOperation({ summary: "Update a quiz question and its options" })
  @ApiOkResponse({ type: AdminQuestionResponseDto })
  updateQuestion(
    @Param("questionId") questionId: string,
    @Body() updateDto: UpdateAdminQuestionDto
  ): Promise<AdminQuestionResponseDto> {
    return this.adminContentService.updateQuestion(questionId, updateDto);
  }

  @Delete("questions/:questionId")
  @ApiOperation({ summary: "Delete a quiz question" })
  async deleteQuestion(
    @Param("questionId") questionId: string
  ): Promise<{ deleted: true }> {
    await this.adminContentService.deleteQuestion(questionId);
    return { deleted: true };
  }
}
