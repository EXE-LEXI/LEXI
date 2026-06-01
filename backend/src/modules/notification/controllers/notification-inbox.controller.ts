import { Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { GetNotificationInboxQueryDto } from "../dto/request/get-notification-inbox-query.dto";
import { NotificationInboxListResponseDto } from "../dto/response/notification-inbox-response.dto";
import { NotificationInboxService } from "../services/notification-inbox.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications/inbox")
export class NotificationInboxController {
  constructor(
    private readonly notificationInboxService: NotificationInboxService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get notification inbox for current user" })
  @ApiOkResponse({ type: NotificationInboxListResponseDto })
  getInbox(
    @CurrentUser() user: AuthUserDto,
    @Query() query: GetNotificationInboxQueryDto
  ): Promise<NotificationInboxListResponseDto> {
    return this.notificationInboxService.getInbox(user.id, query);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all inbox notifications as read" })
  markAllRead(@CurrentUser() user: AuthUserDto): Promise<{ updated: number }> {
    return this.notificationInboxService.markAllRead(user.id);
  }

  @Patch(":notificationId/read")
  @ApiOperation({ summary: "Mark one inbox notification as read" })
  markRead(
    @CurrentUser() user: AuthUserDto,
    @Param("notificationId") notificationId: string
  ): Promise<{ updated: true }> {
    return this.notificationInboxService.markRead(user.id, notificationId);
  }

  @Delete(":notificationId")
  @ApiOperation({ summary: "Dismiss one inbox notification" })
  dismiss(
    @CurrentUser() user: AuthUserDto,
    @Param("notificationId") notificationId: string
  ): Promise<{ deleted: true }> {
    return this.notificationInboxService.dismiss(user.id, notificationId);
  }
}
