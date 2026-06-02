import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  DEFAULT_MODULES_LIMIT,
  DEFAULT_MODULES_PAGE,
} from "../../learning/modules/constants/modules.constants";
import { GetNotificationInboxQueryDto } from "../dto/request/get-notification-inbox-query.dto";
import { NotificationInboxListResponseDto } from "../dto/response/notification-inbox-response.dto";
import { NotificationInboxMapper } from "../mappers/notification-inbox.mapper";
import { NotificationInboxRepository } from "../repositories/notification-inbox.repository";

@Injectable()
export class NotificationInboxService {
  constructor(
    private readonly notificationInboxRepository: NotificationInboxRepository
  ) {}

  async getInbox(
    userId: string,
    query: GetNotificationInboxQueryDto
  ): Promise<NotificationInboxListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, logs] = await this.notificationInboxRepository.findInboxItems(
      {
        userId,
        where: this.buildWhere(query),
        page,
        limit,
      }
    );

    return NotificationInboxMapper.toPaginated({
      logs,
      total,
      page,
      limit,
    });
  }

  async markRead(
    userId: string,
    notificationId: string
  ): Promise<{ updated: true }> {
    const result = await this.notificationInboxRepository.markRead(
      userId,
      notificationId,
      new Date()
    );
    if (result.count === 0) {
      throw new NotFoundException("Notification not found");
    }
    return { updated: true };
  }

  async markAllRead(userId: string) {
    const result = await this.notificationInboxRepository.markAllRead(
      userId,
      new Date()
    );
    return { updated: result.count };
  }

  async dismiss(
    userId: string,
    notificationId: string
  ): Promise<{ deleted: true }> {
    const result = await this.notificationInboxRepository.dismiss(
      userId,
      notificationId,
      new Date()
    );
    if (result.count === 0) {
      throw new NotFoundException("Notification not found");
    }
    return { deleted: true };
  }

  private buildWhere(
    query: GetNotificationInboxQueryDto
  ): Prisma.NotificationDeliveryLogWhereInput {
    const where: Prisma.NotificationDeliveryLogWhereInput = {};
    if (query.type) {
      where.type = query.type;
    }
    if (query.isRead === true) {
      where.readAt = { not: null };
    }
    if (query.isRead === false) {
      where.readAt = null;
    }
    return where;
  }
}
