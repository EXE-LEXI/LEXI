import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PasswordResetRequestResponseDto {
  @ApiProperty({ example: true })
  accepted: boolean;

  @ApiPropertyOptional({
    example: "dev-only-reset-token",
    nullable: true,
    description: "Returned only outside production until email delivery is configured.",
  })
  resetToken?: string | null;
}

export class PasswordResetResponseDto {
  @ApiProperty({ example: true })
  reset: boolean;
}
