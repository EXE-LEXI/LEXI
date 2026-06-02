import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class AdminCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true })
  iconUrl: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminModuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: AdminCategoryResponseDto })
  category: AdminCategoryResponseDto;

  @ApiProperty()
  lessonCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminModuleListResponseDto
  implements PaginatedResponseDto<AdminModuleResponseDto>
{
  @ApiProperty({ type: AdminModuleResponseDto, isArray: true })
  items: AdminModuleResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<AdminModuleResponseDto>["meta"];
}
