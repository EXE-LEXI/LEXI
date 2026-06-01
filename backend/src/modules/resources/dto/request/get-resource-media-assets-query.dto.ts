import { MediaAssetPlacement, MediaAssetType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetResourceMediaAssetsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(MediaAssetType)
  assetType?: MediaAssetType;

  @IsOptional()
  @IsEnum(MediaAssetPlacement)
  placement?: MediaAssetPlacement;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
