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
import { GetAdminNotificationDeliveryLogsQueryDto } from "../dto/request/get-admin-notification-delivery-logs-query.dto";
import { AdminNotificationDeliveryLogListResponseDto } from "../dto/response/admin-notification-delivery-log-response.dto";
import { AdminContentService } from "../services/admin-content.service";

@ApiTags("admin-notifications")
@ApiBearerAuth()
@Controller("admin/notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminNotificationsController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get("delivery-logs")
  @ApiOperation({ summary: "List notification delivery logs for debugging" })
  @ApiOkResponse({ type: AdminNotificationDeliveryLogListResponseDto })
  getDeliveryLogs(
    @Query() query: GetAdminNotificationDeliveryLogsQueryDto
  ): Promise<AdminNotificationDeliveryLogListResponseDto> {
    return this.adminContentService.getNotificationDeliveryLogs(query);
  }
}
