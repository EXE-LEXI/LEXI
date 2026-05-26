import { CategoryResponseDto } from "../dto/response/category-response.dto";

export class CategoriesMapper {
  static toResponse(category: any): CategoryResponseDto {
    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      description: category.description,
      iconUrl: category.iconUrl,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toResponseList(categories: any[]): CategoryResponseDto[] {
    return categories.map((category) => this.toResponse(category));
  }
}
