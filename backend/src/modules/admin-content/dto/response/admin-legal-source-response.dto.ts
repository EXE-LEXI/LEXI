import { ApiProperty } from "@nestjs/swagger";
import { LegalSourceCrawlStatus } from "@prisma/client";
import { PaginatedResponseDto } from "../../../../common/dto/pagination-meta.dto";

export class AdminLegalSourceResponseDto {
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
  rawText: string;

  @ApiProperty({ nullable: true })
  normalizedText: string | null;

  @ApiProperty({ nullable: true })
  contentHash: string | null;

  @ApiProperty({ enum: LegalSourceCrawlStatus })
  crawlStatus: LegalSourceCrawlStatus;

  @ApiProperty({ nullable: true })
  crawledAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminLegalSourceListResponseDto
  implements PaginatedResponseDto<AdminLegalSourceResponseDto>
{
  @ApiProperty({ type: AdminLegalSourceResponseDto, isArray: true })
  items: AdminLegalSourceResponseDto[];

  @ApiProperty()
  meta: PaginatedResponseDto<AdminLegalSourceResponseDto>["meta"];
}
