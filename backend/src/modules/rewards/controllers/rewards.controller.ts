import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUserDto } from "../../auth/dto/response/auth-user.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ClaimGameRewardDto } from "../dto/request/claim-game-reward.dto";
import { GetRewardLedgerQueryDto } from "../dto/request/get-reward-ledger-query.dto";
import {
  GameRewardClaimResponseDto,
  RewardAccountResponseDto,
  RewardLedgerEntryResponseDto,
  RewardRuleResponseDto,
  VoucherCampaignResponseDto,
  VoucherRedemptionResponseDto,
} from "../dto/response/reward-response.dto";
import { RewardsService } from "../services/rewards.service";

@ApiTags("rewards")
@ApiBearerAuth()
@Controller("rewards")
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user's reward balance" })
  @ApiOkResponse({ type: RewardAccountResponseDto })
  getMyRewards(@CurrentUser() user: AuthUserDto) {
    return this.rewardsService.getAccount(user.id);
  }

  @Get("ledger")
  @ApiOperation({ summary: "Get current user's reward ledger" })
  @ApiOkResponse({ type: [RewardLedgerEntryResponseDto] })
  getMyLedger(
    @CurrentUser() user: AuthUserDto,
    @Query() query: GetRewardLedgerQueryDto
  ) {
    return this.rewardsService.getLedger(user.id, query);
  }

  @Get("rules")
  @ApiOperation({ summary: "Get active reward rules" })
  @ApiOkResponse({ type: [RewardRuleResponseDto] })
  getRules() {
    return this.rewardsService.getRules();
  }

  @Get("vouchers")
  @ApiOperation({ summary: "Get redeemable voucher campaigns" })
  @ApiOkResponse({ type: [VoucherCampaignResponseDto] })
  getVouchers() {
    return this.rewardsService.getVoucherCatalog();
  }

  @Post("vouchers/:campaignId/redeem")
  @ApiOperation({ summary: "Redeem Legal Coins for a voucher campaign" })
  @ApiOkResponse({ type: VoucherRedemptionResponseDto })
  redeemVoucher(
    @CurrentUser() user: AuthUserDto,
    @Param("campaignId") campaignId: string
  ) {
    return this.rewardsService.redeemVoucher(user.id, campaignId);
  }

  @Post("games/claim")
  @ApiOperation({ summary: "Claim reward coins after completing a game" })
  @ApiOkResponse({ type: GameRewardClaimResponseDto })
  claimGameReward(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: ClaimGameRewardDto
  ) {
    return this.rewardsService.claimGameReward(user.id, dto);
  }
}
