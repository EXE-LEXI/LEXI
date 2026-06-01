import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VoucherCampaignStatus } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateVoucherCampaignDto {
  @ApiProperty({ example: "Voucher beta 50k" })
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({ example: "Voucher doi thuong cho hoc vien beta" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiProperty({ minimum: 1, example: 500 })
  @IsInt()
  @Min(1)
  costCoins: number;

  @ApiPropertyOptional({ minimum: 0, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number | null;

  @ApiPropertyOptional({ enum: VoucherCampaignStatus })
  @IsOptional()
  @IsEnum(VoucherCampaignStatus)
  status?: VoucherCampaignStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endsAt?: string | null;
}

export class UpdateVoucherCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  costCoins?: number;

  @ApiPropertyOptional({ minimum: 0, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number | null;

  @ApiPropertyOptional({ enum: VoucherCampaignStatus })
  @IsOptional()
  @IsEnum(VoucherCampaignStatus)
  status?: VoucherCampaignStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endsAt?: string | null;
}
