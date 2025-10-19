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
import { BookingOrder } from './BookingOrder';
import { InvoiceItem } from './InvoiceItem';
import { Payment } from './Payment';

export enum InvoiceType {
  RENTAL = 'rental',
  SECURITY_DEPOSIT = 'security_deposit',
  LATE_FEE = 'late_fee',
  DAMAGE_CHARGE = 'damage_charge',
  DELIVERY = 'delivery',
  REFUND = 'refund'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

@Entity('invoices')
@Index(['bookingOrderId'])
@Index(['customerId'])
@Index(['status'])
@Index(['dueDate'])
@Index(['invoiceNumber'], { unique: true })
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50, unique: true })
  invoiceNumber: string;

  @Column('int')
  bookingOrderId: number;

  @Column('int')
  customerId: number;

  @Column({
    type: 'enum',
    enum: InvoiceType,
    default: InvoiceType.RENTAL
  })
  type: InvoiceType;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT
  })
  status: InvoiceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  termsConditions?: string;

  @Column('int', { nullable: true })
  createdBy?: number;

  @Column('int', { nullable: true })
  approvedBy?: number;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  // Relationships
  @ManyToOne(() => BookingOrder, booking => booking.invoices)
  @JoinColumn({ name: 'bookingOrderId' })
  bookingOrder: BookingOrder;

  @ManyToOne(() => User, user => user.quotations)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => Payment, payment => payment.invoice)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateInvoiceNumber() {
    if (!this.invoiceNumber) {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substr(2, 5);
      this.invoiceNumber = `INV-${timestamp}-${randomStr}`.toUpperCase();
    }
  }

  // Computed properties
  get isOverdue(): boolean {
    return this.status !== InvoiceStatus.PAID && 
           this.status !== InvoiceStatus.CANCELLED && 
           new Date(this.dueDate) < new Date();
  }

  get daysOverdue(): number {
    if (!this.isOverdue) return 0;
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    return Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
  }
}

