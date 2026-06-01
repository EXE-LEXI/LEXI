import { Injectable } from "@nestjs/common";
import { NotificationDeliveryStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";

@Injectable()
export class NotificationInboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  findInboxItems(params: {
    userId: string;
    where: Prisma.NotificationDeliveryLogWhereInput;
    page: number;
    limit: number;
  }) {
    const where: Prisma.NotificationDeliveryLogWhereInput = {
      ...params.where,
      userId: params.userId,
      dismissedAt: null,
      status: { not: NotificationDeliveryStatus.FAILED },
    };

    return this.prisma.$transaction([
      this.prisma.notificationDeliveryLog.count({ where }),
      this.prisma.notificationDeliveryLog.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [{ deliveredAt: "desc" }, { createdAt: "desc" }],
      }),
    ]);
  }

  markRead(userId: string, notificationId: string, readAt: Date) {
    return this.prisma.notificationDeliveryLog.updateMany({
      where: {
        id: notificationId,
        userId,
        dismissedAt: null,
      },
      data: { readAt },
    });
  }

  markAllRead(userId: string, readAt: Date) {
    return this.prisma.notificationDeliveryLog.updateMany({
      where: {
        userId,
        readAt: null,
        dismissedAt: null,
        status: { not: NotificationDeliveryStatus.FAILED },
      },
      data: { readAt },
    });
  }

  dismiss(userId: string, notificationId: string, dismissedAt: Date) {
    return this.prisma.notificationDeliveryLog.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { dismissedAt },
    });
  }
}
