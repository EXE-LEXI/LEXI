import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VoucherRedemptionStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetVoucherRedemptionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: VoucherRedemptionStatus })
  @IsOptional()
  @IsEnum(VoucherRedemptionStatus)
  status?: VoucherRedemptionStatus;
}

export class UpdateVoucherRedemptionDto {
  @ApiProperty({ enum: VoucherRedemptionStatus })
  @IsEnum(VoucherRedemptionStatus)
  status: VoucherRedemptionStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  code?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;
}
