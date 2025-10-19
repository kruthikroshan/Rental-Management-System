import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BookingOrder } from './BookingOrder';
import { Product } from './Product';
import { ProductVariant } from './ProductVariant';
import { RentalUnit } from './enums';

export enum BookingItemStatus {
  RESERVED = 'reserved',
  PICKED_UP = 'picked_up',
  ACTIVE = 'active',
  RETURNED = 'returned',
  DAMAGED = 'damaged',
  LOST = 'lost'
}

@Entity('booking_order_items')
@Index(['bookingOrderId'])
@Index(['productId'])
@Index(['status'])
export class BookingOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  bookingOrderId: number;

  @Column('int')
  productId: number;

  @Column('int', { nullable: true })
  productVariantId?: number;

  @Column('varchar', { length: 200 })
  productName: string;

  @Column('varchar', { length: 100 })
  productSku: string;

  @Column('int')
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitRate: number;

  @Column('int')
  duration: number;

  @Column({
    type: 'enum',
    enum: RentalUnit,
    default: RentalUnit.DAY
  })
  durationType: RentalUnit;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lineTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  securityDepositPerUnit: number;

  @Column({
    type: 'enum',
    enum: BookingItemStatus,
    default: BookingItemStatus.RESERVED
  })
  status: BookingItemStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  damageNotes?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  damageCharges: number;

  @Column({ type: 'jsonb', default: [] })
  serialNumbers: string[];

  // Relationships
  @ManyToOne(() => BookingOrder, booking => booking.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingOrderId' })
  bookingOrder: BookingOrder;

  @ManyToOne(() => Product, product => product.bookingItems)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'productVariantId' })
  productVariant?: ProductVariant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

