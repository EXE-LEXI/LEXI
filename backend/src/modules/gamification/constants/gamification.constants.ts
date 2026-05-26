import { DailyChallengeType } from "@prisma/client";

export const DEFAULT_DAILY_CHALLENGES = [
  {
    code: "complete_lessons_daily",
    title: "Hoàn thành bài học hôm nay",
    description: "Hoàn thành 3 bài học khác nhau để giữ nhịp học mỗi ngày.",
    type: DailyChallengeType.COMPLETE_LESSONS,
    target: 3,
    rewardXp: 20,
    sortOrder: 1,
  },
] as const;
