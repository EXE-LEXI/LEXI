export class BadgeItemDto {
  id: string;
  code: string;
  title: string;
  description: string;
  iconName: string;
  criteriaType: string;
  isUnlocked: boolean;
  unlockedAt: Date | null;
}

export class BadgesResponseDto {
  items: BadgeItemDto[];
}
