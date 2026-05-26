import { DeviceTokenPlatform } from "@prisma/client";

export class DeviceTokenResponseDto {
  id: string;
  token: string;
  platform: DeviceTokenPlatform;
  deviceId: string | null;
  appVersion: string | null;
  lastSeenAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RevokeDeviceTokenResponseDto {
  revoked: boolean;
}
