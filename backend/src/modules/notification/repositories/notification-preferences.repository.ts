import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../core/prisma.service";

export type NotificationPreferenceUpdateData = {
  dailyReminderEnabled?: boolean;
  streakReminderEnabled?: boolean;
  reviewReminderEnabled?: boolean;
  reminderHour?: number;
  timezone?: string;
  quietHoursStart?: number | null;
  quietHoursEnd?: number | null;
};

@Injectable()
export class NotificationPreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  createDefault(userId: string) {
    return this.prisma.notificationPreference.create({
      data: { userId },
    });
  }

  upsertForUser(userId: string, data: NotificationPreferenceUpdateData) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }
}
