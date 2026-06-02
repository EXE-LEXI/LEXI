import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  RewardSource,
  RewardTransactionType,
  VoucherRedemptionStatus,
} from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";
import {
  DEFAULT_REWARDS_LIMIT,
  DEFAULT_REWARDS_PAGE,
  GAME_DAILY_COIN_CAP,
  GAME_MAX_COINS,
  GAME_MIN_COINS,
  QUIZ_COMPLETION_COINS,
  QUIZ_COMPLETION_MIN_SCORE,
  QUIZ_PERFECT_SCORE_COINS,
} from "../constants/rewards.constants";
import { ClaimGameRewardDto } from "../dto/request/claim-game-reward.dto";
import {
  CreateVoucherCampaignDto,
  UpdateVoucherCampaignDto,
} from "../dto/request/admin-voucher-campaign.dto";
import {
  GetVoucherRedemptionsQueryDto,
  UpdateVoucherRedemptionDto,
} from "../dto/request/admin-voucher-redemption.dto";
import { GetRewardLedgerQueryDto } from "../dto/request/get-reward-ledger-query.dto";
import {
  AdminVoucherRedemptionListResponseDto,
  AdminVoucherRedemptionResponseDto,
  GameRewardClaimResponseDto,
  RewardAccountResponseDto,
  RewardLedgerListResponseDto,
  RewardRuleResponseDto,
  VoucherCampaignResponseDto,
  VoucherRedemptionResponseDto,
} from "../dto/response/reward-response.dto";
import { RewardsMapper } from "../mappers/rewards.mapper";
import { RewardsRepository } from "../repositories/rewards.repository";

@Injectable()
export class RewardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rewardsRepository: RewardsRepository
  ) {}

  async getAccount(userId: string): Promise<RewardAccountResponseDto> {
    const account = await this.rewardsRepository.ensureAccount(userId);
    return RewardsMapper.toAccount(account);
  }

  async getLedger(
    userId: string,
    query: GetRewardLedgerQueryDto
  ): Promise<RewardLedgerListResponseDto> {
    const page = query.page ?? DEFAULT_REWARDS_PAGE;
    const limit = query.limit ?? DEFAULT_REWARDS_LIMIT;
    const [total, entries] = await Promise.all([
      this.rewardsRepository.countLedgerEntries({
        userId,
        source: query.source,
      }),
      this.rewardsRepository.findLedgerEntries({
        userId,
        source: query.source,
        page,
        limit,
      }),
    ]);

    return RewardsMapper.toLedgerList({
      entries,
      total,
      page,
      limit,
    });
  }

  async getRules(): Promise<RewardRuleResponseDto[]> {
    const rules = await this.rewardsRepository.findActiveRules();
    if (rules.length > 0) {
      return rules.map((rule) => RewardsMapper.toRule(rule));
    }

    return [
      {
        code: "quiz-complete-score-60",
        source: RewardSource.QUIZ,
        title: "Hoan thanh quiz dat tu 60 diem",
        description: "Cong diem lan dau khi vuot nguong diem cua bai hoc.",
        points: QUIZ_COMPLETION_COINS,
        dailyCap: null,
      },
      {
        code: "quiz-perfect-score",
        source: RewardSource.QUIZ,
        title: "Dat quiz 100 diem",
        description: "Thuong them khi dat diem tuyet doi.",
        points: QUIZ_PERFECT_SCORE_COINS,
        dailyCap: null,
      },
      {
        code: "game-complete",
        source: RewardSource.GAME,
        title: "Hoan thanh game",
        description: "Diem game phu thuoc vao ket qua va bi gioi han moi ngay.",
        points: GAME_MAX_COINS,
        dailyCap: GAME_DAILY_COIN_CAP,
      },
    ];
  }

  async getVoucherCatalog(
    now = new Date()
  ): Promise<VoucherCampaignResponseDto[]> {
    const campaigns = await this.rewardsRepository.findVoucherCatalog(now);
    return campaigns.map((campaign) =>
      RewardsMapper.toVoucherCampaign(campaign, now)
    );
  }

  async listAdminVoucherCampaigns(): Promise<VoucherCampaignResponseDto[]> {
    const campaigns = await this.rewardsRepository.findAdminVoucherCampaigns();
    return campaigns.map((campaign) =>
      RewardsMapper.toVoucherCampaign(campaign)
    );
  }

  async createVoucherCampaign(
    dto: CreateVoucherCampaignDto
  ): Promise<VoucherCampaignResponseDto> {
    const campaign = await this.rewardsRepository.createVoucherCampaign({
      title: dto.title,
      description: dto.description ?? null,
      costCoins: dto.costCoins,
      stock: dto.stock ?? null,
      status: dto.status,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });

    return RewardsMapper.toVoucherCampaign(campaign);
  }

  async updateVoucherCampaign(
    campaignId: string,
    dto: UpdateVoucherCampaignDto
  ): Promise<VoucherCampaignResponseDto> {
    const campaign = await this.rewardsRepository.updateVoucherCampaign(
      campaignId,
      {
        title: dto.title,
        description:
          dto.description === undefined ? undefined : dto.description ?? null,
        costCoins: dto.costCoins,
        stock: dto.stock === undefined ? undefined : dto.stock ?? null,
        status: dto.status,
        startsAt:
          dto.startsAt === undefined
            ? undefined
            : dto.startsAt
              ? new Date(dto.startsAt)
              : null,
        endsAt:
          dto.endsAt === undefined
            ? undefined
            : dto.endsAt
              ? new Date(dto.endsAt)
              : null,
      }
    );

    return RewardsMapper.toVoucherCampaign(campaign);
  }

  async listVoucherRedemptions(
    query: GetVoucherRedemptionsQueryDto
  ): Promise<AdminVoucherRedemptionListResponseDto> {
    const page = query.page ?? DEFAULT_REWARDS_PAGE;
    const limit = query.limit ?? DEFAULT_REWARDS_LIMIT;
    const [total, redemptions] = await Promise.all([
      this.rewardsRepository.countVoucherRedemptions(query.status),
      this.rewardsRepository.findVoucherRedemptions({
        status: query.status,
        page,
        limit,
      }),
    ]);

    return RewardsMapper.toAdminVoucherRedemptionList({
      redemptions,
      total,
      page,
      limit,
    });
  }

  async updateVoucherRedemption(
    redemptionId: string,
    dto: UpdateVoucherRedemptionDto
  ): Promise<AdminVoucherRedemptionResponseDto> {
    if (dto.status === VoucherRedemptionStatus.FULFILLED && !dto.code?.trim()) {
      throw new BadRequestException("Voucher code is required to fulfill");
    }

    const redemption = await this.rewardsRepository.updateVoucherRedemption(
      redemptionId,
      {
        status: dto.status,
        code: dto.code === undefined ? undefined : dto.code?.trim() || null,
        note: dto.note === undefined ? undefined : dto.note?.trim() || null,
      }
    );

    return RewardsMapper.toAdminVoucherRedemption(redemption);
  }

  async redeemVoucher(
    userId: string,
    campaignId: string,
    now = new Date()
  ): Promise<VoucherRedemptionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const campaign =
        await this.rewardsRepository.findVoucherCampaignForRedeem(
          campaignId,
          now,
          tx
        );

      if (!campaign) {
        throw new NotFoundException("Voucher campaign is not redeemable");
      }

      const existingRedemption =
        await this.rewardsRepository.findVoucherRedemption(
          userId,
          campaign.id,
          tx
        );

      if (existingRedemption) {
        throw new ConflictException("Voucher has already been redeemed");
      }

      const account = await this.rewardsRepository.ensureAccount(userId, tx);
      if (account.balance < campaign.costCoins) {
        throw new BadRequestException("Not enough Legal Coins to redeem voucher");
      }

      if (campaign.stock !== null) {
        const stockUpdate = await this.rewardsRepository.decrementVoucherStock(
          campaign.id,
          tx
        );
        if (stockUpdate.count === 0) {
          throw new ConflictException("Voucher is out of stock");
        }
      }

      const ledgerEntry = await this.createLedgerEntryOnce(tx, {
        userId,
        type: RewardTransactionType.SPEND,
        source: RewardSource.REDEMPTION,
        amount: -campaign.costCoins,
        referenceId: campaign.id,
        idempotencyKey: `redemption:${userId}:${campaign.id}`,
        metadata: {
          campaignId: campaign.id,
          title: campaign.title,
        } as Prisma.InputJsonValue,
        createdAt: now,
      });

      const redemption = await this.rewardsRepository.createVoucherRedemption(
        {
          userId,
          campaignId: campaign.id,
          costCoins: campaign.costCoins,
        },
        tx
      );

      return RewardsMapper.toVoucherRedemption(
        redemption,
        ledgerEntry.balanceAfter
      );
    });
  }

  async awardQuizAttempt(
    tx: Prisma.TransactionClient,
    params: {
      userId: string;
      attemptId: string;
      score: number;
      previousBestScore: number;
      now: Date;
    }
  ): Promise<{ coinsAwarded: number; coinBalance: number }> {
    const coinsAwarded = this.calculateQuizCoins(
      params.score,
      params.previousBestScore
    );

    if (coinsAwarded <= 0) {
      const account = await this.rewardsRepository.ensureAccount(
        params.userId,
        tx
      );
      return {
        coinsAwarded: 0,
        coinBalance: account.balance,
      };
    }

    const entry = await this.createLedgerEntryOnce(tx, {
      userId: params.userId,
      type: RewardTransactionType.EARN,
      source: RewardSource.QUIZ,
      amount: coinsAwarded,
      referenceId: params.attemptId,
      idempotencyKey: `quiz:${params.attemptId}`,
      metadata: {
        score: params.score,
        previousBestScore: params.previousBestScore,
      } as Prisma.InputJsonValue,
      createdAt: params.now,
    });

    return {
      coinsAwarded: entry.wasAlreadyApplied ? 0 : entry.amount,
      coinBalance: entry.balanceAfter,
    };
  }

  async claimGameReward(
    userId: string,
    dto: ClaimGameRewardDto,
    now = new Date()
  ): Promise<GameRewardClaimResponseDto> {
    if (dto.score <= 0) {
      throw new BadRequestException("Game score must be greater than 0");
    }

    const requestedCoins = this.calculateGameCoins(dto.score);
    const { startOfDay, startOfNextDay } = this.getDayWindow(now);
    const dailyEarned = await this.rewardsRepository.sumEarnedForSource({
      userId,
      source: RewardSource.GAME,
      startAt: startOfDay,
      endAt: startOfNextDay,
    });
    const earnedToday = dailyEarned._sum.amount ?? 0;
    const remainingBeforeClaim = Math.max(GAME_DAILY_COIN_CAP - earnedToday, 0);
    const coinsAwarded = Math.min(requestedCoins, remainingBeforeClaim);

    const result = await this.prisma.$transaction(async (tx) => {
      if (coinsAwarded <= 0) {
        const account = await this.rewardsRepository.ensureAccount(userId, tx);
        return {
          coinsAwarded: 0,
          coinBalance: account.balance,
          wasAlreadyClaimed: false,
        };
      }

      const entry = await this.createLedgerEntryOnce(tx, {
        userId,
        type: RewardTransactionType.EARN,
        source: RewardSource.GAME,
        amount: coinsAwarded,
        referenceId: dto.gameCode,
        idempotencyKey: `game:${userId}:${dto.idempotencyKey}`,
        metadata: {
          gameCode: dto.gameCode,
          score: dto.score,
          durationSeconds: dto.durationSeconds ?? null,
          requestedCoins,
        } as Prisma.InputJsonValue,
        createdAt: now,
      });

      return {
        coinsAwarded: entry.wasAlreadyApplied ? 0 : entry.amount,
        coinBalance: entry.balanceAfter,
        wasAlreadyClaimed: entry.wasAlreadyApplied,
      };
    });

    return {
      ...result,
      dailyRemaining: Math.max(
        remainingBeforeClaim - result.coinsAwarded,
        0
      ),
    };
  }

  private calculateQuizCoins(score: number, previousBestScore: number): number {
    let coins = 0;

    if (
      score >= QUIZ_COMPLETION_MIN_SCORE &&
      previousBestScore < QUIZ_COMPLETION_MIN_SCORE
    ) {
      coins += QUIZ_COMPLETION_COINS;
    }

    if (score === 100 && previousBestScore < 100) {
      coins += QUIZ_PERFECT_SCORE_COINS;
    }

    return coins;
  }

  private calculateGameCoins(score: number): number {
    return Math.min(
      GAME_MAX_COINS,
      Math.max(GAME_MIN_COINS, Math.floor(score / 10))
    );
  }

  private async createLedgerEntryOnce(
    tx: Prisma.TransactionClient,
    params: {
      userId: string;
      type: RewardTransactionType;
      source: RewardSource;
      amount: number;
      referenceId?: string | null;
      idempotencyKey: string;
      metadata?: Prisma.InputJsonValue;
      createdAt?: Date;
    }
  ): Promise<{
    amount: number;
    balanceAfter: number;
    wasAlreadyApplied: boolean;
  }> {
    const existing = await this.rewardsRepository.findLedgerEntryByIdempotencyKey(
      params.idempotencyKey,
      tx
    );

    if (existing) {
      return {
        amount: existing.amount,
        balanceAfter: existing.balanceAfter,
        wasAlreadyApplied: true,
      };
    }

    const entry = await this.rewardsRepository.createLedgerEntry(
      params,
      tx
    );

    return {
      amount: entry.amount,
      balanceAfter: entry.balanceAfter,
      wasAlreadyApplied: false,
    };
  }

  private getDayWindow(now: Date): {
    startOfDay: Date;
    startOfNextDay: Date;
  } {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1);

    return { startOfDay, startOfNextDay };
  }
}
