import { ApiPropertyOptional } from "@nestjs/swagger";
import { RewardSource } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetRewardLedgerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RewardSource })
  @IsOptional()
  @IsEnum(RewardSource)
  source?: RewardSource;
}
