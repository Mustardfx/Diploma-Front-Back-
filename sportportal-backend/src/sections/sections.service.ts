import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './section.entity';
import { Enrollment, EnrollmentStatus } from '../enrollments/enrollment.entity';
import { CreateSectionDto, UpdateSectionDto, SectionFilterDto } from './dto/section.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly repo: Repository<Section>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  /** Кол-во активных записей по списку секций (одним запросом) */
  private async countsFor(sectionIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (sectionIds.length === 0) return map;
    const rows = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('e.section_id', 'sectionId')
      .addSelect('COUNT(*)', 'count')
      .where('e.section_id IN (:...ids)', { ids: sectionIds })
      .andWhere('e.status = :status', { status: EnrollmentStatus.ACTIVE })
      .groupBy('e.section_id')
      .getRawMany<{ sectionId: string; count: string }>();
    rows.forEach((r) => map.set(r.sectionId, Number(r.count)));
    return map;
  }

  async findAll(filter: SectionFilterDto = {}): Promise<Section[]> {
    const where: any = {};
    if (filter.sport !== undefined) where.sport = filter.sport;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    const sections = await this.repo.find({
      where,
      relations: ['coach'],
      order: { createdAt: 'DESC' },
    });
    const counts = await this.countsFor(sections.map((s) => s.id));
    sections.forEach((s) => (s.enrolledCount = counts.get(s.id) ?? 0));
    return sections;
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.repo.findOne({
      where: { id },
      relations: ['coach'],
    });
    if (!section) throw new NotFoundException('Секция не найдена');
    section.enrolledCount = await this.enrollmentRepo.count({
      where: { sectionId: id, status: EnrollmentStatus.ACTIVE },
    });
    return section;
  }

  async findByCoach(coachId: string): Promise<Section[]> {
    const sections = await this.repo.find({
      where: { coachId },
      order: { createdAt: 'DESC' },
    });
    const counts = await this.countsFor(sections.map((s) => s.id));
    sections.forEach((s) => (s.enrolledCount = counts.get(s.id) ?? 0));
    return sections;
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
