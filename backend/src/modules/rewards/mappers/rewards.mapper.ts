import { buildPaginationMeta } from "../../../common/dto/pagination-meta.dto";
import {
  RewardAccountResponseDto,
  RewardLedgerListResponseDto,
  RewardLedgerEntryResponseDto,
  RewardRuleResponseDto,
  AdminVoucherRedemptionListResponseDto,
  AdminVoucherRedemptionResponseDto,
  VoucherCampaignResponseDto,
  VoucherRedemptionResponseDto,
} from "../dto/response/reward-response.dto";

export class RewardsMapper {
  static toAccount(account: any): RewardAccountResponseDto {
    return {
      balance: account.balance,
      lifetimeEarned: account.lifetimeEarned,
      lifetimeSpent: account.lifetimeSpent,
    };
  }

  static toLedgerEntry(entry: any): RewardLedgerEntryResponseDto {
    return {
      id: entry.id,
      type: entry.type,
      source: entry.source,
      amount: entry.amount,
      balanceAfter: entry.balanceAfter,
      referenceId: entry.referenceId,
      metadata: entry.metadata ?? null,
      createdAt: entry.createdAt,
    };
  }

  static toLedgerList(params: {
    entries: any[];
    total: number;
    page: number;
    limit: number;
  }): RewardLedgerListResponseDto {
    return {
      items: params.entries.map((entry) => this.toLedgerEntry(entry)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toRule(rule: any): RewardRuleResponseDto {
    return {
      code: rule.code,
      source: rule.source,
      title: rule.title,
      description: rule.description,
      points: rule.points,
      dailyCap: rule.dailyCap,
    };
  }

  static toVoucherCampaign(
    campaign: any,
    now = new Date()
  ): VoucherCampaignResponseDto {
    const hasStarted = !campaign.startsAt || campaign.startsAt <= now;
    const hasNotEnded = !campaign.endsAt || campaign.endsAt > now;
    const hasStock = campaign.stock === null || campaign.stock === undefined || campaign.stock > 0;

    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      costCoins: campaign.costCoins,
      stock: campaign.stock,
      status: campaign.status,
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
      isRedeemable: campaign.status === "ACTIVE" && hasStarted && hasNotEnded && hasStock,
      createdAt: campaign.createdAt,
    };
  }

  static toVoucherRedemption(
    redemption: any,
    coinBalance: number
  ): VoucherRedemptionResponseDto {
    return {
      id: redemption.id,
      campaignId: redemption.campaignId,
      costCoins: redemption.costCoins,
      status: redemption.status,
      code: redemption.code,
      note: redemption.note,
      coinBalance,
      createdAt: redemption.createdAt,
    };
  }

  static toAdminVoucherRedemption(
    redemption: any
  ): AdminVoucherRedemptionResponseDto {
    return {
      id: redemption.id,
      campaignId: redemption.campaignId,
      costCoins: redemption.costCoins,
      status: redemption.status,
      code: redemption.code,
      note: redemption.note,
      coinBalance: 0,
      createdAt: redemption.createdAt,
      user: {
        id: redemption.user.id,
        email: redemption.user.email,
        fullName: redemption.user.profile?.fullName ?? null,
      },
      campaign: {
        id: redemption.campaign.id,
        title: redemption.campaign.title,
      },
    };
  }

  static toAdminVoucherRedemptionList(params: {
    redemptions: any[];
    total: number;
    page: number;
    limit: number;
  }): AdminVoucherRedemptionListResponseDto {
    return {
      items: params.redemptions.map((redemption) =>
        this.toAdminVoucherRedemption(redemption)
      ),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }
}
