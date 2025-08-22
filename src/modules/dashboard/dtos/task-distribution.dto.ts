import { Expose } from "class-transformer";

export class TaskDistributionDto {
  @Expose({ name: "category" })
  category!: string;

  @Expose({ name: "count" })
  count!: number;
}
