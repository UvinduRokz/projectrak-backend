import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { PrmRepository } from "@/shared/repositories/prm.repository.js";
import { CreatePrmDto } from "../dtos/create-prm.dto.js";
import { PrmResponseDto } from "@/shared/dtos/prm-response.dto.js";
import { NotFoundError } from "@/shared/errors/index.js";
import { PrmUpload } from "@/shared/entities/prm-upload.entity.js";

@Service()
export class PrmService {
  constructor(
    @Inject(() => PrmRepository)
    private readonly repo: PrmRepository
  ) {}

  async list(companyId: string): Promise<PrmResponseDto[]> {
    const items = await this.repo.findAll(companyId);
    return plainToInstance(PrmResponseDto, items, {
      excludeExtraneousValues: true,
    });
  }

  async getOne(id: string): Promise<PrmResponseDto> {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError("prm_not_found");
    return plainToInstance(PrmResponseDto, item, {
      excludeExtraneousValues: true,
    });
  }

  async upload(
    file: Express.Multer.File,
    dto: CreatePrmDto,
    uploadedBy: string
  ): Promise<PrmResponseDto> {
    const entity = this.repo.create({
      companyId: dto.companyId,
      filename: file.originalname,
      filePath: file.path,
      uploadedBy,
    } as Partial<PrmUpload>);
    const saved = await this.repo.save(entity);
    return plainToInstance(PrmResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundError("prm_not_found");
    await this.repo.remove(item);
  }
}
