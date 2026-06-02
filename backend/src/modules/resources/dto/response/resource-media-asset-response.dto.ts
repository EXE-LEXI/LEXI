import { ApiProperty } from "@nestjs/swagger";
import {
  MediaAssetPlacement,
  MediaAssetSourceType,
  MediaAssetType,
} from "@prisma/client";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class ResourceMediaAssetLessonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;
}

export class ResourceMediaAssetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  title: string | null;

  @ApiProperty({ enum: MediaAssetType })
  assetType: MediaAssetType;

  @ApiProperty({ enum: MediaAssetSourceType })
  sourceType: MediaAssetSourceType;

  @ApiProperty({ enum: MediaAssetPlacement })
  placement: MediaAssetPlacement;

  @ApiProperty()
  url: string;

  @ApiProperty({ nullable: true })
  mimeType: string | null;

  @ApiProperty({ nullable: true })
  provider: string | null;

  @ApiProperty({ nullable: true })
  metadata: unknown;

  @ApiProperty({ type: ResourceMediaAssetLessonResponseDto, nullable: true })
  lesson: ResourceMediaAssetLessonResponseDto | null;

  @ApiProperty()
  updatedAt: Date;
}

export class ResourceMediaAssetListResponseDto
  implements PaginatedResponseDto<ResourceMediaAssetResponseDto>
{
  @ApiProperty({ type: ResourceMediaAssetResponseDto, isArray: true })
  items: ResourceMediaAssetResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<ResourceMediaAssetResponseDto>["meta"];
}
