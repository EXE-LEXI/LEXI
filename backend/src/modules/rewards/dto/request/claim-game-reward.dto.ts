import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class ClaimGameRewardDto {
  @ApiProperty({ example: "court-simulator" })
  @IsString()
  @MaxLength(80)
  gameCode: string;

  @ApiProperty({ minimum: 0, maximum: 100, example: 85 })
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @ApiPropertyOptional({ minimum: 0, example: 180 })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @ApiProperty({ example: "court-simulator:1717220000" })
  @IsString()
  @MaxLength(160)
  idempotencyKey: string;
}
