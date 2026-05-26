import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from "../../../../../common/dto/pagination-meta.dto";

export class ModuleLessonResponseDto {
  id: string;
  title: string;
  sortOrder: number;
}

export class ModuleResponseDto {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lessons: ModuleLessonResponseDto[];
}

export class ModulesListResponseDto
  implements PaginatedResponseDto<ModuleResponseDto>
{
  items: ModuleResponseDto[];
  meta: PaginationMetaDto;
}
