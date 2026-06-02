import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ example: "reset-token-from-email" })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: "newPassword123", minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
