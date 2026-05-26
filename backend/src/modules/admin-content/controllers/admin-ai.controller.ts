import {
  Body,
  Controller,
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
import { CreateLessonFromDraftDto } from "../dto/request/create-lesson-from-draft.dto";
import { GenerateAdminLessonDraftDto } from "../dto/request/generate-admin-lesson-draft.dto";
import { GetAdminLessonDraftsQueryDto } from "../dto/request/get-admin-lesson-drafts-query.dto";
import { UpdateAdminLessonDraftDto } from "../dto/request/update-admin-lesson-draft.dto";
import { AdminLessonDetailResponseDto } from "../dto/response/admin-lesson-response.dto";
import {
  AdminLessonDraftListResponseDto,
  AdminLessonDraftResponseDto,
} from "../dto/response/admin-lesson-draft-response.dto";
import { AdminContentService } from "../services/admin-content.service";

@ApiTags("admin-ai")
@ApiBearerAuth()
@Controller("admin/ai")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAiController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Post("lesson-drafts/generate")
  @ApiOperation({ summary: "Generate a lesson draft from a legal source" })
  @ApiOkResponse({ type: AdminLessonDraftResponseDto })
  generateLessonDraft(
    @Body() dto: GenerateAdminLessonDraftDto
  ): Promise<AdminLessonDraftResponseDto> {
    return this.adminContentService.generateLessonDraft(dto);
  }

  @Get("lesson-drafts")
  @ApiOperation({ summary: "List lesson drafts" })
  @ApiOkResponse({ type: AdminLessonDraftListResponseDto })
  getLessonDrafts(
    @Query() query: GetAdminLessonDraftsQueryDto
  ): Promise<AdminLessonDraftListResponseDto> {
    return this.adminContentService.getLessonDrafts(query);
  }

  @Get("lesson-drafts/:draftId")
  @ApiOperation({ summary: "Get lesson draft detail" })
  @ApiOkResponse({ type: AdminLessonDraftResponseDto })
  getLessonDraft(
    @Param("draftId") draftId: string
  ): Promise<AdminLessonDraftResponseDto> {
    return this.adminContentService.getLessonDraft(draftId);
  }

  @Patch("lesson-drafts/:draftId")
  @ApiOperation({ summary: "Update lesson draft review fields" })
  @ApiOkResponse({ type: AdminLessonDraftResponseDto })
  updateLessonDraft(
    @Param("draftId") draftId: string,
    @Body() dto: UpdateAdminLessonDraftDto
  ): Promise<AdminLessonDraftResponseDto> {
    return this.adminContentService.updateLessonDraft(draftId, dto);
  }

  @Post("lesson-drafts/:draftId/create-lesson")
  @ApiOperation({ summary: "Create a lesson and quiz from an accepted draft" })
  @ApiOkResponse({ type: AdminLessonDetailResponseDto })
  createLessonFromDraft(
    @Param("draftId") draftId: string,
    @Body() dto: CreateLessonFromDraftDto
  ): Promise<AdminLessonDetailResponseDto> {
    return this.adminContentService.createLessonFromDraft(draftId, dto);
  }
}
