import { ApiProperty } from "@nestjs/swagger";
import { AdminLegalSourceResponseDto } from "./admin-legal-source-response.dto";
import { AdminLessonDraftResponseDto } from "./admin-lesson-draft-response.dto";

export class AdminLegalSourceCrawlErrorDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  message: string;
}

export class AdminLegalSourceCrawlResponseDto {
  @ApiProperty({ type: AdminLegalSourceResponseDto, isArray: true })
  sources: AdminLegalSourceResponseDto[];

  @ApiProperty({ type: AdminLessonDraftResponseDto, isArray: true })
  drafts: AdminLessonDraftResponseDto[];

  @ApiProperty({ type: AdminLegalSourceCrawlErrorDto, isArray: true })
  errors: AdminLegalSourceCrawlErrorDto[];
}
