import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionResult, ResultType } from './result.entity';
import { CreateResultDto, LessonPointsDto } from './dto/result.dto';

export interface LeaderboardRow {
  userId: string;
  user: CompetitionResult['user'] | null;
  totalPoints: number;
  lessonsCount: number;
}

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(CompetitionResult)
    private readonly repo: Repository<CompetitionResult>,
  ) {}

  findByCompetition(competitionId: string): Promise<CompetitionResult[]> {
    return this.repo.find({
      where: { competitionId, type: ResultType.COMPETITION },
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
      Object.assign(existing, dto, { judgeId, type: ResultType.COMPETITION });
      return this.repo.save(existing);
    }

    const result = this.repo.create({ ...dto, judgeId, type: ResultType.COMPETITION });
    return this.repo.save(result);
  }

  // ─── Баллы за урок ────────────────────────────────────────────────
  async saveLessonPoints(dto: LessonPointsDto, coachId: string): Promise<CompetitionResult> {
    // Upsert: один балл на (секция, участник, дата урока)
    const existing = await this.repo.findOne({
      where: {
        type: ResultType.LESSON,
        sectionId: dto.sectionId,
        userId: dto.userId,
        lessonDate: dto.lessonDate,
      },
    });

    if (existing) {
      existing.score = dto.score;
      existing.notes = dto.notes ?? null;
      existing.awardedBy = coachId;
      return this.repo.save(existing);
    }

    const result = this.repo.create({
      type: ResultType.LESSON,
      sectionId: dto.sectionId,
      userId: dto.userId,
      lessonDate: dto.lessonDate,
      score: dto.score,
      notes: dto.notes ?? null,
      awardedBy: coachId,
    });
    return this.repo.save(result);
  }

  // Накопленный рейтинг по баллам за уроки (опц. в рамках одной секции)
  async leaderboard(sectionId?: string): Promise<LeaderboardRow[]> {
    const qb = this.repo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.user', 'user')
      .where('r.type = :type', { type: ResultType.LESSON })
      .select('user.id', 'userId')
      .addSelect('COALESCE(SUM(r.score), 0)', 'totalPoints')
      .addSelect('COUNT(r.id)', 'lessonsCount')
      .addSelect('user.first_name', 'firstName')
      .addSelect('user.last_name', 'lastName')
      .addSelect('user.patronymic', 'patronymic')
      .groupBy('user.id')
      .orderBy('"totalPoints"', 'DESC');

    if (sectionId) {
      qb.andWhere('r.section_id = :sectionId', { sectionId });
    }

    const rows = await qb.getRawMany();
    return rows.map((row) => ({
      userId: row.userId,
      user: {
        id: row.userId,
        firstName: row.firstName,
        lastName: row.lastName,
        patronymic: row.patronymic,
      } as CompetitionResult['user'],
      totalPoints: Number(row.totalPoints),
      lessonsCount: Number(row.lessonsCount),
    }));
  }

  // Баллы за уроки конкретной секции (для UI тренера)
  findLessonPoints(sectionId: string, lessonDate?: string): Promise<CompetitionResult[]> {
    const where: any = { type: ResultType.LESSON, sectionId };
    if (lessonDate) where.lessonDate = lessonDate;
    return this.repo.find({ where, relations: ['user'] });
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.findOneBy({ id });
    if (!result) throw new NotFoundException('Результат не найден');
    await this.repo.remove(result);
  }
}
