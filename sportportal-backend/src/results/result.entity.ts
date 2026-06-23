import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Competition } from '../competitions/competition.entity';
import { CompetitionRegistration } from '../registrations/registration.entity';
import { Section } from '../sections/section.entity';

export enum ResultType {
  COMPETITION = 'competition',
  LESSON = 'lesson',
}

@Entity('competition_results')
export class CompetitionResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ResultType,
    default: ResultType.COMPETITION,
  })
  type: ResultType;

  @Column({ name: 'competition_id', nullable: true })
  competitionId: string | null;

  @ManyToOne(() => Competition)
  @JoinColumn({ name: 'competition_id' })
  competition: Competition;

  @Column({ name: 'registration_id', nullable: true })
  registrationId: string | null;

  @ManyToOne(() => CompetitionRegistration)
  @JoinColumn({ name: 'registration_id' })
  registration: CompetitionRegistration;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @Column({ nullable: true })
  place: number;

  @Column({ type: 'numeric', nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'judge_id', nullable: true })
  judgeId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'judge_id' })
  judge: User;

  // ─── Баллы за урок (type = 'lesson') ────────────────────────────
  @Column({ name: 'section_id', nullable: true })
  sectionId: string | null;

  @ManyToOne(() => Section)
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({ name: 'lesson_date', type: 'date', nullable: true })
  lessonDate: string | null;

  @Column({ name: 'awarded_by', nullable: true })
  awardedBy: string | null;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
