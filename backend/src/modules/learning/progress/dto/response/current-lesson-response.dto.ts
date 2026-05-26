import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProgressStatus } from "@prisma/client";

export class CurrentLessonCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class CurrentLessonModuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class CurrentLessonDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: CurrentLessonModuleResponseDto })
  module: CurrentLessonModuleResponseDto;

  @ApiProperty({ type: CurrentLessonCategoryResponseDto })
  category: CurrentLessonCategoryResponseDto;
}

export class CurrentLessonProgressResponseDto {
  @ApiProperty({ enum: ProgressStatus })
  status: ProgressStatus;

  @ApiPropertyOptional({ nullable: true })
  lastScore: number | null;

  @ApiPropertyOptional({ nullable: true })
  completedAt: Date | null;
}

export class CurrentLessonResponseDto {
  @ApiProperty({ type: CurrentLessonDetailResponseDto, nullable: true })
  currentLesson: CurrentLessonDetailResponseDto | null;

  @ApiProperty({ type: CurrentLessonProgressResponseDto, nullable: true })
  progress: CurrentLessonProgressResponseDto | null;

  @ApiProperty()
  isCourseCompleted: boolean;
}
