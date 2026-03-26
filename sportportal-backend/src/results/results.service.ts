import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionResult } from './result.entity';
import { CreateResultDto } from './dto/result.dto';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(CompetitionResult)
    private readonly repo: Repository<CompetitionResult>,
  ) {}

  findByCompetition(competitionId: string): Promise<CompetitionResult[]> {
    return this.repo.find({
      where: { competitionId },
      relations: ['user', 'judge'],
      order: { place: 'ASC' },
    });
  }

  findByUser(userId: string): Promise<CompetitionResult[]> {
    return this.repo.find({
      where: { userId },
      relations: ['competition'],
      order: { recordedAt: 'DESC' },
    });
  }

  async save(dto: CreateResultDto, judgeId: string): Promise<CompetitionResult> {
    // Upsert по registrationId — один результат на одну заявку
    const existing = await this.repo.findOne({
      where: { registrationId: dto.registrationId },
    });

    if (existing) {
      Object.assign(existing, dto, { judgeId });
      return this.repo.save(existing);
    }

    const result = this.repo.create({ ...dto, judgeId });
    return this.repo.save(result);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.findOneBy({ id });
    if (!result) throw new NotFoundException('Результат не найден');
    await this.repo.remove(result);
  }
}
