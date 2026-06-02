import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma.service';
import { ISourceRegistry } from '../interfaces/pipeline.interface';

@Injectable()
export class SourceRegistryRepository {
  private readonly logger = new Logger(SourceRegistryRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ISourceRegistry[]> {
    return this.prisma.sourceRegistry.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async ensureDefaultOfficialSources(): Promise<void> {
    const defaults: Array<Partial<ISourceRegistry>> = [
      {
        name: "CSDLQG VBPL - vbpl.vn",
        description: "Co so du lieu quoc gia ve van ban phap luat",
        sourceType: "CRAWLER",
        apiEndpoint: "https://vbpl.vn/",
        cronExpression: "0 */2 * * *",
        maxRetries: 3,
        retryDelayMs: 5000,
        timeoutMs: 30000,
        createdBy: "SYSTEM_DEFAULT",
      },
      {
        name: "Bo Tu Phap - moj.gov.vn vbpq",
        description: "He thong thong tin van ban quy pham phap luat Bo Tu Phap",
        sourceType: "CRAWLER",
        apiEndpoint: "https://moj.gov.vn/vbpq/Pages/search.aspx",
        cronExpression: "15 */2 * * *",
        maxRetries: 3,
        retryDelayMs: 5000,
        timeoutMs: 30000,
        createdBy: "SYSTEM_DEFAULT",
      },
      {
        name: "Cong bao Chinh phu - congbao.chinhphu.vn",
        description: "Cong bao dien tu nuoc CHXHCN Viet Nam",
        sourceType: "CRAWLER",
        apiEndpoint: "https://congbao.chinhphu.vn/",
        cronExpression: "30 */2 * * *",
        maxRetries: 3,
        retryDelayMs: 5000,
        timeoutMs: 30000,
        createdBy: "SYSTEM_DEFAULT",
      },
    ];

    for (const source of defaults) {
      const existing = await this.prisma.sourceRegistry.findUnique({
        where: { name: source.name },
      });

      if (existing) {
        await this.prisma.sourceRegistry.update({
          where: { id: existing.id },
          data: {
            description: source.description,
            sourceType: source.sourceType,
            apiEndpoint: source.apiEndpoint,
            cronExpression: source.cronExpression,
            status: existing.status || "ACTIVE",
            updatedAt: new Date(),
          },
        });
        continue;
      }

      await this.create(source);
      this.logger.log(`Registered default official source: ${source.name}`);
    }
  }

  async findById(id: string): Promise<ISourceRegistry | null> {
    return this.prisma.sourceRegistry.findUnique({
      where: { id },
    });
  }

  async create(data: Partial<ISourceRegistry>): Promise<ISourceRegistry> {
    return this.prisma.sourceRegistry.create({
      data: this.toPrismaCreateData(data),
    });
  }

  private toPrismaCreateData(
    data: Partial<ISourceRegistry>
  ): Prisma.SourceRegistryCreateInput {
    const { id, _id, isActive, rateLimitReqPerSec, lastSuccessfulCrawl, lastFailedCrawl, ...rest } =
      data as any;

    return {
      ...rest,
      status: rest.status || (isActive === false ? 'DISABLED' : 'ACTIVE'),
      name: rest.name,
      sourceType: rest.sourceType,
      lastCrawlTime: rest.lastCrawlTime || new Date(),
      maxRetries: rest.maxRetries ?? 3,
      retryDelayMs: rest.retryDelayMs ?? 5000,
      timeoutMs: rest.timeoutMs ?? 30000,
      apiMethod: rest.apiMethod || 'GET',
      apiPageParam: rest.apiPageParam ?? 'page',
      apiLimitParam: rest.apiLimitParam ?? 'limit',
      createdBy: rest.createdBy || 'SYSTEM',
    };
  }

  private toPrismaUpdateData(data: Partial<ISourceRegistry>): any {
    const { id, _id, isActive, rateLimitReqPerSec, lastSuccessfulCrawl, lastFailedCrawl, ...rest } =
      data as any;

    return {
      ...rest,
      ...(isActive === undefined ? {} : { status: isActive ? 'ACTIVE' : 'DISABLED' }),
      updatedAt: new Date(),
    };
  }

  async update(
    id: string,
    data: Partial<ISourceRegistry>
  ): Promise<ISourceRegistry> {
    return this.prisma.sourceRegistry.update({
      where: { id },
      data: this.toPrismaUpdateData(data),
    });
  }

  async updateLastCrawl(
    id: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    const source = await this.prisma.sourceRegistry.findUnique({
      where: { id },
    });

    const nextFailures = success ? 0 : (source?.consecutiveFailures || 0) + 1;

    await this.prisma.sourceRegistry.update({
      where: { id },
      data: {
        lastCrawlTime: success ? new Date() : source?.lastCrawlTime,
        consecutiveFailures: nextFailures,
        lastError: success ? null : error,
        status:
          !success && source && nextFailures >= source.maxRetries
            ? 'DISABLED'
            : source?.status || 'ACTIVE',
        updatedAt: new Date(),
      },
    });
  }

  async disable(id: string): Promise<void> {
    await this.prisma.sourceRegistry.update({
      where: { id },
      data: { status: 'DISABLED' },
    });
  }

  async findBySourceType(
    sourceType: 'RSS' | 'SITEMAP' | 'API' | 'HYBRID'
  ): Promise<ISourceRegistry[]> {
    return this.prisma.sourceRegistry.findMany({
      where: { sourceType, status: 'ACTIVE' },
    });
  }
}
