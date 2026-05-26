import { ApiProperty } from "@nestjs/swagger";
import {
  NotificationDeliveryStatus,
  NotificationDeliveryType,
} from "@prisma/client";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class AdminNotificationDeliveryLogUserProfileDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

export class AdminNotificationDeliveryLogUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    type: AdminNotificationDeliveryLogUserProfileDto,
    nullable: true,
  })
  profile: AdminNotificationDeliveryLogUserProfileDto | null;
}

export class AdminNotificationDeliveryLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: AdminNotificationDeliveryLogUserDto })
  user: AdminNotificationDeliveryLogUserDto;

  @ApiProperty({ enum: NotificationDeliveryType })
  type: NotificationDeliveryType;

  @ApiProperty()
  deliveryKey: string;

  @ApiProperty({ enum: NotificationDeliveryStatus })
  status: NotificationDeliveryStatus;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ nullable: true })
  data: unknown;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  failureCount: number;

  @ApiProperty({ nullable: true })
  deliveredAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminNotificationDeliveryLogListResponseDto
  implements PaginatedResponseDto<AdminNotificationDeliveryLogResponseDto>
{
  @ApiProperty({
    type: AdminNotificationDeliveryLogResponseDto,
    isArray: true,
  })
  items: AdminNotificationDeliveryLogResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<AdminNotificationDeliveryLogResponseDto>["meta"];
}
