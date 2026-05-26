import { ApiProperty } from "@nestjs/swagger";

export class PasswordChangeResponseDto {
  @ApiProperty()
  updated: boolean;
}
