import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from "../../../../../common/dto/pagination-meta.dto";

export class ModuleLessonResponseDto {
  id: string;
  title: string;
  sortOrder: number;
  progress: {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    lastScore: number | null;
    completedAt: Date | null;
  } | null;
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
