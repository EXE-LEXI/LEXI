import { ApiProperty } from "@nestjs/swagger";
import { FeedbackReportStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateFeedbackReportStatusDto {
  @ApiProperty({ enum: FeedbackReportStatus })
  @IsEnum(FeedbackReportStatus)
  status: FeedbackReportStatus;
}
