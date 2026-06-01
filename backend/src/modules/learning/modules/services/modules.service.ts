import { Injectable } from "@nestjs/common";
import {
  DEFAULT_MODULES_LIMIT,
  DEFAULT_MODULES_PAGE,
} from "../constants/modules.constants";
import { ModulesListResponseDto } from "../dto/response/module-response.dto";
import { ModulesMapper } from "../mappers/modules.mapper";
import { ModulesRepository } from "../repositories/modules.repository";

@Injectable()
export class ModulesService {
  constructor(private readonly modulesRepository: ModulesRepository) {}

  async getModules(params: {
    userId: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<ModulesListResponseDto> {
    const page = params.page ?? DEFAULT_MODULES_PAGE;
    const limit = params.limit ?? DEFAULT_MODULES_LIMIT;
    const [total, modules] = await this.modulesRepository.findActiveModules({
      userId: params.userId,
      categoryId: params.categoryId,
      page,
      limit,
    });

    return ModulesMapper.toPaginatedResponse({
      modules,
      total,
      page,
      limit,
    });
  }
}
