import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { MarkAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly repo: Repository<Attendance>,
  ) {}

  findBySection(sectionId: string, date?: string): Promise<Attendance[]> {
    const where: any = { sectionId };
    if (date) where.date = date;
    return this.repo.find({
      where,
      relations: ['user'],
      order: { date: 'DESC' },
    });
  }

  // Общая статистика посещаемости за период (+ разбивка по месяцам).
  // coachId задан → только секции этого тренера; иначе (админ) — все/по sectionId.
  async overview(opts: { from?: string; to?: string; sectionId?: string; coachId?: string }) {
    const to = opts.to || new Date().toISOString().slice(0, 10);
    const from =
      opts.from ||
      (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d.toISOString().slice(0, 10);
      })();

    const base = () => {
      const qb = this.repo
        .createQueryBuilder('a')
        .where('a.date BETWEEN :from AND :to', { from, to });
      if (opts.sectionId) qb.andWhere('a.section_id = :sectionId', { sectionId: opts.sectionId });
      if (opts.coachId) {
        qb.innerJoin('sections', 's', 's.id = a.section_id').andWhere(
          's.coach_id = :coachId',
          { coachId: opts.coachId },
        );
      }
      return qb;
    };

    const totals = await base()
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE a.present)', 'present')
      .getRawOne<{ total: string; present: string }>();

    const monthsRaw = await base()
      .select("to_char(a.date, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE a.present)', 'present')
      .groupBy("to_char(a.date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; total: string; present: string }>();

    const total = Number(totals?.total ?? 0);
    const present = Number(totals?.present ?? 0);
    const byMonth = monthsRaw.map((m) => {
      const t = Number(m.total);
      const p = Number(m.present);
      return { month: m.month, total: t, present: p, percent: t > 0 ? Math.round((p / t) * 100) : 0 };
    });

    return {
      from,
      to,
      total,
      present,
      absent: total - present,
      percent: total > 0 ? Math.round((present / total) * 100) : 0,
      byMonth,
    };
  }

  async getUserStats(userId: string, sectionId: string) {
    const records = await this.repo.find({ where: { userId, sectionId } });
    const present = records.filter((r) => r.present).length;
    const total = records.length;
    return {
      total,
      present,
      percent: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }

  async markAttendance(dto: MarkAttendanceDto): Promise<Attendance[]> {
    const saved: Attendance[] = [];
    for (const rec of dto.records) {
      // Upsert: обновить если существует, иначе создать
      const existing = await this.repo.findOne({
        where: { userId: rec.userId, sectionId: rec.sectionId, date: rec.date },
      });
      if (existing) {
        existing.present = rec.present;
        existing.note = rec.note ?? null;
        // Фиксируем момент отметки присутствия; при отсутствии — обнуляем.
        existing.checkedInAt = rec.present ? new Date() : null;
        saved.push(await this.repo.save(existing));
      } else {
        const record = this.repo.create({
          ...rec,
          checkedInAt: rec.present ? new Date() : null,
        });
        saved.push(await this.repo.save(record));
      }
    }
    return saved;
  }
}
