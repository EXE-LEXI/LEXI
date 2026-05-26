import { BadgesResponseDto } from "../dto/response/badge-response.dto";

export class BadgesMapper {
  static toResponse(badges: any[]): BadgesResponseDto {
    return {
      items: badges.map((badge) => {
        const unlockedAt = badge.users?.[0]?.unlockedAt ?? null;

        return {
          id: badge.id,
          code: badge.code,
          title: badge.title,
          description: badge.description,
          iconName: badge.iconName,
          criteriaType: badge.criteriaType,
          isUnlocked: unlockedAt !== null,
          unlockedAt,
        };
      }),
    };
  }
}
