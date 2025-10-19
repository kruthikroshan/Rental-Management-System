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
import { Quotation } from './Quotation';
import { BookingOrderItem } from './BookingOrderItem';
import { Invoice } from './Invoice';
import { DeliveryRecord } from './DeliveryRecord';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_PICKUP = 'ready_pickup',
  PICKED_UP = 'picked_up',
  ACTIVE = 'active',
  RETURNED = 'returned',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

@Entity('booking_orders')
@Index(['customerId'])
@Index(['status'])
@Index(['pickupDate', 'returnDate'])
@Index(['assignedTo'])
@Index(['orderNumber'], { unique: true })
export class BookingOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50, unique: true })
  orderNumber: string;

  @Column('int', { nullable: true })
  quotationId?: number;

  @Column('int')
  customerId: number;

  // Rental Dates
  @Column({ type: 'date' })
  pickupDate: Date;

  @Column({ type: 'date' })
  returnDate: Date;

  @Column({ type: 'date', nullable: true })
  actualPickupDate?: Date;

  @Column({ type: 'date', nullable: true })
  actualReturnDate?: Date;

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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  damageCharges: number;

  // Payment Tracking
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  advancePaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceAmount: number;

  // Order Status
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED
  })
  status: BookingStatus;

  // Staff Assignment
  @Column('int', { nullable: true })
  assignedTo?: number;

  @Column('int', { nullable: true })
  confirmedBy?: number;

  @Column('int', { nullable: true })
  pickupStaff?: number;

  @Column('int', { nullable: true })
  returnStaff?: number;

  // Notes and Terms
  @Column({ type: 'text', nullable: true })
  termsConditions?: string;

  @Column({ type: 'text', nullable: true })
  customerNotes?: string;

  @Column({ type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'text', nullable: true })
  returnNotes?: string;

  // Notification Tracking
  @Column('boolean', { default: false })
  pickupReminderSent: boolean;

  @Column('boolean', { default: false })
  returnReminderSent: boolean;

  @Column('boolean', { default: false })
  overdueNoticeSent: boolean;

  // Relationships
  @ManyToOne(() => User, user => user.bookings)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => Quotation, quotation => quotation.bookingOrders, { nullable: true })
  @JoinColumn({ name: 'quotationId' })
  quotation?: Quotation;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignedUser?: User;

  @OneToMany(() => BookingOrderItem, item => item.bookingOrder, { cascade: true })
  items: BookingOrderItem[];

  @OneToMany(() => Invoice, invoice => invoice.bookingOrder)
  invoices: Invoice[];

  @OneToMany(() => DeliveryRecord, delivery => delivery.bookingOrder)
  deliveries: DeliveryRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateOrderNumber() {
    if (!this.orderNumber) {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substr(2, 5);
      this.orderNumber = `BO-${timestamp}-${randomStr}`.toUpperCase();
    }
  }

  // Computed properties
  get rentalDuration(): number {
    const startDate = new Date(this.pickupDate);
    const endDate = new Date(this.returnDate);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  }

  get isOverdue(): boolean {
    const today = new Date();
    return this.status === BookingStatus.ACTIVE && new Date(this.returnDate) < today;
  }

  get daysOverdue(): number {
    if (!this.isOverdue) return 0;
    const today = new Date();
    const returnDate = new Date(this.returnDate);
    return Math.ceil((today.getTime() - returnDate.getTime()) / (1000 * 3600 * 24));
  }
}

