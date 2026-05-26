import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { CategoryResponseDto } from "../dto/response/category-response.dto";
import { CategoriesService } from "../services/categories.service";

@ApiTags("categories")
@ApiBearerAuth()
@Controller("categories")
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "Get active learning categories" })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getAllCategories();
  }
}
