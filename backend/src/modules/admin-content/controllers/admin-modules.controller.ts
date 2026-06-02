import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { CreateAdminModuleDto } from "../dto/request/create-admin-module.dto";
import { GetAdminModulesQueryDto } from "../dto/request/get-admin-modules-query.dto";
import { UpdateAdminModuleDto } from "../dto/request/update-admin-module.dto";
import {
  AdminCategoryResponseDto,
  AdminModuleListResponseDto,
  AdminModuleResponseDto,
} from "../dto/response/admin-module-response.dto";
import { AdminContentService } from "../services/admin-content.service";

@ApiTags("admin-modules")
@ApiBearerAuth()
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminModulesController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get("categories")
  @ApiOperation({ summary: "List categories for admin module operations" })
  @ApiOkResponse({ type: AdminCategoryResponseDto, isArray: true })
  getCategories(): Promise<AdminCategoryResponseDto[]> {
    return this.adminContentService.getCategories();
  }

  @Get("modules")
  @ApiOperation({ summary: "List learning modules for admin operations" })
  @ApiOkResponse({ type: AdminModuleListResponseDto })
  getModules(
    @Query() query: GetAdminModulesQueryDto
  ): Promise<AdminModuleListResponseDto> {
    return this.adminContentService.getModules(query);
  }

  @Post("modules")
  @ApiOperation({ summary: "Create a learning module" })
  @ApiOkResponse({ type: AdminModuleResponseDto })
  createModule(
    @Body() createDto: CreateAdminModuleDto
  ): Promise<AdminModuleResponseDto> {
    return this.adminContentService.createModule(createDto);
  }

  @Patch("modules/:moduleId")
  @ApiOperation({ summary: "Update a learning module" })
  @ApiOkResponse({ type: AdminModuleResponseDto })
  updateModule(
    @Param("moduleId") moduleId: string,
    @Body() updateDto: UpdateAdminModuleDto
  ): Promise<AdminModuleResponseDto> {
    return this.adminContentService.updateModule(moduleId, updateDto);
  }
}
