import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ChangePasswordDto } from "../dto/request/change-password.dto";
import { UpdateProfileDto } from "../dto/request/update-profile.dto";
import { PasswordChangeResponseDto } from "../dto/response/password-change-response.dto";
import { UserResponseDto } from "../dto/response/user-response.dto";
import { UsersService } from "../services/users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Get the current user profile" })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(@CurrentUser() user: AuthUserDto): Promise<UserResponseDto> {
    return this.usersService.getMe(user.id);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update the current user profile" })
  @ApiOkResponse({ type: UserResponseDto })
  async updateMe(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: UpdateProfileDto
  ): Promise<UserResponseDto> {
    return this.usersService.updateMe(user.id, dto);
  }

  @Patch("me/password")
  @ApiOperation({ summary: "Change the current user password" })
  @ApiOkResponse({ type: PasswordChangeResponseDto })
  async changePassword(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: ChangePasswordDto
  ): Promise<PasswordChangeResponseDto> {
    return this.usersService.changePassword(user.id, dto);
  }
}
