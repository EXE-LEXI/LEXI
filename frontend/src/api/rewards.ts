import { apiRequest } from "./http";
import type { PaginatedResponse } from "../types/api";

export type RewardSource =
  | "QUIZ"
  | "GAME"
  | "DAILY_CHALLENGE"
  | "ADMIN"
  | "REDEMPTION";

export type RewardAccount = {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
};

export type RewardLedgerEntry = {
  id: string;
  type: "EARN" | "SPEND" | "ADJUST" | "EXPIRE";
  source: RewardSource;
  amount: number;
  balanceAfter: number;
  referenceId: string | null;
  metadata: unknown;
  createdAt: string;
};

export type RewardRule = {
  code: string;
  source: RewardSource;
  title: string;
  description: string | null;
  points: number;
  dailyCap: number | null;
};

export type GameRewardClaim = {
  coinsAwarded: number;
  coinBalance: number;
  dailyRemaining: number;
  wasAlreadyClaimed: boolean;
};

export type VoucherCampaign = {
  id: string;
  title: string;
  description: string | null;
  costCoins: number;
  stock: number | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";
  startsAt: string | null;
  endsAt: string | null;
  isRedeemable: boolean;
  createdAt: string;
};

export type VoucherRedemption = {
  id: string;
  campaignId: string;
  costCoins: number;
  status: "PENDING" | "FULFILLED" | "CANCELLED";
  code: string | null;
  note: string | null;
  coinBalance: number;
  createdAt: string;
};

export function getRewardAccount(token: string) {
  return apiRequest<RewardAccount>("/rewards/me", { token });
}

export function getRewardLedger(
  token: string,
  params: { page?: number; limit?: number; source?: RewardSource | "all" } = {}
) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  if (params.source && params.source !== "all") {
    query.set("source", params.source);
  }

  return apiRequest<PaginatedResponse<RewardLedgerEntry>>(
    `/rewards/ledger?${query.toString()}`,
    { token }
  );
}

export function getRewardRules(token: string) {
  return apiRequest<RewardRule[]>("/rewards/rules", { token });
}

export function getVoucherCampaigns(token: string) {
  return apiRequest<VoucherCampaign[]>("/rewards/vouchers", { token });
}

export function redeemVoucher(token: string, campaignId: string) {
  return apiRequest<VoucherRedemption>(
    `/rewards/vouchers/${campaignId}/redeem`,
    {
      token,
      method: "POST",
    }
  );
}

export function claimGameReward(
  token: string,
  payload: {
    gameCode: string;
    score: number;
    durationSeconds?: number;
    idempotencyKey: string;
  }
) {
  return apiRequest<GameRewardClaim>("/rewards/games/claim", {
    token,
    method: "POST",
    body: payload,
  });
}
