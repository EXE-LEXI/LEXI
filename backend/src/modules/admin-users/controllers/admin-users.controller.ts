import { Controller, Get, Query, UseGuards } from "@nestjs/common";
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
import { GetAdminUsersQueryDto } from "../dto/request/get-admin-users-query.dto";
import {
  AdminUserListResponseDto,
  AdminUserSummaryResponseDto,
} from "../dto/response/admin-user-response.dto";
import { AdminUsersService } from "../services/admin-users.service";

@ApiTags("admin-users")
@ApiBearerAuth()
@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: "List users for admin management" })
  @ApiOkResponse({ type: AdminUserListResponseDto })
  getUsers(
    @Query() query: GetAdminUsersQueryDto
  ): Promise<AdminUserListResponseDto> {
    return this.adminUsersService.getUsers(query);
  }

  @Get("summary")
  @ApiOperation({ summary: "Get admin user summary metrics" })
  @ApiOkResponse({ type: AdminUserSummaryResponseDto })
  getSummary(): Promise<AdminUserSummaryResponseDto> {
    return this.adminUsersService.getSummary();
  }
}
