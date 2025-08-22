import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { TaskAssignmentRepository } from "@/shared/repositories/task-assignment.repository.js";
import { CreateAssignmentDto } from "../dtos/create-assignment.dto.js";
import { AssignmentResponseDto } from "@/shared/dtos/assignment-response.dto.js";
import { NotFoundError, BadRequestError } from "@/shared/errors/index.js";
import { TaskAssignment } from "@/shared/entities/task-assignment.entity.js";

@Service()
export class AssignmentService {
  constructor(
    @Inject(() => TaskAssignmentRepository)
    private readonly assignRepo: TaskAssignmentRepository
  ) {}

  async list(subtaskId: string): Promise<AssignmentResponseDto[]> {
    const assignments = await this.assignRepo.findAll(subtaskId);
    return plainToInstance(AssignmentResponseDto, assignments, {
      excludeExtraneousValues: true,
    });
  }

  async assign(
    subtaskId: string,
    dto: CreateAssignmentDto
  ): Promise<AssignmentResponseDto> {
    const exists = await this.assignRepo.findOne(subtaskId, dto.employeeId);
    if (exists) throw new BadRequestError("already_assigned");

    const entity = this.assignRepo.create({
      subtaskId,
      employeeId: dto.employeeId,
    } as Partial<TaskAssignment>);
    const saved = await this.assignRepo.save(entity);
    return plainToInstance(AssignmentResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }
  async unassign(subtaskId: string, employeeId: string): Promise<void> {
    const assignment = await this.assignRepo.findOne(subtaskId, employeeId);
    if (!assignment) throw new NotFoundError("assignment_not_found");
    await this.assignRepo.remove(assignment);
  }
}
