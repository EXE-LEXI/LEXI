import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { BadgesResponseDto } from "../dto/response/badge-response.dto";
import { BadgesService } from "../services/badges.service";

@ApiTags("gamification")
@ApiBearerAuth()
@Controller("gamification")
@UseGuards(JwtAuthGuard)
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get("badges")
  @ApiOperation({ summary: "Get badge catalog and unlock state" })
  @ApiOkResponse({ type: BadgesResponseDto })
  async getBadges(
    @CurrentUser() user: AuthUserDto
  ): Promise<BadgesResponseDto> {
    return this.badgesService.getBadges(user.id);
  }
}
