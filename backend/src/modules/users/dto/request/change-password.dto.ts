import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";
import { USER_PASSWORD_MIN_LENGTH } from "../../constants/users.constants";

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ minLength: USER_PASSWORD_MIN_LENGTH })
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  newPassword: string;
}
