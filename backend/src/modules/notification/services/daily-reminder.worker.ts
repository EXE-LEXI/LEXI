import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  LessonReviewStatus,
  NotificationDeliveryStatus,
  NotificationDeliveryType,
} from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";
import { FirebaseService } from "../../../firebase/firebase.service";

type ReminderPreference = {
  dailyReminderEnabled: boolean;
  streakReminderEnabled: boolean;
  reviewReminderEnabled: boolean;
  reminderHour: number;
  timezone: string;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
};

type ReminderCandidate = {
  id: string;
  profile: { streak: number } | null;
  notificationPreference: ReminderPreference | null;
  deviceTokens: Array<{ token: string; revokedAt: Date | null }>;
};

type ReminderDefinition = {
  type: NotificationDeliveryType;
  title: string;
  body: string;
  data: Record<string, string>;
};

const DAILY_REMINDER: ReminderDefinition = {
  type: NotificationDeliveryType.DAILY_REMINDER,
  title: "Đến giờ học phòng vệ rồi!",
  body: "LEXI đang chờ bạn hoàn thành bài học hôm nay để giữ chuỗi đấy!",
  data: { type: "DAILY_REMINDER" },
};

const STREAK_REMINDER: ReminderDefinition = {
  type: NotificationDeliveryType.STREAK_REMINDER,
  title: "Đừng để mất chuỗi học tập!",
  body: "Bạn đang có chuỗi học tốt. Vào LEXI làm một bài ngắn để giữ nhịp hôm nay nhé.",
  data: { type: "STREAK_REMINDER" },
};

const REVIEW_REMINDER: ReminderDefinition = {
  type: NotificationDeliveryType.REVIEW_REMINDER,
  title: "Có câu sai đang chờ bạn ôn lại",
  body: "Ôn lại vài câu từng làm sai sẽ giúp bạn nhớ luật chắc hơn.",
  data: { type: "REVIEW_REMINDER" },
};

@Injectable()
export class DailyReminderWorker {
  private readonly logger = new Logger(DailyReminderWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDailyReminders(now = new Date()) {
    this.logger.log("Running retention reminder cron job...");

    try {
      const usersToRemind = await this.prisma.user.findMany({
        where: {
          OR: [
            { notificationPreference: { dailyReminderEnabled: true } },
            { notificationPreference: { streakReminderEnabled: true } },
            { notificationPreference: { reviewReminderEnabled: true } },
          ],
          deviceTokens: {
            some: { revokedAt: null },
          },
        },
        include: {
          profile: {
            select: { streak: true },
          },
          notificationPreference: true,
          deviceTokens: {
            where: { revokedAt: null },
          },
        },
      });

      let sentCount = 0;
      for (const user of usersToRemind as ReminderCandidate[]) {
        const preference = user.notificationPreference;
        if (!preference || !this.shouldSendAt(preference, now)) {
          continue;
        }

        const completedToday = await this.hasCompletedAttemptToday(
          user.id,
          preference.timezone,
          now
        );

        if (preference.dailyReminderEnabled && !completedToday) {
          sentCount += await this.sendReminder(user, DAILY_REMINDER, now);
        }

        if (
          preference.streakReminderEnabled &&
          !completedToday &&
          (user.profile?.streak ?? 0) > 0
        ) {
          sentCount += await this.sendReminder(user, STREAK_REMINDER, now);
        }

        if (
          preference.reviewReminderEnabled &&
          !completedToday &&
          (await this.hasReviewMistakes(user.id))
        ) {
          sentCount += await this.sendReminder(user, REVIEW_REMINDER, now);
        }
      }

      this.logger.log(
        `Retention reminder job completed. Checked ${usersToRemind.length} users, sent ${sentCount} messages.`
      );
    } catch (error) {
      this.logger.error("Failed to run retention reminder job", error);
    }
  }

  private shouldSendAt(preference: ReminderPreference, now: Date) {
    const localHour = this.getLocalParts(now, preference.timezone).hour;
    if (localHour !== preference.reminderHour) {
      return false;
    }

    return !this.isQuietHour(
      localHour,
      preference.quietHoursStart,
      preference.quietHoursEnd
    );
  }

  private async sendReminder(
    user: ReminderCandidate,
    reminder: ReminderDefinition,
    now: Date
  ) {
    const timezone = user.notificationPreference?.timezone ?? "Asia/Bangkok";
    const deliveryKey = this.getLocalDateKey(now, timezone);
    const deliveryLog = await this.reserveReminderDelivery(
      user.id,
      deliveryKey,
      reminder
    );
    if (!deliveryLog) {
      return 0;
    }

    let successCount = 0;
    let failureCount = 0;
    for (const token of user.deviceTokens) {
      const result = await this.firebaseService.sendToDevice(
        token.token,
        reminder.title,
        reminder.body,
        reminder.data
      );
      if (result.success) {
        successCount += 1;
      } else {
        failureCount += 1;
        if (result.invalidToken) {
          await this.revokeInvalidToken(token.token, now);
        }
      }
    }

    await this.finishReminderDelivery(
      deliveryLog.id,
      successCount,
      failureCount,
      now
    );

    return successCount;
  }

  private revokeInvalidToken(token: string, revokedAt: Date) {
    return this.prisma.deviceToken.updateMany({
      where: {
        token,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  }

  private async reserveReminderDelivery(
    userId: string,
    deliveryKey: string,
    reminder: ReminderDefinition
  ) {
    try {
      return await this.prisma.notificationDeliveryLog.create({
        data: {
          userId,
          type: reminder.type,
          deliveryKey,
          status: NotificationDeliveryStatus.PENDING,
          title: reminder.title,
          body: reminder.body,
          data: reminder.data,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        return null;
      }

      throw error;
    }
  }

  private finishReminderDelivery(
    id: string,
    successCount: number,
    failureCount: number,
    deliveredAt: Date
  ) {
    return this.prisma.notificationDeliveryLog.update({
      where: { id },
      data: {
        status: this.getDeliveryStatus(successCount, failureCount),
        successCount,
        failureCount,
        deliveredAt,
      },
    });
  }

  private getDeliveryStatus(successCount: number, failureCount: number) {
    if (successCount > 0 && failureCount > 0) {
      return NotificationDeliveryStatus.PARTIAL;
    }

    if (successCount > 0) {
      return NotificationDeliveryStatus.SENT;
    }

    return NotificationDeliveryStatus.FAILED;
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    );
  }

  private async hasCompletedAttemptToday(
    userId: string,
    timezone: string,
    now: Date
  ) {
    const { startUtc, endUtc } = this.getLocalDayUtcRange(now, timezone);
    const count = await this.prisma.lessonAttempt.count({
      where: {
        userId,
        finishedAt: {
          gte: startUtc,
          lt: endUtc,
        },
      },
    });

    return count > 0;
  }

  private async hasReviewMistakes(userId: string) {
    const count = await this.prisma.userAnswer.count({
      where: {
        isCorrect: false,
        attempt: {
          userId,
          lesson: {
            isActive: true,
            reviewStatus: LessonReviewStatus.PUBLISHED,
            module: {
              isActive: true,
              category: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    return count > 0;
  }

  private isQuietHour(
    hour: number,
    quietHoursStart: number | null,
    quietHoursEnd: number | null
  ) {
    if (quietHoursStart === null || quietHoursEnd === null) {
      return false;
    }

    if (quietHoursStart === quietHoursEnd) {
      return false;
    }

    if (quietHoursStart < quietHoursEnd) {
      return hour >= quietHoursStart && hour < quietHoursEnd;
    }

    return hour >= quietHoursStart || hour < quietHoursEnd;
  }

  private getLocalDateKey(now: Date, timezone: string) {
    const parts = this.getLocalParts(now, timezone);
    return [parts.year, parts.month, parts.day]
      .map((part) => String(part).padStart(2, "0"))
      .join("-");
  }

  private getLocalDayUtcRange(now: Date, timezone: string) {
    const parts = this.getLocalParts(now, timezone);
    const startUtc = this.zonedTimeToUtc(
      parts.year,
      parts.month,
      parts.day,
      0,
      0,
      0,
      timezone
    );
    const nextLocalDay = new Date(
      Date.UTC(parts.year, parts.month - 1, parts.day + 1)
    );
    const nextParts = this.getLocalParts(nextLocalDay, "UTC");
    const endUtc = this.zonedTimeToUtc(
      nextParts.year,
      nextParts.month,
      nextParts.day,
      0,
      0,
      0,
      timezone
    );

    return { startUtc, endUtc };
  }

  private zonedTimeToUtc(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    timezone: string
  ) {
    const utcGuess = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second)
    );
    const offsetMs = this.getTimeZoneOffsetMs(utcGuess, timezone);
    return new Date(utcGuess.getTime() - offsetMs);
  }

  private getTimeZoneOffsetMs(date: Date, timezone: string) {
    const parts = this.getLocalParts(date, timezone);
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    );
    return asUtc - date.getTime();
  }

  private getLocalParts(date: Date, timezone: string) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const values = Object.fromEntries(
      formatter
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    );

    return {
      year: values.year,
      month: values.month,
      day: values.day,
      hour: values.hour === 24 ? 0 : values.hour,
      minute: values.minute,
      second: values.second,
    };
  }
}
