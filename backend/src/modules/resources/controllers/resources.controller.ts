import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { GetResourceLegalSourcesQueryDto } from "../dto/request/get-resource-legal-sources-query.dto";
import { GetResourceMediaAssetsQueryDto } from "../dto/request/get-resource-media-assets-query.dto";
import {
  ResourceLegalSourceDetailResponseDto,
  ResourceLegalSourceListResponseDto,
} from "../dto/response/resource-legal-source-response.dto";
import { ResourceMediaAssetListResponseDto } from "../dto/response/resource-media-asset-response.dto";
import { ResourcesService } from "../services/resources.service";

@ApiTags("resources")
@ApiBearerAuth()
@Controller("resources")
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get("legal-sources")
  @ApiOperation({ summary: "List published legal source documents" })
  @ApiOkResponse({ type: ResourceLegalSourceListResponseDto })
  getLegalSources(
    @Query() query: GetResourceLegalSourcesQueryDto
  ): Promise<ResourceLegalSourceListResponseDto> {
    return this.resourcesService.getLegalSources(query);
  }

  @Get("legal-sources/:sourceId")
  @ApiOperation({ summary: "Get published legal source detail" })
  @ApiOkResponse({ type: ResourceLegalSourceDetailResponseDto })
  getLegalSource(
    @Param("sourceId") sourceId: string
  ): Promise<ResourceLegalSourceDetailResponseDto> {
    return this.resourcesService.getLegalSource(sourceId);
  }

  @Get("media-assets")
  @ApiOperation({ summary: "List ready resource media assets" })
  @ApiOkResponse({ type: ResourceMediaAssetListResponseDto })
  getMediaAssets(
    @Query() query: GetResourceMediaAssetsQueryDto
  ): Promise<ResourceMediaAssetListResponseDto> {
    return this.resourcesService.getMediaAssets(query);
  }
}
