import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto, UpdateRoleDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.repo.findOneBy({ email });
  }

  async getUserById(id: string) {
    return await this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = await this.repo.create(data);
    return await this.repo.save(user);
  }

  async update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: UserRole): Promise<User> {
    if (requesterId !== id && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Нет доступа');
    }
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return await this.repo.save(user);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<User> {
    const user = await this.findOne(id);
    user.role = dto.role;
    return await this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}
