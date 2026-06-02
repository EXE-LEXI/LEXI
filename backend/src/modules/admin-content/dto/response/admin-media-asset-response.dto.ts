import { ApiProperty } from "@nestjs/swagger";
import {
  MediaAssetSourceType,
  MediaAssetStatus,
  MediaAssetPlacement,
  MediaAssetType,
} from "@prisma/client";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class AdminMediaAssetLessonDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;
}

export class AdminMediaAssetDraftDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class AdminMediaAssetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: AdminMediaAssetLessonDto, nullable: true })
  lesson: AdminMediaAssetLessonDto | null;

  @ApiProperty({ type: AdminMediaAssetDraftDto, nullable: true })
  draft: AdminMediaAssetDraftDto | null;

  @ApiProperty({ nullable: true })
  title: string | null;

  @ApiProperty({ enum: MediaAssetType })
  assetType: MediaAssetType;

  @ApiProperty({ enum: MediaAssetSourceType })
  sourceType: MediaAssetSourceType;

  @ApiProperty({ enum: MediaAssetPlacement })
  placement: MediaAssetPlacement;

  @ApiProperty({ enum: MediaAssetStatus })
  status: MediaAssetStatus;

  @ApiProperty({ nullable: true })
  url: string | null;

  @ApiProperty({ nullable: true })
  mimeType: string | null;

  @ApiProperty({ nullable: true })
  provider: string | null;

  @ApiProperty({ nullable: true })
  renderPrompt: string | null;

  @ApiProperty({ nullable: true })
  metadata: unknown;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminMediaAssetListResponseDto
  implements PaginatedResponseDto<AdminMediaAssetResponseDto>
{
  @ApiProperty({ type: AdminMediaAssetResponseDto, isArray: true })
  items: AdminMediaAssetResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<AdminMediaAssetResponseDto>["meta"];
}
