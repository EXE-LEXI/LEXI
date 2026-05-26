import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../core/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }
}
