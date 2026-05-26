import { Injectable, NotFoundException } from "@nestjs/common";
import { UpsertDeviceTokenDto } from "../dto/request/upsert-device-token.dto";
import {
  DeviceTokenResponseDto,
  RevokeDeviceTokenResponseDto,
} from "../dto/response/device-token-response.dto";
import { DeviceTokenMapper } from "../mappers/device-token.mapper";
import { DeviceTokensRepository } from "../repositories/device-tokens.repository";

@Injectable()
export class DeviceTokensService {
  constructor(
    private readonly deviceTokensRepository: DeviceTokensRepository
  ) {}

  async upsertDeviceToken(
    userId: string,
    dto: UpsertDeviceTokenDto,
    now = new Date()
  ): Promise<DeviceTokenResponseDto> {
    const deviceToken = await this.deviceTokensRepository.upsertDeviceToken({
      userId,
      token: dto.token,
      platform: dto.platform,
      deviceId: dto.deviceId,
      appVersion: dto.appVersion,
      lastSeenAt: now,
    });

    return DeviceTokenMapper.toResponse(deviceToken);
  }

  async revokeDeviceToken(
    userId: string,
    token: string,
    now = new Date()
  ): Promise<RevokeDeviceTokenResponseDto> {
    const result = await this.deviceTokensRepository.revokeDeviceToken(
      userId,
      token,
      now
    );

    if (result.count === 0) {
      throw new NotFoundException("Device token not found");
    }

    return { revoked: true };
  }
}
