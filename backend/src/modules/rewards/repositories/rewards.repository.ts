import { Injectable } from "@nestjs/common";
import {
  Prisma,
  RewardSource,
  RewardTransactionType,
  VoucherCampaignStatus,
  VoucherRedemptionStatus,
} from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";

type PrismaClientLike = Prisma.TransactionClient | PrismaService;

@Injectable()
export class RewardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  ensureAccount(userId: string, tx: PrismaClientLike = this.prisma) {
    return tx.rewardAccount.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  findAccount(userId: string) {
    return this.prisma.rewardAccount.findUnique({
      where: { userId },
    });
  }

  findLedgerEntryByIdempotencyKey(
    idempotencyKey: string,
    tx: PrismaClientLike = this.prisma
  ) {
    return tx.rewardLedgerEntry.findUnique({
      where: { idempotencyKey },
    });
  }

  async createLedgerEntry(
    params: {
      userId: string;
      type: RewardTransactionType;
      source: RewardSource;
      amount: number;
      referenceId?: string | null;
      idempotencyKey: string;
      metadata?: Prisma.InputJsonValue;
      createdAt?: Date;
    },
    tx: PrismaClientLike = this.prisma
  ) {
    const account = await this.ensureAccount(params.userId, tx);
    const nextBalance = account.balance + params.amount;

    const updatedAccount = await tx.rewardAccount.update({
      where: { userId: params.userId },
      data: {
        balance: nextBalance,
        lifetimeEarned:
          params.amount > 0
            ? { increment: params.amount }
            : undefined,
        lifetimeSpent:
          params.amount < 0
            ? { increment: Math.abs(params.amount) }
            : undefined,
      },
    });

    return tx.rewardLedgerEntry.create({
      data: {
        userId: params.userId,
        type: params.type,
        source: params.source,
        amount: params.amount,
        balanceAfter: updatedAccount.balance,
        referenceId: params.referenceId ?? null,
        idempotencyKey: params.idempotencyKey,
        metadata: params.metadata,
        createdAt: params.createdAt,
      },
    });
  }

  countLedgerEntries(params: {
    userId: string;
    source?: RewardSource;
  }) {
    return this.prisma.rewardLedgerEntry.count({
      where: {
        userId: params.userId,
        source: params.source,
      },
    });
  }

  findLedgerEntries(params: {
    userId: string;
    source?: RewardSource;
    page: number;
    limit: number;
  }) {
    return this.prisma.rewardLedgerEntry.findMany({
      where: {
        userId: params.userId,
        source: params.source,
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    });
  }

  sumEarnedForSource(params: {
    userId: string;
    source: RewardSource;
    startAt: Date;
    endAt: Date;
  }) {
    return this.prisma.rewardLedgerEntry.aggregate({
      where: {
        userId: params.userId,
        source: params.source,
        amount: { gt: 0 },
        createdAt: {
          gte: params.startAt,
          lt: params.endAt,
        },
      },
      _sum: {
        amount: true,
      },
    });
  }

  findActiveRules() {
    return this.prisma.rewardRule.findMany({
      where: { isActive: true },
      orderBy: [{ source: "asc" }, { points: "desc" }],
    });
  }

  findVoucherCatalog(now: Date) {
    return this.prisma.voucherCampaign.findMany({
      where: {
        status: VoucherCampaignStatus.ACTIVE,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gt: now } }],
          },
          {
            OR: [{ stock: null }, { stock: { gt: 0 } }],
          },
        ],
      },
      orderBy: [{ costCoins: "asc" }, { createdAt: "desc" }],
    });
  }

  findVoucherCampaignForRedeem(
    campaignId: string,
    now: Date,
    tx: PrismaClientLike
  ) {
    return tx.voucherCampaign.findFirst({
      where: {
        id: campaignId,
        status: VoucherCampaignStatus.ACTIVE,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gt: now } }],
          },
          {
            OR: [{ stock: null }, { stock: { gt: 0 } }],
          },
        ],
      },
    });
  }

  findVoucherRedemption(
    userId: string,
    campaignId: string,
    tx: PrismaClientLike
  ) {
    return tx.voucherRedemption.findUnique({
      where: {
        userId_campaignId: {
          userId,
          campaignId,
        },
      },
    });
  }

  createVoucherRedemption(
    params: {
      userId: string;
      campaignId: string;
      costCoins: number;
      note?: string | null;
    },
    tx: PrismaClientLike
  ) {
    return tx.voucherRedemption.create({
      data: {
        userId: params.userId,
        campaignId: params.campaignId,
        costCoins: params.costCoins,
        note: params.note ?? "Voucher dang cho admin cap ma that.",
      },
    });
  }

  decrementVoucherStock(campaignId: string, tx: PrismaClientLike) {
    return tx.voucherCampaign.updateMany({
      where: {
        id: campaignId,
        stock: { not: null, gt: 0 },
      },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });
  }

  findAdminVoucherCampaigns() {
    return this.prisma.voucherCampaign.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
  }

  createVoucherCampaign(data: Prisma.VoucherCampaignCreateInput) {
    return this.prisma.voucherCampaign.create({ data });
  }

  updateVoucherCampaign(
    campaignId: string,
    data: Prisma.VoucherCampaignUpdateInput
  ) {
    return this.prisma.voucherCampaign.update({
      where: { id: campaignId },
      data,
    });
  }

  countVoucherRedemptions(status?: VoucherRedemptionStatus) {
    return this.prisma.voucherRedemption.count({
      where: { status },
    });
  }

  findVoucherRedemptions(params: {
    status?: VoucherRedemptionStatus;
    page: number;
    limit: number;
  }) {
    return this.prisma.voucherRedemption.findMany({
      where: { status: params.status },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  updateVoucherRedemption(
    redemptionId: string,
    data: Prisma.VoucherRedemptionUpdateInput
  ) {
    return this.prisma.voucherRedemption.update({
      where: { id: redemptionId },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}
