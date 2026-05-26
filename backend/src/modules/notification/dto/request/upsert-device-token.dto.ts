import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DeviceTokenPlatform } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpsertDeviceTokenDto {
  @ApiProperty({ example: "fcm-registration-token" })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  token: string;

  @ApiProperty({
    enum: DeviceTokenPlatform,
    example: DeviceTokenPlatform.ANDROID,
  })
  @IsEnum(DeviceTokenPlatform)
  platform: DeviceTokenPlatform;

  @ApiPropertyOptional({ example: "pixel-8-pro", maxLength: 128 })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceId?: string;

  @ApiPropertyOptional({ example: "1.0.0", maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  appVersion?: string;
}
