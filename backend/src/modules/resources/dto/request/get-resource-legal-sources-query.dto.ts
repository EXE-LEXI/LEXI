import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetResourceLegalSourcesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  legalDocumentNo?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
