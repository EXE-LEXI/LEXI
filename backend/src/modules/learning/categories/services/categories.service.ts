import { Injectable } from "@nestjs/common";
import { CategoryResponseDto } from "../dto/response/category-response.dto";
import { CategoriesMapper } from "../mappers/categories.mapper";
import { CategoriesRepository } from "../repositories/categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesRepository.findActiveCategories();
    return CategoriesMapper.toResponseList(categories);
  }
}
