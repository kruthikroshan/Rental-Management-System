import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  BeforeInsert
} from 'typeorm';
import { User } from './User';
import { Invoice } from './Invoice';
import { BookingOrder } from './BookingOrder';

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  WALLET = 'wallet',
  CHEQUE = 'cheque',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentType {
  ADVANCE = 'advance',
  RENTAL_FEE = 'rental_fee',
  SECURITY_DEPOSIT = 'security_deposit',
  LATE_FEE = 'late_fee',
  DAMAGE_CHARGE = 'damage_charge',
  DELIVERY_CHARGE = 'delivery_charge',
  REFUND = 'refund'
}

@Entity('payments')
@Index(['invoiceId'])
@Index(['bookingOrderId'])
@Index(['paidBy'])
@Index(['status'])
@Index(['paymentDate'])
@Index(['transactionId'], { unique: true })
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100, unique: true })
  transactionId: string;

  @Column('int', { nullable: true })
  invoiceId?: number;

  @Column('int', { nullable: true })
  bookingOrderId?: number;

  @Column('int')
  paidBy: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column('varchar', { length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.RENTAL_FEE
  })
  type: PaymentType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({ type: 'timestamp' })
  paymentDate: Date;

  @Column('varchar', { length: 255, nullable: true })
  paymentReference?: string;

  @Column('varchar', { length: 255, nullable: true })
  gatewayTransactionId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse?: Record<string, any>;

  @Column('int', { nullable: true })
  processedBy?: number;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  processingFee?: number;

  // Relationships
  @ManyToOne(() => Invoice, invoice => invoice.payments, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Invoice;

  @ManyToOne(() => BookingOrder, { nullable: true })
  @JoinColumn({ name: 'bookingOrderId' })
  booking?: BookingOrder;

  @ManyToOne(() => User, user => user.payments)
  @JoinColumn({ name: 'paidBy' })
  paidByUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateTransactionId() {
    if (!this.transactionId) {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substr(2, 8);
      this.transactionId = `TXN-${timestamp}-${randomStr}`.toUpperCase();
    }
  }
}

