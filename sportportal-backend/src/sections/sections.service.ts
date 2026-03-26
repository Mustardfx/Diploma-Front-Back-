import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './section.entity';
import { CreateSectionDto, UpdateSectionDto, SectionFilterDto } from './dto/section.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly repo: Repository<Section>,
  ) {}

  findAll(filter: SectionFilterDto = {}): Promise<Section[]> {
    const where: any = {};
    if (filter.sport !== undefined) where.sport = filter.sport;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    return this.repo.find({
      where,
      relations: ['coach'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.repo.findOne({
      where: { id },
      relations: ['coach'],
    });
    if (!section) throw new NotFoundException('Секция не найдена');
    return section;
  }

  findByCoach(coachId: string): Promise<Section[]> {
    return this.repo.find({
      where: { coachId },
      order: { createdAt: 'DESC' },
    });
  }

  create(dto: CreateSectionDto, coachId: string): Promise<Section> {
    const section = this.repo.create({ ...dto, coachId });
    return this.repo.save(section);
  }

  async update(
    id: string,
    dto: UpdateSectionDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<Section> {
    const section = await this.findOne(id);
    if (section.coachId !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Нет доступа к этой секции');
    }
    Object.assign(section, dto);
    return this.repo.save(section);
  }

  async remove(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    const section = await this.findOne(id);
    if (section.coachId !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Нет доступа к этой секции');
    }
    await this.repo.remove(section);
  }
}
