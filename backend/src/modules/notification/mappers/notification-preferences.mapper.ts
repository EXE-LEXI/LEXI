import { NotificationPreference } from "@prisma/client";
import { NotificationPreferencesResponseDto } from "../dto/response/notification-preferences-response.dto";

export class NotificationPreferencesMapper {
  static toResponse(
    preference: NotificationPreference
  ): NotificationPreferencesResponseDto {
    return {
      id: preference.id,
      dailyReminderEnabled: preference.dailyReminderEnabled,
      streakReminderEnabled: preference.streakReminderEnabled,
      reviewReminderEnabled: preference.reviewReminderEnabled,
      reminderHour: preference.reminderHour,
      timezone: preference.timezone,
      quietHoursStart: preference.quietHoursStart,
      quietHoursEnd: preference.quietHoursEnd,
      createdAt: preference.createdAt,
      updatedAt: preference.updatedAt,
    };
  }
}
