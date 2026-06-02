import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { GetModulesQueryDto } from "../dto/request/get-modules-query.dto";
import { ModulesListResponseDto } from "../dto/response/module-response.dto";
import { ModulesService } from "../services/modules.service";

@ApiTags("modules")
@ApiBearerAuth()
@Controller("modules")
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @ApiOperation({ summary: "Get active learning modules" })
  @ApiOkResponse({ type: ModulesListResponseDto })
  async getModules(
    @CurrentUser() user: AuthUserDto,
    @Query() query: GetModulesQueryDto
  ): Promise<ModulesListResponseDto> {
    return this.modulesService.getModules({
      userId: user.id,
      categoryId: query.categoryId,
      page: query.page,
      limit: query.limit,
    });
  }
}
