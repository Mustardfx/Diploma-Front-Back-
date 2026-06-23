import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateUserDto, UpdateRoleDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
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

  async findByResetTokenHash(hash: string): Promise<User | null> {
    if (!hash) return null;
    return await this.repo.findOne({ where: { resetTokenHash: hash } });
  }

  async save(user: User): Promise<User> {
    return await this.repo.save(user);
  }

  async getUserById(id: string) {
    // Защита: без валидного id findOne({ where: { id: undefined } })
    // вернул бы первую строку таблицы (источник бага с подменой аккаунта).
    if (!id) return null;
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

  // Создание пользователя админом: проверка дубля email + хеширование пароля
  async adminCreate(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }
    const password = await bcrypt.hash(dto.password, 10);
    return this.create({
      email: dto.email,
      password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      patronymic: dto.patronymic,
      phone: dto.phone,
      role: dto.role ?? UserRole.ATHLETE,
    });
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
    await this.findOne(id); // 404, если пользователя нет

    // Удаляем зависимые записи в транзакции, иначе FK не дадут удалить пользователя.
    await this.repo.manager.transaction(async (m) => {
      // Секции, где пользователь — тренер (их зависимости тоже надо убрать).
      const ownedSections: { id: string }[] = await m.query(
        'SELECT id FROM sections WHERE coach_id = $1',
        [id],
      );
      const sectionIds = ownedSections.map((s) => s.id);

      // Записи, напрямую привязанные к пользователю.
      await m.query('DELETE FROM attendance WHERE user_id = $1', [id]);
      await m.query(
        'DELETE FROM competition_results WHERE user_id = $1 OR judge_id = $1 OR awarded_by = $1',
        [id],
      );
      await m.query('DELETE FROM enrollments WHERE user_id = $1', [id]);
      await m.query('DELETE FROM competition_registrations WHERE user_id = $1', [id]);

      // Если пользователь — тренер с секциями, чистим зависимости этих секций и сами секции.
      if (sectionIds.length > 0) {
        await m.query('DELETE FROM attendance WHERE section_id = ANY($1)', [sectionIds]);
        await m.query('DELETE FROM competition_results WHERE section_id = ANY($1)', [sectionIds]);
        await m.query('DELETE FROM enrollments WHERE section_id = ANY($1)', [sectionIds]);
        await m.query('DELETE FROM sections WHERE coach_id = $1', [id]);
      }

      await m.query('DELETE FROM users WHERE id = $1', [id]);
    });
  }
}
