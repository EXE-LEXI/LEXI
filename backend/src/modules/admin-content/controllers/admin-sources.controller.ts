import {
  Body,
  Controller,
  Delete,
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
import { CreateAdminLegalSourceDto } from "../dto/request/create-admin-legal-source.dto";
import { GetAdminLegalSourcesQueryDto } from "../dto/request/get-admin-legal-sources-query.dto";
import { UpdateAdminLegalSourceDto } from "../dto/request/update-admin-legal-source.dto";
import {
  AdminLegalSourceListResponseDto,
  AdminLegalSourceResponseDto,
} from "../dto/response/admin-legal-source-response.dto";
import { AdminContentService } from "../services/admin-content.service";

@ApiTags("admin-sources")
@ApiBearerAuth()
@Controller("admin/sources")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSourcesController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get()
  @ApiOperation({ summary: "List legal source documents" })
  @ApiOkResponse({ type: AdminLegalSourceListResponseDto })
  getLegalSources(
    @Query() query: GetAdminLegalSourcesQueryDto
  ): Promise<AdminLegalSourceListResponseDto> {
    return this.adminContentService.getLegalSources(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a legal source document" })
  @ApiOkResponse({ type: AdminLegalSourceResponseDto })
  createLegalSource(
    @Body() createDto: CreateAdminLegalSourceDto
  ): Promise<AdminLegalSourceResponseDto> {
    return this.adminContentService.createLegalSource(createDto);
  }

  @Get(":sourceId")
  @ApiOperation({ summary: "Get legal source document detail" })
  @ApiOkResponse({ type: AdminLegalSourceResponseDto })
  getLegalSource(
    @Param("sourceId") sourceId: string
  ): Promise<AdminLegalSourceResponseDto> {
    return this.adminContentService.getLegalSource(sourceId);
  }

  @Patch(":sourceId")
  @ApiOperation({ summary: "Update a legal source document" })
  @ApiOkResponse({ type: AdminLegalSourceResponseDto })
  updateLegalSource(
    @Param("sourceId") sourceId: string,
    @Body() updateDto: UpdateAdminLegalSourceDto
  ): Promise<AdminLegalSourceResponseDto> {
    return this.adminContentService.updateLegalSource(sourceId, updateDto);
  }

  @Delete(":sourceId")
  @ApiOperation({ summary: "Delete a legal source document" })
  async deleteLegalSource(
    @Param("sourceId") sourceId: string
  ): Promise<{ deleted: true }> {
    await this.adminContentService.deleteLegalSource(sourceId);
    return { deleted: true };
  }
}
