import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  RewardSource,
  RewardTransactionType,
  VoucherCampaignStatus,
  VoucherRedemptionStatus,
} from "@prisma/client";
import type { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class RewardAccountResponseDto {
  @ApiProperty()
  balance: number;

  @ApiProperty()
  lifetimeEarned: number;

  @ApiProperty()
  lifetimeSpent: number;
}

export class RewardLedgerEntryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: RewardTransactionType })
  type: RewardTransactionType;

  @ApiProperty({ enum: RewardSource })
  source: RewardSource;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiPropertyOptional({ nullable: true })
  referenceId: string | null;

  @ApiPropertyOptional({ nullable: true })
  metadata: unknown;

  @ApiProperty()
  createdAt: Date;
}

export class RewardRuleResponseDto {
  @ApiProperty()
  code: string;

  @ApiProperty({ enum: RewardSource })
  source: RewardSource;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty()
  points: number;

  @ApiPropertyOptional({ nullable: true })
  dailyCap: number | null;
}

export class GameRewardClaimResponseDto {
  @ApiProperty()
  coinsAwarded: number;

  @ApiProperty()
  coinBalance: number;

  @ApiProperty()
  dailyRemaining: number;

  @ApiProperty()
  wasAlreadyClaimed: boolean;
}

export class VoucherCampaignResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty()
  costCoins: number;

  @ApiPropertyOptional({ nullable: true })
  stock: number | null;

  @ApiProperty({ enum: VoucherCampaignStatus })
  status: VoucherCampaignStatus;

  @ApiPropertyOptional({ nullable: true })
  startsAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  endsAt: Date | null;

  @ApiProperty()
  isRedeemable: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class VoucherRedemptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  campaignId: string;

  @ApiProperty()
  costCoins: number;

  @ApiProperty({ enum: VoucherRedemptionStatus })
  status: VoucherRedemptionStatus;

  @ApiPropertyOptional({ nullable: true })
  code: string | null;

  @ApiPropertyOptional({ nullable: true })
  note: string | null;

  @ApiProperty()
  coinBalance: number;

  @ApiProperty()
  createdAt: Date;
}

export class AdminVoucherRedemptionUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  fullName: string | null;
}

export class AdminVoucherRedemptionCampaignDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class AdminVoucherRedemptionResponseDto extends VoucherRedemptionResponseDto {
  @ApiProperty({ type: AdminVoucherRedemptionUserDto })
  user: AdminVoucherRedemptionUserDto;

  @ApiProperty({ type: AdminVoucherRedemptionCampaignDto })
  campaign: AdminVoucherRedemptionCampaignDto;
}

export type RewardLedgerListResponseDto =
  PaginatedResponseDto<RewardLedgerEntryResponseDto>;

export type AdminVoucherRedemptionListResponseDto =
  PaginatedResponseDto<AdminVoucherRedemptionResponseDto>;
