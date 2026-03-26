import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './enrollment.entity';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { SectionsService } from '../sections/sections.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly repo: Repository<Enrollment>,
    private readonly sectionsService: SectionsService,
  ) {}

  findByUser(userId: string): Promise<Enrollment[]> {
    return this.repo.find({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      relations: ['section', 'section.coach'],
      order: { enrolledAt: 'DESC' },
    });
  }

  findBySection(sectionId: string): Promise<Enrollment[]> {
    return this.repo.find({
      where: { sectionId, status: EnrollmentStatus.ACTIVE },
      relations: ['user'],
      order: { enrolledAt: 'ASC' },
    });
  }

  async enroll(dto: CreateEnrollmentDto, userId: string): Promise<Enrollment> {
    const section = await this.sectionsService.findOne(dto.sectionId);
    if (!section.isActive) {
      throw new BadRequestException('Секция закрыта для записи');
    }

    const existing = await this.repo.findOne({
      where: { sectionId: dto.sectionId, userId, status: EnrollmentStatus.ACTIVE },
    });
    if (existing) {
      throw new ConflictException('Вы уже записаны на эту секцию');
    }

    // Проверка лимита
    const count = await this.repo.count({
      where: { sectionId: dto.sectionId, status: EnrollmentStatus.ACTIVE },
    });
    if (count >= section.maxParticipants) {
      throw new BadRequestException('Все места заняты');
    }

    const enrollment = this.repo.create({
      sectionId: dto.sectionId,
      userId,
      status: EnrollmentStatus.ACTIVE,
    });
    return this.repo.save(enrollment);
  }

  async cancel(id: string, userId: string): Promise<Enrollment> {
    const enrollment = await this.repo.findOne({ where: { id, userId } });
    if (!enrollment) throw new NotFoundException('Запись не найдена');
    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new BadRequestException('Запись уже неактивна');
    }
    enrollment.status = EnrollmentStatus.CANCELLED;
    return this.repo.save(enrollment);
  }
}
