import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { createHash, randomUUID } from "crypto";
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
  async uploadMediaAsset(
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

    const baseName =
      basename(originalName, extension)
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "video";
    const mediaPlacement = this.resolveMediaPlacement(placement);
    const uploadResult = await this.uploadVideoFile(file, baseName, extension);

    return this.adminContentService.createMediaAsset({
      title: title?.trim() || basename(originalName, extension),
      assetType: MediaAssetType.VIDEO,
      sourceType: MediaAssetSourceType.EXTERNAL_URL,
      placement: mediaPlacement,
      status: MediaAssetStatus.READY,
      url: uploadResult.url,
      mimeType: file.mimetype,
      provider: uploadResult.provider,
      metadata: {
        originalName,
        size: file.size,
        storage: uploadResult.metadata,
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

  @Delete(":assetId")
  @ApiOperation({ summary: "Delete a media asset and its stored video file" })
  @ApiOkResponse({ type: AdminMediaAssetResponseDto })
  deleteMediaAsset(
    @Param("assetId") assetId: string
  ): Promise<AdminMediaAssetResponseDto> {
    return this.adminContentService.deleteMediaAsset(assetId);
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

  private async uploadVideoFile(
    file: any,
    baseName: string,
    extension: string
  ): Promise<{
    url: string;
    provider: "LOCAL" | "CLOUDINARY";
    metadata: Record<string, unknown>;
  }> {
    const provider = this.configService
      .get<string>("VIDEO_STORAGE_PROVIDER", "local")
      .toLowerCase();

    if (provider === "cloudinary") {
      return this.uploadToCloudinary(file, baseName);
    }

    if (provider !== "local") {
      throw new BadRequestException("Unsupported VIDEO_STORAGE_PROVIDER");
    }

    return this.uploadToLocalStorage(file, baseName, extension);
  }

  private uploadToLocalStorage(
    file: any,
    baseName: string,
    extension: string
  ): {
    url: string;
    provider: "LOCAL";
    metadata: Record<string, unknown>;
  } {
    const uploadDir = join(process.cwd(), "uploads", "media");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${randomUUID()}-${baseName}${extension}`;
    const filePath = join(uploadDir, fileName);
    writeFileSync(filePath, file.buffer);

    return {
      url: `${this.getPublicBaseUrl()}/uploads/media/${fileName}`,
      provider: "LOCAL",
      metadata: {
        fileName,
        path: "uploads/media",
      },
    };
  }

  private async uploadToCloudinary(
    file: any,
    baseName: string
  ): Promise<{
    url: string;
    provider: "CLOUDINARY";
    metadata: Record<string, unknown>;
  }> {
    const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");
    const folder =
      this.configService.get<string>("CLOUDINARY_VIDEO_FOLDER") ??
      "lexi/videos";

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException(
        "Cloudinary video storage is not configured"
      );
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = `${baseName}-${randomUUID()}`;
    const signaturePayload = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1")
      .update(signaturePayload)
      .digest("hex");

    const formData = new FormData();
    formData.append("file", new Blob([file.buffer], { type: file.mimetype }));
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("public_id", publicId);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const payload = (await response.json()) as {
      secure_url?: string;
      public_id?: string;
      resource_type?: string;
      bytes?: number;
      duration?: number;
      error?: { message?: string };
    };

    if (!response.ok || !payload.secure_url) {
      throw new BadRequestException(
        payload.error?.message ?? "Cloudinary upload failed"
      );
    }

    return {
      url: payload.secure_url,
      provider: "CLOUDINARY",
      metadata: {
        publicId: payload.public_id,
        resourceType: payload.resource_type,
        bytes: payload.bytes,
        duration: payload.duration,
        folder,
      },
    };
  }
}
