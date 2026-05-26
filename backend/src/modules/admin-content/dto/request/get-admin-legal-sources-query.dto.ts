import { LegalSourceCrawlStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class GetAdminLegalSourcesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LegalSourceCrawlStatus)
  status?: LegalSourceCrawlStatus;

  @IsOptional()
  @IsString()
  legalDocumentNo?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
