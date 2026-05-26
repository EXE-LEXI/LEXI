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
import { AttachMediaAssetToLessonDto } from "../dto/request/attach-media-asset-to-lesson.dto";
import { CreateAdminMediaAssetDto } from "../dto/request/create-admin-media-asset.dto";
import { GetAdminMediaAssetsQueryDto } from "../dto/request/get-admin-media-assets-query.dto";
import { UpdateAdminMediaAssetDto } from "../dto/request/update-admin-media-asset.dto";
import { AdminLessonDetailResponseDto } from "../dto/response/admin-lesson-response.dto";
import {
  AdminMediaAssetListResponseDto,
  AdminMediaAssetResponseDto,
} from "../dto/response/admin-media-asset-response.dto";
import { AdminContentService } from "../services/admin-content.service";

@ApiTags("admin-media")
@ApiBearerAuth()
@Controller("admin/media-assets")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMediaController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get()
  @ApiOperation({ summary: "List media assets" })
  @ApiOkResponse({ type: AdminMediaAssetListResponseDto })
  getMediaAssets(
    @Query() query: GetAdminMediaAssetsQueryDto
  ): Promise<AdminMediaAssetListResponseDto> {
    return this.adminContentService.getMediaAssets(query);
  }

  @Post()
  @ApiOperation({
    summary: "Create a media asset registration or render request",
  })
  @ApiOkResponse({ type: AdminMediaAssetResponseDto })
  createMediaAsset(
    @Body() dto: CreateAdminMediaAssetDto
  ): Promise<AdminMediaAssetResponseDto> {
    return this.adminContentService.createMediaAsset(dto);
  }

  @Patch(":assetId")
  @ApiOperation({ summary: "Update a media asset" })
  @ApiOkResponse({ type: AdminMediaAssetResponseDto })
  updateMediaAsset(
    @Param("assetId") assetId: string,
    @Body() dto: UpdateAdminMediaAssetDto
  ): Promise<AdminMediaAssetResponseDto> {
    return this.adminContentService.updateMediaAsset(assetId, dto);
  }

  @Post(":assetId/attach-to-lesson")
  @ApiOperation({ summary: "Attach a ready media asset URL to a lesson" })
  @ApiOkResponse({ type: AdminLessonDetailResponseDto })
  attachToLesson(
    @Param("assetId") assetId: string,
    @Body() dto: AttachMediaAssetToLessonDto
  ): Promise<AdminLessonDetailResponseDto> {
    return this.adminContentService.attachMediaAssetToLesson(assetId, dto);
  }
}
