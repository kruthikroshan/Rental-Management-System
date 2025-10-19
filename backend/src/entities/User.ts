import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { BookingOrder } from './BookingOrder';
import { Quotation } from './Quotation';
import { UserProfile } from './UserProfile';
import { Payment } from './Payment';
import { Product } from './Product';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer'
}

export enum UserPermission {
  READ_ALL = 'read_all',
  WRITE_ALL = 'write_all',
  DELETE_ALL = 'delete_all',
  MANAGE_USERS = 'manage_users',
  READ_RENTALS = 'read_rentals',
  WRITE_RENTALS = 'write_rentals',
  DELETE_RENTALS = 'delete_rentals',
  MANAGE_CUSTOMERS = 'manage_customers',
  READ_OWN = 'read_own',
  WRITE_OWN = 'write_own',
  VIEW_REPORTS = 'view_reports',
  MANAGE_SETTINGS = 'manage_settings'
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
@Index(['isActive'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('varchar', { length: 255, select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  role: UserRole;

  @Column('varchar', { length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('boolean', { default: false })
  isEmailVerified: boolean;

  @Column('varchar', { length: 255, nullable: true })
  emailVerificationToken?: string;

  @Column('varchar', { length: 255, nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column('int', { default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockUntil?: Date;

  @Column({
    type: 'enum',
    enum: UserPermission,
    array: true,
    default: []
  })
  permissions: UserPermission[];

  // Relationships
  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  profile?: UserProfile;

  @OneToMany(() => BookingOrder, booking => booking.customer)
  bookings: BookingOrder[];

  @OneToMany(() => Quotation, quotation => quotation.customer)
  quotations: Quotation[];

  @OneToMany(() => Payment, payment => payment.paidBy)
  payments: Payment[];

  @OneToMany(() => Product, product => product.owner)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual password field
  password?: string;

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      this.passwordHash = await bcrypt.hash(this.password, saltRounds);
      delete this.password; // Remove plaintext password
    }
  }

  @BeforeInsert()
  setDefaultPermissions() {
    // Initialize permissions array if it doesn't exist
    if (!this.permissions) {
      this.permissions = [];
    }
    
    if (this.permissions.length === 0) {
      switch (this.role) {
        case UserRole.ADMIN:
          this.permissions = [
            UserPermission.READ_ALL,
            UserPermission.WRITE_ALL,
            UserPermission.DELETE_ALL,
            UserPermission.MANAGE_USERS,
            UserPermission.VIEW_REPORTS,
            UserPermission.MANAGE_SETTINGS
          ];
          break;
        case UserRole.MANAGER:
          this.permissions = [
            UserPermission.READ_RENTALS,
            UserPermission.WRITE_RENTALS,
            UserPermission.MANAGE_CUSTOMERS,
            UserPermission.VIEW_REPORTS
          ];
          break;
        case UserRole.CUSTOMER:
          this.permissions = [
            UserPermission.READ_OWN,
            UserPermission.WRITE_OWN
          ];
          break;
      }
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
  }

  isLocked(): boolean {
    return !!(this.lockUntil && this.lockUntil > new Date());
  }

  async incrementLoginAttempts(): Promise<void> {
    const updates: Partial<User> = {
      loginAttempts: this.loginAttempts + 1
    };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
      updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
    }

    Object.assign(this, updates);
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }
}

