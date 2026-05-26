import { Injectable } from "@nestjs/common";
import { DeviceTokenPlatform } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";

type UpsertDeviceTokenArgs = {
  userId: string;
  token: string;
  platform: DeviceTokenPlatform;
  deviceId?: string;
  appVersion?: string;
  lastSeenAt: Date;
};

@Injectable()
export class DeviceTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertDeviceToken(args: UpsertDeviceTokenArgs) {
    return this.prisma.deviceToken.upsert({
      where: {
        token: args.token,
      },
      create: {
        userId: args.userId,
        token: args.token,
        platform: args.platform,
        deviceId: args.deviceId ?? null,
        appVersion: args.appVersion ?? null,
        lastSeenAt: args.lastSeenAt,
      },
      update: {
        userId: args.userId,
        platform: args.platform,
        deviceId: args.deviceId ?? null,
        appVersion: args.appVersion ?? null,
        lastSeenAt: args.lastSeenAt,
        revokedAt: null,
      },
    });
  }

  revokeDeviceToken(userId: string, token: string, revokedAt: Date) {
    return this.prisma.deviceToken.updateMany({
      where: {
        userId,
        token,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  }
}
