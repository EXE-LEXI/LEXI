import { NotificationDeliveryType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetNotificationInboxQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(NotificationDeliveryType)
  type?: NotificationDeliveryType;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === "" ? undefined : value === "true"
  )
  @IsBoolean()
  isRead?: boolean;
}
