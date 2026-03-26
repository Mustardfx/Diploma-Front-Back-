import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Competition } from '../competitions/competition.entity';
import { CompetitionRegistration } from '../registrations/registration.entity';

@Entity('competition_results')
export class CompetitionResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'competition_id' })
  competitionId: string;

  @ManyToOne(() => Competition)
  @JoinColumn({ name: 'competition_id' })
  competition: Competition;

  @Column({ name: 'registration_id' })
  registrationId: string;

  @ManyToOne(() => CompetitionRegistration)
  @JoinColumn({ name: 'registration_id' })
  registration: CompetitionRegistration;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ nullable: true })
  place: number;

  @Column({ type: 'numeric', nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'judge_id' })
  judgeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'judge_id' })
  judge: User;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
