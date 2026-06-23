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
