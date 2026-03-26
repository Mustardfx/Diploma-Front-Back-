import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Competition } from './competition.entity';
import {
  CreateCompetitionDto,
  UpdateCompetitionDto,
  CompetitionFilterDto,
} from './dto/competition.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private readonly repo: Repository<Competition>,
  ) {}

  findAll(filter: CompetitionFilterDto = {}): Promise<Competition[]> {
    const where: any = {};
    if (filter.sport) where.sport = filter.sport;
    if (filter.status) where.status = filter.status;
    return this.repo.find({ where, order: { startDate: 'ASC' } });
  }

  async findOne(id: string): Promise<Competition> {
    const comp = await this.repo.findOneBy({ id });
    if (!comp) throw new NotFoundException('Соревнование не найдено');
    return comp;
  }

  create(dto: CreateCompetitionDto, organizerId: string): Promise<Competition> {
    // Добавляем uuid к каждой категории
    const categories = dto.categories.map((c) => ({ ...c, id: uuid() }));
    const comp = this.repo.create({ ...dto, categories, organizerId });
    return this.repo.save(comp);
  }

  async update(id: string, dto: UpdateCompetitionDto): Promise<Competition> {
    const comp = await this.findOne(id);
    if (dto.categories) {
      dto.categories = dto.categories.map((c: any) => ({
        ...c,
        id: c.id ?? uuid(),
      }));
    }
    Object.assign(comp, dto);
    return this.repo.save(comp);
  }

  async remove(id: string): Promise<void> {
    const comp = await this.findOne(id);
    await this.repo.remove(comp);
  }
}
