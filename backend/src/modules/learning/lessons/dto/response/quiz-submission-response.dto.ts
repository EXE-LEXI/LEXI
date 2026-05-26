import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class QuizSubmissionAnswerResultResponseDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty()
  selectedOptionId: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiPropertyOptional({ nullable: true })
  correctOptionId: string | null;

  @ApiPropertyOptional({ nullable: true })
  explanation: string | null;
}

export class QuizSubmissionResponseDto {
  @ApiProperty()
  attemptId: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  correctCount: number;

  @ApiProperty()
  wrongCount: number;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  xpAwarded: number;

  @ApiProperty()
  bestScore: number;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty({ type: [QuizSubmissionAnswerResultResponseDto] })
  results: QuizSubmissionAnswerResultResponseDto[];

  @ApiPropertyOptional()
  newBadges?: {
    id: string;
    code: string;
    title: string;
    description: string;
    iconName: string;
    unlockedAt: Date;
  }[];
}
