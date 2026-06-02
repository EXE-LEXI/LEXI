import { ApiProperty } from "@nestjs/swagger";
import {
  NotificationDeliveryStatus,
  NotificationDeliveryType,
} from "@prisma/client";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class NotificationInboxItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationDeliveryType })
  type: NotificationDeliveryType;

  @ApiProperty()
  category: "study" | "review" | "system";

  @ApiProperty({ enum: NotificationDeliveryStatus })
  status: NotificationDeliveryStatus;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ nullable: true })
  data: unknown;

  @ApiProperty({ nullable: true })
  ctaPath: string | null;

  @ApiProperty({ nullable: true })
  ctaText: string | null;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ nullable: true })
  readAt: Date | null;

  @ApiProperty({ nullable: true })
  deliveredAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}

export class NotificationInboxListResponseDto
  implements PaginatedResponseDto<NotificationInboxItemResponseDto>
{
  @ApiProperty({ type: NotificationInboxItemResponseDto, isArray: true })
  items: NotificationInboxItemResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<NotificationInboxItemResponseDto>["meta"];
}
