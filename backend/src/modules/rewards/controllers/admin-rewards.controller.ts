import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import {
  CreateVoucherCampaignDto,
  UpdateVoucherCampaignDto,
} from "../dto/request/admin-voucher-campaign.dto";
import {
  GetVoucherRedemptionsQueryDto,
  UpdateVoucherRedemptionDto,
} from "../dto/request/admin-voucher-redemption.dto";
import {
  AdminVoucherRedemptionListResponseDto,
  AdminVoucherRedemptionResponseDto,
  VoucherCampaignResponseDto,
} from "../dto/response/reward-response.dto";
import { RewardsService } from "../services/rewards.service";

@ApiTags("admin-rewards")
@ApiBearerAuth()
@Controller("admin/rewards")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminRewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get("voucher-campaigns")
  @ApiOperation({ summary: "List voucher campaigns" })
  @ApiOkResponse({ type: [VoucherCampaignResponseDto] })
  listCampaigns(): Promise<VoucherCampaignResponseDto[]> {
    return this.rewardsService.listAdminVoucherCampaigns();
  }

  @Post("voucher-campaigns")
  @ApiOperation({ summary: "Create voucher campaign" })
  @ApiOkResponse({ type: VoucherCampaignResponseDto })
  createCampaign(
    @Body() dto: CreateVoucherCampaignDto
  ): Promise<VoucherCampaignResponseDto> {
    return this.rewardsService.createVoucherCampaign(dto);
  }

  @Patch("voucher-campaigns/:campaignId")
  @ApiOperation({ summary: "Update voucher campaign" })
  @ApiOkResponse({ type: VoucherCampaignResponseDto })
  updateCampaign(
    @Param("campaignId") campaignId: string,
    @Body() dto: UpdateVoucherCampaignDto
  ): Promise<VoucherCampaignResponseDto> {
    return this.rewardsService.updateVoucherCampaign(campaignId, dto);
  }

  @Get("voucher-redemptions")
  @ApiOperation({ summary: "List voucher redemptions" })
  @ApiOkResponse({ type: Object })
  listRedemptions(
    @Query() query: GetVoucherRedemptionsQueryDto
  ): Promise<AdminVoucherRedemptionListResponseDto> {
    return this.rewardsService.listVoucherRedemptions(query);
  }

  @Patch("voucher-redemptions/:redemptionId")
  @ApiOperation({ summary: "Update voucher redemption fulfillment" })
  @ApiOkResponse({ type: AdminVoucherRedemptionResponseDto })
  updateRedemption(
    @Param("redemptionId") redemptionId: string,
    @Body() dto: UpdateVoucherRedemptionDto
  ): Promise<AdminVoucherRedemptionResponseDto> {
    return this.rewardsService.updateVoucherRedemption(redemptionId, dto);
  }
}
