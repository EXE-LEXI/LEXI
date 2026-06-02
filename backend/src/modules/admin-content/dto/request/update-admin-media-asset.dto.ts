import {
  MediaAssetSourceType,
  MediaAssetStatus,
  MediaAssetPlacement,
  MediaAssetType,
} from "@prisma/client";
import { IsEnum, IsObject, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateAdminMediaAssetDto {
  @IsOptional()
  @IsString()
  lessonId?: string | null;

  @IsOptional()
  @IsString()
  draftId?: string | null;

  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsEnum(MediaAssetType)
  assetType?: MediaAssetType;

  @IsOptional()
  @IsEnum(MediaAssetSourceType)
  sourceType?: MediaAssetSourceType;

  @IsOptional()
  @IsEnum(MediaAssetPlacement)
  placement?: MediaAssetPlacement;

  @IsOptional()
  @IsEnum(MediaAssetStatus)
  status?: MediaAssetStatus;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string | null;

  @IsOptional()
  @IsString()
  mimeType?: string | null;

  @IsOptional()
  @IsString()
  provider?: string | null;

  @IsOptional()
  @IsString()
  renderPrompt?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;
}
