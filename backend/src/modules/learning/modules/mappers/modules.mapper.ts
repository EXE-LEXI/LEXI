import { buildPaginationMeta } from "../../../../common/dto/pagination-meta.dto";
import {
  ModuleResponseDto,
  ModulesListResponseDto,
} from "../dto/response/module-response.dto";

export class ModulesMapper {
  static toResponse(module: any): ModuleResponseDto {
    return {
      id: module.id,
      categoryId: module.categoryId,
      slug: module.slug,
      title: module.title,
      description: module.description,
      sortOrder: module.sortOrder,
      isActive: module.isActive,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        sortOrder: lesson.sortOrder,
      })),
    };
  }

  static toResponseList(modules: any[]): ModuleResponseDto[] {
    return modules.map((module) => this.toResponse(module));
  }

  static toPaginatedResponse(params: {
    modules: any[];
    total: number;
    page: number;
    limit: number;
  }): ModulesListResponseDto {
    return {
      items: this.toResponseList(params.modules),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }
}
