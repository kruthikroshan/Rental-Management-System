import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('varchar', { length: 200, nullable: true })
  firstName?: string;

  @Column('varchar', { length: 200, nullable: true })
  lastName?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column('varchar', { length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column('varchar', { length: 100, nullable: true })
  city?: string;

  @Column('varchar', { length: 100, nullable: true })
  state?: string;

  @Column('varchar', { length: 20, nullable: true })
  postalCode?: string;

  @Column('varchar', { length: 100, nullable: true })
  country?: string;

  @Column('varchar', { length: 100, nullable: true })
  company?: string;

  @Column('varchar', { length: 100, nullable: true })
  jobTitle?: string;

  @Column('varchar', { length: 20, nullable: true })
  secondaryPhone?: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: Record<string, any>;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

