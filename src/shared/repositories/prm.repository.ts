import { Service, Inject } from "typedi";
import { Repository, DataSource } from "typeorm";
import { PrmUpload } from "@/shared/entities/prm-upload.entity.js";

@Service()
export class PrmRepository {
  private readonly repo: Repository<PrmUpload>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(PrmUpload);
  }

  findAll(companyId: string) {
    return this.repo.find({ where: { companyId } });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<PrmUpload>) {
    return this.repo.create(data);
  }

  save(entity: PrmUpload) {
    return this.repo.save(entity);
  }

  remove(entity: PrmUpload) {
    return this.repo.remove(entity);
  }
}
