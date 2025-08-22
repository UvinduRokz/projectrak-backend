import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { UserRepository } from "@/shared/repositories/user.repository.js";
import { UpdateUserDto } from "../dtos/update-user.dto.js";
import { UserResponseDto } from "@/shared/dtos/user-response.dto.js";
import { NotFoundError, BadRequestError } from "@/shared/errors/index.js";

@Service()
export class UserService {
  constructor(
    @Inject(() => UserRepository)
    private readonly userRepo: UserRepository
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.findAll();
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("user_not_found");
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("user_not_found");

    if (dto.username && dto.username !== user.username) {
      if (await this.userRepo.findOneBy({ username: dto.username })) {
        throw new BadRequestError("username_already_taken");
      }
    }
    if (dto.email && dto.email !== user.email) {
      if (await this.userRepo.findOneBy({ email: dto.email })) {
        throw new BadRequestError("email_already_taken");
      }
    }

    if (dto.password) {
      user.passwordHash = dto.password;
    }
    Object.assign(user, {
      username: dto.username,
      email: dto.email,
      roleId: dto.roleId,
      passkey: dto.passkey,
    });

    const updated = await this.userRepo.save(user);
    return plainToInstance(UserResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("user_not_found");
    await this.userRepo.remove(user);
  }
}
