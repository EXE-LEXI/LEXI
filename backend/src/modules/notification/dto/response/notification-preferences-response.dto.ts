export class NotificationPreferencesResponseDto {
  id: string;
  dailyReminderEnabled: boolean;
  streakReminderEnabled: boolean;
  reviewReminderEnabled: boolean;
  reminderHour: number;
  timezone: string;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  createdAt: Date;
  updatedAt: Date;
}
