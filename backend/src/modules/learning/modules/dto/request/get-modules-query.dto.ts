import { PaginationQueryDto } from "../../../../../common/dto/pagination-query.dto";
import { IsOptional, IsString } from "class-validator";

export class GetModulesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  categoryId?: string;
}
