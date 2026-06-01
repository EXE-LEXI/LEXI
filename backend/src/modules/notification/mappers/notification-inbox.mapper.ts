import {
  NotificationDeliveryType,
} from "@prisma/client";
import { buildPaginationMeta } from "../../../common/dto/pagination-meta.dto";
import {
  NotificationInboxItemResponseDto,
  NotificationInboxListResponseDto,
} from "../dto/response/notification-inbox-response.dto";

export class NotificationInboxMapper {
  static toItem(log: any): NotificationInboxItemResponseDto {
    const cta = this.getCta(log.type);

    return {
      id: log.id,
      type: log.type,
      category: this.getCategory(log.type),
      status: log.status,
      title: log.title,
      body: log.body,
      data: log.data,
      ctaPath: cta.path,
      ctaText: cta.text,
      isRead: Boolean(log.readAt),
      readAt: log.readAt,
      deliveredAt: log.deliveredAt,
      createdAt: log.createdAt,
    };
  }

  static toPaginated(params: {
    logs: any[];
    total: number;
    page: number;
    limit: number;
  }): NotificationInboxListResponseDto {
    return {
      items: params.logs.map((log) => this.toItem(log)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  private static getCategory(
    type: NotificationDeliveryType
  ): "study" | "review" | "system" {
    if (type === NotificationDeliveryType.REVIEW_REMINDER) {
      return "review";
    }
    return "study";
  }

  private static getCta(type: NotificationDeliveryType) {
    if (type === NotificationDeliveryType.REVIEW_REMINDER) {
      return { path: "/review", text: "On lai bai" };
    }
    return { path: "/dashboard", text: "Hoc tiep" };
  }
}
