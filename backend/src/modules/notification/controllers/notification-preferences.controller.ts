import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UpdateNotificationPreferencesDto } from "../dto/request/update-notification-preferences.dto";
import { NotificationPreferencesResponseDto } from "../dto/response/notification-preferences-response.dto";
import { NotificationPreferencesService } from "../services/notification-preferences.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications/preferences")
export class NotificationPreferencesController {
  constructor(
    private readonly notificationPreferencesService: NotificationPreferencesService
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get notification preferences for the current user",
  })
  @ApiOkResponse({ type: NotificationPreferencesResponseDto })
  async getPreferences(
    @CurrentUser() user: AuthUserDto
  ): Promise<NotificationPreferencesResponseDto> {
    return this.notificationPreferencesService.getPreferences(user.id);
  }

  @Patch()
  @ApiOperation({
    summary: "Update notification preferences for the current user",
  })
  @ApiOkResponse({ type: NotificationPreferencesResponseDto })
  async updatePreferences(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: UpdateNotificationPreferencesDto
  ): Promise<NotificationPreferencesResponseDto> {
    return this.notificationPreferencesService.updatePreferences(user.id, dto);
  }
}
