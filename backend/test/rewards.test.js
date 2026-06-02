const assert = require("node:assert/strict");
const test = require("node:test");
const { RewardSource } = require("@prisma/client");
const {
  RewardsService,
} = require("../dist/src/modules/rewards/services/rewards.service");

test("rewards service awards quiz coins only when crossing thresholds", async () => {
  const repository = createRewardsRepository();
  const service = new RewardsService(createPrisma(), repository);
  const now = new Date("2026-06-01T00:00:00.000Z");

  const firstAward = await service.awardQuizAttempt(
    {},
    {
      userId: "user-1",
      attemptId: "attempt-1",
      score: 80,
      previousBestScore: 40,
      now,
    }
  );

  assert.equal(firstAward.coinsAwarded, 20);
  assert.equal(firstAward.coinBalance, 20);

  const repeatAward = await service.awardQuizAttempt(
    {},
    {
      userId: "user-1",
      attemptId: "attempt-2",
      score: 90,
      previousBestScore: 80,
      now,
    }
  );

  assert.equal(repeatAward.coinsAwarded, 0);
  assert.equal(repeatAward.coinBalance, 20);

  const perfectAward = await service.awardQuizAttempt(
    {},
    {
      userId: "user-1",
      attemptId: "attempt-3",
      score: 100,
      previousBestScore: 90,
      now,
    }
  );

  assert.equal(perfectAward.coinsAwarded, 10);
  assert.equal(perfectAward.coinBalance, 30);
});

test("rewards service caps game rewards per day", async () => {
  const repository = createRewardsRepository({ earnedToday: 25 });
  const service = new RewardsService(createPrisma(), repository);

  const reward = await service.claimGameReward(
    "user-1",
    {
      gameCode: "court-simulator",
      score: 100,
      idempotencyKey: "court-simulator:session-1",
    },
    new Date("2026-06-01T10:00:00.000Z")
  );

  assert.equal(reward.coinsAwarded, 5);
  assert.equal(reward.coinBalance, 5);
  assert.equal(reward.dailyRemaining, 0);
  assert.equal(reward.wasAlreadyClaimed, false);
  assert.equal(repository.entries[0].source, RewardSource.GAME);
});

test("rewards service redeems voucher and spends coins through ledger", async () => {
  const repository = createRewardsRepository({
    balance: 120,
    campaign: {
      id: "voucher-1",
      title: "Beta voucher",
      costCoins: 75,
      stock: 2,
    },
  });
  const service = new RewardsService(createPrisma(), repository);

  const redemption = await service.redeemVoucher(
    "user-1",
    "voucher-1",
    new Date("2026-06-01T10:00:00.000Z")
  );

  assert.equal(redemption.campaignId, "voucher-1");
  assert.equal(redemption.costCoins, 75);
  assert.equal(redemption.coinBalance, 45);
  assert.equal(repository.balance, 45);
  assert.equal(repository.campaign.stock, 1);
  assert.equal(repository.entries[0].source, RewardSource.REDEMPTION);
  assert.equal(repository.entries[0].amount, -75);
});

function createPrisma() {
  return {
    $transaction: async (callback) => callback({}),
  };
}

function createRewardsRepository(options = {}) {
  const repository = {
    balance: options.balance ?? 0,
    earnedToday: options.earnedToday ?? 0,
    campaign: options.campaign
      ? {
          status: "ACTIVE",
          description: null,
          startsAt: null,
          endsAt: null,
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
          ...options.campaign,
        }
      : null,
    redemptions: [],
    entries: [],
    ensureAccount: async () => ({
      balance: repository.balance,
      lifetimeEarned: repository.balance,
      lifetimeSpent: 0,
    }),
    findLedgerEntryByIdempotencyKey: async (key) =>
      repository.entries.find((entry) => entry.idempotencyKey === key) ?? null,
    createLedgerEntry: async (params) => {
      repository.balance += params.amount;
      const entry = {
        ...params,
        id: `entry-${repository.entries.length + 1}`,
        balanceAfter: repository.balance,
        createdAt: params.createdAt ?? new Date(),
      };
      repository.entries.push(entry);
      return entry;
    },
    sumEarnedForSource: async () => ({
      _sum: {
        amount: repository.earnedToday,
      },
    }),
    countLedgerEntries: async () => repository.entries.length,
    findLedgerEntries: async () => repository.entries,
    findActiveRules: async () => [],
    findVoucherCatalog: async () =>
      repository.campaign ? [repository.campaign] : [],
    findVoucherCampaignForRedeem: async (campaignId) =>
      repository.campaign?.id === campaignId ? repository.campaign : null,
    findVoucherRedemption: async (userId, campaignId) =>
      repository.redemptions.find(
        (entry) => entry.userId === userId && entry.campaignId === campaignId
      ) ?? null,
    createVoucherRedemption: async (params) => {
      const redemption = {
        id: `redemption-${repository.redemptions.length + 1}`,
        status: "PENDING",
        code: null,
        note: params.note ?? null,
        createdAt: new Date("2026-06-01T10:00:00.000Z"),
        ...params,
      };
      repository.redemptions.push(redemption);
      return redemption;
    },
    decrementVoucherStock: async () => {
      if (!repository.campaign || repository.campaign.stock === null) {
        return { count: 0 };
      }
      if (repository.campaign.stock <= 0) {
        return { count: 0 };
      }
      repository.campaign.stock -= 1;
      return { count: 1 };
    },
  };

  return repository;
}
