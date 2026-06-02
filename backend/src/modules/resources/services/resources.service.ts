import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  DEFAULT_MODULES_LIMIT,
  DEFAULT_MODULES_PAGE,
} from "../../learning/modules/constants/modules.constants";
import { GetResourceLegalSourcesQueryDto } from "../dto/request/get-resource-legal-sources-query.dto";
import { GetResourceMediaAssetsQueryDto } from "../dto/request/get-resource-media-assets-query.dto";
import {
  ResourceLegalSourceDetailResponseDto,
  ResourceLegalSourceListResponseDto,
} from "../dto/response/resource-legal-source-response.dto";
import { ResourceMediaAssetListResponseDto } from "../dto/response/resource-media-asset-response.dto";
import { ResourcesMapper } from "../mappers/resources.mapper";
import { ResourcesRepository } from "../repositories/resources.repository";

@Injectable()
export class ResourcesService {
  constructor(private readonly resourcesRepository: ResourcesRepository) {}

  async getLegalSources(
    query: GetResourceLegalSourcesQueryDto
  ): Promise<ResourceLegalSourceListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, sources] =
      await this.resourcesRepository.findPublishedLegalSources({
        where: this.buildLegalSourceWhere(query),
        page,
        limit,
      });

    return ResourcesMapper.toPaginatedLegalSources({
      sources,
      total,
      page,
      limit,
    });
  }

  async getLegalSource(
    sourceId: string
  ): Promise<ResourceLegalSourceDetailResponseDto> {
    const source =
      await this.resourcesRepository.findPublishedLegalSourceById(sourceId);
    if (!source) {
      throw new NotFoundException("Legal source not found");
    }

    return ResourcesMapper.toLegalSourceDetail(source);
  }

  async getMediaAssets(
    query: GetResourceMediaAssetsQueryDto
  ): Promise<ResourceMediaAssetListResponseDto> {
    const page = query.page ?? DEFAULT_MODULES_PAGE;
    const limit = query.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, assets] = await this.resourcesRepository.findReadyMediaAssets(
      {
        where: this.buildMediaAssetWhere(query),
        page,
        limit,
      }
    );

    return ResourcesMapper.toPaginatedMediaAssets({
      assets,
      total,
      page,
      limit,
    });
  }

  private buildLegalSourceWhere(
    query: GetResourceLegalSourcesQueryDto
  ): Prisma.LegalSourceDocumentWhereInput {
    const where: Prisma.LegalSourceDocumentWhereInput = {};
    if (query.legalDocumentNo) {
      where.legalDocumentNo = {
        contains: query.legalDocumentNo,
        mode: "insensitive",
      };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { sourceUrl: { contains: query.search, mode: "insensitive" } },
        { legalDocumentNo: { contains: query.search, mode: "insensitive" } },
        { rawText: { contains: query.search, mode: "insensitive" } },
        { normalizedText: { contains: query.search, mode: "insensitive" } },
      ];
    }
    return where;
  }

  private buildMediaAssetWhere(
    query: GetResourceMediaAssetsQueryDto
  ): Prisma.MediaAssetWhereInput {
    const where: Prisma.MediaAssetWhereInput = {};
    if (query.assetType) {
      where.assetType = query.assetType;
    }
    if (query.placement) {
      where.placement = query.placement;
    }
    if (query.lessonId) {
      where.lessonId = query.lessonId;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { provider: { contains: query.search, mode: "insensitive" } },
        { url: { contains: query.search, mode: "insensitive" } },
        {
          lesson: {
            title: { contains: query.search, mode: "insensitive" },
          },
        },
      ];
    }
    return where;
  }
}
