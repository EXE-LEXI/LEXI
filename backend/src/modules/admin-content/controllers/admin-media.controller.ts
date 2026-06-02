import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  MediaAssetSourceType,
  MediaAssetStatus,
  MediaAssetPlacement,
  MediaAssetType,
  UserRole,
} from "@prisma/client";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { basename, extname, join } from "path";
import { randomUUID } from "crypto";
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
  constructor(
    private readonly adminContentService: AdminContentService,
    private readonly configService: ConfigService
  ) {}

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

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 200 * 1024 * 1024 },
    })
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload a local video file and register media asset" })
  @ApiOkResponse({ type: AdminMediaAssetResponseDto })
  uploadMediaAsset(
    @UploadedFile() file: any,
    @Body("title") title?: string,
    @Body("placement") placement?: string
  ): Promise<AdminMediaAssetResponseDto> {
    if (!file) {
      throw new BadRequestException("Video file is required");
    }

    if (!String(file.mimetype ?? "").startsWith("video/")) {
      throw new BadRequestException("Only video files are supported");
    }

    const originalName = String(file.originalname ?? "video.mp4");
    const extension = extname(originalName).toLowerCase() || ".mp4";
    const allowedExtensions = new Set([
      ".mp4",
      ".webm",
      ".mov",
      ".m4v",
      ".mkv",
      ".avi",
    ]);

    if (!allowedExtensions.has(extension)) {
      throw new BadRequestException(
        "Unsupported video format. Please upload mp4, webm, mov, m4v, mkv, or avi"
      );
    }

    const uploadDir = join(process.cwd(), "uploads", "media");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const baseName =
      basename(originalName, extension)
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "video";
    const fileName = `${Date.now()}-${randomUUID()}-${baseName}${extension}`;
    const filePath = join(uploadDir, fileName);
    writeFileSync(filePath, file.buffer);

    const publicUrl = `${this.getPublicBaseUrl()}/uploads/media/${fileName}`;
    const mediaPlacement = this.resolveMediaPlacement(placement);

    return this.adminContentService.createMediaAsset({
      title: title?.trim() || basename(originalName, extension),
      assetType: MediaAssetType.VIDEO,
      sourceType: MediaAssetSourceType.EXTERNAL_URL,
      placement: mediaPlacement,
      status: MediaAssetStatus.READY,
      url: publicUrl,
      mimeType: file.mimetype,
      provider: "LOCAL",
      metadata: {
        originalName,
        size: file.size,
        ...(mediaPlacement === MediaAssetPlacement.SHORTS
          ? {
              shorts: {
                category: "trivia",
                author: "Lexi",
                description:
                  "Video ngan phap ly duoc tai len tu khu quan tri Lexi.",
                likes: 0,
                commentsCount: 0,
                bookmarksCount: 0,
              },
            }
          : {}),
      },
    });
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

  private getPublicBaseUrl(): string {
    const configuredBaseUrl =
      this.configService.get<string>("PUBLIC_API_URL") ??
      this.configService.get<string>("API_BASE_URL") ??
      this.configService.get<string>("APP_URL");

    if (configuredBaseUrl) {
      return configuredBaseUrl.replace(/\/$/, "");
    }

    const port = this.configService.get<number>("PORT", 3000);
    return `http://localhost:${port}`;
  }

  private resolveMediaPlacement(placement?: string): MediaAssetPlacement {
    if (!placement) {
      return MediaAssetPlacement.SHORTS;
    }

    if (
      placement === MediaAssetPlacement.SHORTS ||
      placement === MediaAssetPlacement.LESSON_RESOURCE
    ) {
      return placement;
    }

    throw new BadRequestException("Invalid media placement");
  }
}
