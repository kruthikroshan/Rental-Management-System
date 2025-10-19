import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
  BeforeInsert
} from 'typeorm';
import { User } from './User';
import { QuotationItem } from './QuotationItem';
import { BookingOrder } from './BookingOrder';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted'
}

@Entity('quotations')
@Index(['customerId'])
@Index(['status'])
@Index(['expiryDate'])
@Index(['quotationNumber'], { unique: true })
export class Quotation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50, unique: true })
  quotationNumber: string;

  @Column('int')
  customerId: number;

  @Column({ type: 'date' })
  pickupDate: Date;

  @Column({ type: 'date' })
  returnDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  // Location Details
  @Column({ type: 'jsonb' })
  pickupLocation: {
    address: string;
    coordinates?: { lat: number; lng: number };
    contact?: string;
  };

  @Column({ type: 'jsonb' })
  returnLocation: {
    address: string;
    coordinates?: { lat: number; lng: number };
    contact?: string;
  };

  @Column('boolean', { default: false })
  deliveryRequired: boolean;

  @Column('boolean', { default: false })
  pickupRequired: boolean;

  // Financial Details
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryCharges: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  securityDeposit: number;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT
  })
  status: QuotationStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  termsConditions?: string;

  @Column('timestamp', { nullable: true })
  validUntil?: Date;

  @Column('int', { nullable: true })
  createdBy?: number;

  @Column('int', { nullable: true })
  approvedBy?: number;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  // Relationships
  @ManyToOne(() => User, user => user.quotations)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @OneToMany(() => QuotationItem, item => item.quotation, { cascade: true })
  items: QuotationItem[];

  @OneToMany(() => BookingOrder, booking => booking.quotation)
  bookingOrders: BookingOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateQuotationNumber() {
    if (!this.quotationNumber) {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substr(2, 5);
      this.quotationNumber = `QT-${timestamp}-${randomStr}`.toUpperCase();
    }
  }

  // Computed properties
  get rentalDuration(): number {
    const startDate = new Date(this.pickupDate);
    const endDate = new Date(this.returnDate);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  }

  get isExpired(): boolean {
    return this.expiryDate < new Date();
  }
}

