import { DeviceToken } from "@prisma/client";
import { DeviceTokenResponseDto } from "../dto/response/device-token-response.dto";

export class DeviceTokenMapper {
  static toResponse(deviceToken: DeviceToken): DeviceTokenResponseDto {
    return {
      id: deviceToken.id,
      token: deviceToken.token,
      platform: deviceToken.platform,
      deviceId: deviceToken.deviceId,
      appVersion: deviceToken.appVersion,
      lastSeenAt: deviceToken.lastSeenAt,
      revokedAt: deviceToken.revokedAt,
      createdAt: deviceToken.createdAt,
      updatedAt: deviceToken.updatedAt,
    };
  }
}
