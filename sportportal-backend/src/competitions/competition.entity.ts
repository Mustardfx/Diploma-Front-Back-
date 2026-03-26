import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum CompetitionStatus {
  UPCOMING  = 'upcoming',
  ONGOING   = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CompetitionCategory {
  id: string;
  name: string;
  ageMin?: number;
  ageMax?: number;
  weightClass?: string;
}

@Entity('competitions')
export class Competition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  sport: string;

  @Column({ name: 'organizer_id' })
  organizerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  location: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'registration_deadline', type: 'date' })
  registrationDeadline: string;

  @Column({ name: 'max_participants' })
  maxParticipants: number;

  @Column({
    type: 'enum',
    enum: CompetitionStatus,
    default: CompetitionStatus.UPCOMING,
  })
  status: CompetitionStatus;

  @Column({ type: 'jsonb', default: [] })
  categories: CompetitionCategory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
