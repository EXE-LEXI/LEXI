import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class ResourceLegalSourceSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  sourceUrl: string | null;

  @ApiProperty({ nullable: true })
  legalDocumentNo: string | null;

  @ApiProperty({ nullable: true })
  effectiveDate: Date | null;

  @ApiProperty()
  excerpt: string;

  @ApiProperty({ nullable: true })
  crawledAt: Date | null;

  @ApiProperty()
  updatedAt: Date;
}

export class ResourceLegalSourceDetailResponseDto extends ResourceLegalSourceSummaryResponseDto {
  @ApiProperty()
  content: string;
}

export class ResourceLegalSourceListResponseDto
  implements PaginatedResponseDto<ResourceLegalSourceSummaryResponseDto>
{
  @ApiProperty({ type: ResourceLegalSourceSummaryResponseDto, isArray: true })
  items: ResourceLegalSourceSummaryResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<ResourceLegalSourceSummaryResponseDto>["meta"];
}
