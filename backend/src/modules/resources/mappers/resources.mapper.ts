import { buildPaginationMeta } from "../../../common/dto/pagination-meta.dto";
import {
  ResourceLegalSourceDetailResponseDto,
  ResourceLegalSourceListResponseDto,
  ResourceLegalSourceSummaryResponseDto,
} from "../dto/response/resource-legal-source-response.dto";
import {
  ResourceMediaAssetListResponseDto,
  ResourceMediaAssetResponseDto,
} from "../dto/response/resource-media-asset-response.dto";

export class ResourcesMapper {
  static toLegalSourceSummary(
    source: any
  ): ResourceLegalSourceSummaryResponseDto {
    const content = this.getLegalSourceContent(source);

    return {
      id: source.id,
      title: source.title,
      sourceUrl: source.sourceUrl,
      legalDocumentNo: source.legalDocumentNo,
      effectiveDate: source.effectiveDate,
      excerpt: this.truncateText(content, 220),
      crawledAt: source.crawledAt,
      updatedAt: source.updatedAt,
    };
  }

  static toLegalSourceDetail(
    source: any
  ): ResourceLegalSourceDetailResponseDto {
    return {
      ...this.toLegalSourceSummary(source),
      content: this.getLegalSourceContent(source),
    };
  }

  static toPaginatedLegalSources(params: {
    sources: any[];
    total: number;
    page: number;
    limit: number;
  }): ResourceLegalSourceListResponseDto {
    return {
      items: params.sources.map((source) => this.toLegalSourceSummary(source)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  static toMediaAsset(asset: any): ResourceMediaAssetResponseDto {
    return {
      id: asset.id,
      title: asset.title,
      assetType: asset.assetType,
      sourceType: asset.sourceType,
      placement: asset.placement,
      url: asset.url,
      mimeType: asset.mimeType,
      provider: asset.provider,
      metadata: asset.metadata,
      lesson: asset.lesson
        ? {
            id: asset.lesson.id,
            slug: asset.lesson.slug,
            title: asset.lesson.title,
          }
        : null,
      updatedAt: asset.updatedAt,
    };
  }

  static toPaginatedMediaAssets(params: {
    assets: any[];
    total: number;
    page: number;
    limit: number;
  }): ResourceMediaAssetListResponseDto {
    return {
      items: params.assets.map((asset) => this.toMediaAsset(asset)),
      meta: buildPaginationMeta({
        total: params.total,
        page: params.page,
        limit: params.limit,
      }),
    };
  }

  private static getLegalSourceContent(source: any): string {
    return source.normalizedText || source.rawText || "";
  }

  private static truncateText(value: string, maxLength: number): string {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) {
      return normalized;
    }
    return `${normalized.slice(0, maxLength).trim()}...`;
  }
}
