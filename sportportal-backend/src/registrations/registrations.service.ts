import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionRegistration, RegistrationStatus } from './registration.entity';
import { CreateRegistrationDto, UpdateRegistrationStatusDto } from './dto/registration.dto';
import { CompetitionsService } from '../competitions/competitions.service';
import { CompetitionStatus } from '../competitions/competition.entity';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(CompetitionRegistration)
    private readonly repo: Repository<CompetitionRegistration>,
    private readonly competitionsService: CompetitionsService,
  ) {}

  findByUser(userId: string): Promise<CompetitionRegistration[]> {
    return this.repo.find({
      where: { userId },
      relations: ['competition'],
      order: { registeredAt: 'DESC' },
    });
  }

  findByCompetition(competitionId: string): Promise<CompetitionRegistration[]> {
    return this.repo.find({
      where: { competitionId },
      relations: ['user'],
      order: { registeredAt: 'ASC' },
    });
  }

  async register(
    dto: CreateRegistrationDto,
    userId: string,
  ): Promise<CompetitionRegistration> {
    const competition = await this.competitionsService.findOne(dto.competitionId);

    if (
      competition.status === CompetitionStatus.COMPLETED ||
      competition.status === CompetitionStatus.CANCELLED
    ) {
      throw new BadRequestException('Регистрация закрыта');
    }

    if (new Date(competition.registrationDeadline) < new Date()) {
      throw new BadRequestException('Срок регистрации истёк');
    }

    const existing = await this.repo.findOne({
      where: { competitionId: dto.competitionId, userId },
    });
    if (existing && existing.status !== RegistrationStatus.WITHDRAWN) {
      throw new ConflictException('Вы уже зарегистрированы на это соревнование');
    }

    const count = await this.repo.count({
      where: {
        competitionId: dto.competitionId,
        status: RegistrationStatus.APPROVED,
      },
    });
    if (count >= competition.maxParticipants) {
      throw new BadRequestException('Достигнут лимит участников');
    }

    // Проверить что categoryId существует в соревновании
    const categoryExists = competition.categories.some(
      (c) => c.id === dto.categoryId,
    );
    if (!categoryExists) {
      throw new BadRequestException('Категория не найдена');
    }

    if (existing) {
      existing.status = RegistrationStatus.PENDING;
      existing.categoryId = dto.categoryId;
      return this.repo.save(existing);
    }

    const reg = this.repo.create({
      competitionId: dto.competitionId,
      userId,
      categoryId: dto.categoryId,
      status: RegistrationStatus.PENDING,
    });
    return this.repo.save(reg);
  }

  async withdraw(id: string, userId: string): Promise<CompetitionRegistration> {
    const reg = await this.repo.findOne({ where: { id, userId } });
    if (!reg) throw new NotFoundException('Регистрация не найдена');
    if (reg.status === RegistrationStatus.WITHDRAWN) {
      throw new BadRequestException('Заявка уже отозвана');
    }
    reg.status = RegistrationStatus.WITHDRAWN;
    return this.repo.save(reg);
  }

  async updateStatus(
    id: string,
    dto: UpdateRegistrationStatusDto,
  ): Promise<CompetitionRegistration> {
    const reg = await this.repo.findOne({ where: { id } });
    if (!reg) throw new NotFoundException('Регистрация не найдена');
    reg.status = dto.status;
    return this.repo.save(reg);
  }
}
