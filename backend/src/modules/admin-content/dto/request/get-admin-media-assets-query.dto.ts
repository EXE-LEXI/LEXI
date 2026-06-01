import {
  MediaAssetSourceType,
  MediaAssetStatus,
  MediaAssetPlacement,
  MediaAssetType,
} from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetAdminMediaAssetsQueryDto extends PaginationQueryDto {
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
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsString()
  draftId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
