import {
  NotificationDeliveryStatus,
  NotificationDeliveryType,
} from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetAdminNotificationDeliveryLogsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(NotificationDeliveryType)
  type?: NotificationDeliveryType;

  @IsOptional()
  @IsEnum(NotificationDeliveryStatus)
  status?: NotificationDeliveryStatus;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  deliveryKey?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
