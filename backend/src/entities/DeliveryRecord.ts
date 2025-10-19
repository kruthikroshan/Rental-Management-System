import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { BookingOrder } from './BookingOrder';

export enum DeliveryType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
  RETURN_PICKUP = 'return_pickup',
  RETURN_DELIVERY = 'return_delivery'
}

export enum DeliveryStatus {
  SCHEDULED = 'scheduled',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

@Entity('delivery_records')
@Index(['bookingOrderId'])
@Index(['scheduledDate'])
@Index(['status'])
@Index(['driverId'])
export class DeliveryRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  bookingOrderId: number;

  @Column({
    type: 'enum',
    enum: DeliveryType
  })
  deliveryType: DeliveryType;

  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDate?: Date;

  @Column({ type: 'jsonb' })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };

  @Column('varchar', { length: 20, nullable: true })
  contactPhone?: string;

  @Column('varchar', { length: 200, nullable: true })
  contactPerson?: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.SCHEDULED
  })
  status: DeliveryStatus;

  @Column('int', { nullable: true })
  driverId?: number;

  @Column('varchar', { length: 100, nullable: true })
  vehicleNumber?: string;

  @Column({ type: 'text', nullable: true })
  deliveryInstructions?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', default: [] })
  photos: string[];

  @Column({ type: 'text', nullable: true })
  signature?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryCharges: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distance?: number;

  // Relationships
  @ManyToOne(() => BookingOrder, booking => booking.deliveries)
  @JoinColumn({ name: 'bookingOrderId' })
  bookingOrder: BookingOrder;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

