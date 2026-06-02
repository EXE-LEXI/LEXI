import { Injectable } from "@nestjs/common";
import {
  LegalSourceCrawlStatus,
  MediaAssetStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../../core/prisma.service";

@Injectable()
export class ResourcesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPublishedLegalSources(params: {
    where: Prisma.LegalSourceDocumentWhereInput;
    page: number;
    limit: number;
  }) {
    const where: Prisma.LegalSourceDocumentWhereInput = {
      ...params.where,
      crawlStatus: LegalSourceCrawlStatus.CRAWLED,
    };

    return this.prisma.$transaction([
      this.prisma.legalSourceDocument.count({ where }),
      this.prisma.legalSourceDocument.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [
          { effectiveDate: "desc" },
          { updatedAt: "desc" },
          { title: "asc" },
        ],
      }),
    ]);
  }

  findPublishedLegalSourceById(sourceId: string) {
    return this.prisma.legalSourceDocument.findFirst({
      where: {
        id: sourceId,
        crawlStatus: LegalSourceCrawlStatus.CRAWLED,
      },
    });
  }

  findReadyMediaAssets(params: {
    where: Prisma.MediaAssetWhereInput;
    page: number;
    limit: number;
  }) {
    const where: Prisma.MediaAssetWhereInput = {
      ...params.where,
      status: MediaAssetStatus.READY,
      url: { not: null },
    };

    return this.prisma.$transaction([
      this.prisma.mediaAsset.count({ where }),
      this.prisma.mediaAsset.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          lesson: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
    ]);
  }
}
