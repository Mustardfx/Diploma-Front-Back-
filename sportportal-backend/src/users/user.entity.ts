import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../common/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ATHLETE })
  role: UserRole;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  patronymic: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  sport: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  // ─── Сброс пароля ───────────────────────────────────────────────
  @Column({ name: 'reset_token_hash', type: 'varchar', nullable: true })
  @Exclude()
  resetTokenHash: string | null;

  @Column({ name: 'reset_token_expires', type: 'timestamptz', nullable: true })
  @Exclude()
  resetTokenExpires: Date | null;

  @Column({ name: 'must_change_password', type: 'boolean', default: false })
  mustChangePassword: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
