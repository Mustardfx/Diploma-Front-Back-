import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Competition } from '../competitions/competition.entity';

export enum RegistrationStatus {
  PENDING   = 'pending',
  APPROVED  = 'approved',
  REJECTED  = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('competition_registrations')
export class CompetitionRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'competition_id' })
  competitionId: string;

  @ManyToOne(() => Competition)
  @JoinColumn({ name: 'competition_id' })
  competition: Competition;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @Column({ name: 'judge_id', nullable: true })
  judgeId: string;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;
}
