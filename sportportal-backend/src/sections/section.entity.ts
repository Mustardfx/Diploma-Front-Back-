import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export interface ScheduleItem {
  dayOfWeek: number; // 0=Пн ... 6=Вс
  timeStart: string; // "09:00"
  timeEnd: string;   // "11:00"
}

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  sport: string;

  @Column({ name: 'coach_id', nullable: true })
  coachId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'coach_id' })
  coach: User;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  location: string;

  @Column({ type: 'jsonb', default: [] })
  schedule: ScheduleItem[];

  @Column({ name: 'max_participants' })
  maxParticipants: number;

  @Column({ name: 'age_min', nullable: true })
  ageMin: number;

  @Column({ name: 'age_max', nullable: true })
  ageMax: number;

  @Column({ type: 'numeric', nullable: true })
  price: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
