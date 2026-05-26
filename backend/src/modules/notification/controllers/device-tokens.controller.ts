import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UpsertDeviceTokenDto } from "../dto/request/upsert-device-token.dto";
import {
  DeviceTokenResponseDto,
  RevokeDeviceTokenResponseDto,
} from "../dto/response/device-token-response.dto";
import { DeviceTokensService } from "../services/device-tokens.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications/device-tokens")
export class DeviceTokensController {
  constructor(private readonly deviceTokensService: DeviceTokensService) {}

  @Post()
  @ApiOperation({
    summary: "Register or refresh the current user's device token",
  })
  @ApiOkResponse({ type: DeviceTokenResponseDto })
  async upsertDeviceToken(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: UpsertDeviceTokenDto
  ): Promise<DeviceTokenResponseDto> {
    return this.deviceTokensService.upsertDeviceToken(user.id, dto);
  }

  @Delete(":token")
  @ApiOperation({ summary: "Revoke one device token for the current user" })
  @ApiOkResponse({ type: RevokeDeviceTokenResponseDto })
  async revokeDeviceToken(
    @CurrentUser() user: AuthUserDto,
    @Param("token") token: string
  ): Promise<RevokeDeviceTokenResponseDto> {
    return this.deviceTokensService.revokeDeviceToken(user.id, token);
  }
}
