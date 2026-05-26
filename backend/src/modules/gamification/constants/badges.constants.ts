import { BadgeCriteriaType } from "@prisma/client";

export const DEFAULT_BADGES = [
  {
    code: "first_lesson",
    title: "Bài học đầu tiên",
    description: "Hoàn thành bài học đầu tiên.",
    iconName: "school",
    criteriaType: BadgeCriteriaType.FIRST_LESSON,
    sortOrder: 1,
  },
  {
    code: "three_lessons",
    title: "Khởi đầu đều đặn",
    description: "Hoàn thành 3 bài học khác nhau.",
    iconName: "auto_stories",
    criteriaType: BadgeCriteriaType.THREE_LESSONS,
    sortOrder: 2,
  },
  {
    code: "perfect_score",
    title: "Điểm tuyệt đối",
    description: "Đạt 100% trong một bài quiz.",
    iconName: "verified",
    criteriaType: BadgeCriteriaType.PERFECT_SCORE,
    sortOrder: 3,
  },
  {
    code: "five_attempts",
    title: "Thói quen luyện tập",
    description: "Hoàn thành 5 lượt làm quiz.",
    iconName: "repeat",
    criteriaType: BadgeCriteriaType.FIVE_ATTEMPTS,
    sortOrder: 4,
  },
  {
    code: "seven_day_streak",
    title: "Chuỗi 7 ngày",
    description: "Học trong 7 ngày hoạt động liên tiếp.",
    iconName: "local_fire_department",
    criteriaType: BadgeCriteriaType.SEVEN_DAY_STREAK,
    sortOrder: 5,
  },
] as const;

export const BADGE_STREAK_LOOKBACK_ATTEMPTS = 120;
