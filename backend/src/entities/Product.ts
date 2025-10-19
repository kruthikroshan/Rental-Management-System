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
import { Category } from './Category';
import { ProductVariant } from './ProductVariant';
import { BookingOrderItem } from './BookingOrderItem';
import { QuotationItem } from './QuotationItem';
import { User } from './User';
import { RentalUnit, ProductCondition } from './enums';

export { RentalUnit, ProductCondition };

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVIEW = 'needs_review'
}

@Entity('products')
@Index(['categoryId'])
@Index(['isRentable'])
@Index(['isActive'])
@Index(['sku'], { unique: true })
@Index(['ownerId'])
@Index(['approvalStatus'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  categoryId: number;

  @Column('int')
  ownerId: number;

  @Column('varchar', { length: 200 })
  name: string;

  @Column('varchar', { length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('varchar', { length: 500, nullable: true })
  shortDescription?: string;

  @Column('varchar', { length: 100, unique: true })
  sku: string;

  @Column('varchar', { length: 100, nullable: true })
  barcode?: string;

  // Rental Configuration
  @Column('boolean', { default: true })
  isRentable: boolean;

  @Column({
    type: 'enum',
    enum: RentalUnit,
    default: RentalUnit.DAY
  })
  rentalUnits: RentalUnit;

  @Column('int', { default: 1 })
  minRentalDuration: number;

  @Column('int', { nullable: true })
  maxRentalDuration?: number;

  @Column('int', { default: 0 })
  advanceBookingDays: number;

  // Inventory
  @Column('int', { default: 0 })
  totalQuantity: number;

  @Column('int', { default: 0 })
  availableQuantity: number;

  @Column('int', { default: 0 })
  reservedQuantity: number;

  @Column('int', { default: 0 })
  maintenanceQuantity: number;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseRentalRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  securityDeposit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFeePerDay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  replacementCost?: number;

  // Product Details
  @Column('varchar', { length: 100, nullable: true })
  brand?: string;

  @Column('varchar', { length: 100, nullable: true })
  model?: string;

  @Column('int', { nullable: true })
  yearManufactured?: number;

  @Column({
    type: 'enum',
    enum: ProductCondition,
    default: ProductCondition.GOOD
  })
  condition: ProductCondition;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  specifications: Record<string, any>;

  // Media
  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ type: 'jsonb', default: [] })
  manuals: string[];

  // SEO
  @Column('varchar', { length: 200, nullable: true })
  metaTitle?: string;

  @Column('varchar', { length: 500, nullable: true })
  metaDescription?: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  // Status
  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('boolean', { default: false })
  isFeatured: boolean;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING
  })
  approvalStatus: ApprovalStatus;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, user => user.products)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductVariant, variant => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => BookingOrderItem, item => item.product)
  bookingItems: BookingOrderItem[];

  @OneToMany(() => QuotationItem, item => item.product)
  quotationItems: QuotationItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateSlug() {
    if (!this.slug) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  // Computed properties
  get utilizationRate(): number {
    if (this.totalQuantity === 0) return 0;
    return ((this.totalQuantity - this.availableQuantity) / this.totalQuantity) * 100;
  }

  get isAvailable(): boolean {
    return this.isActive && this.isRentable && this.availableQuantity > 0;
  }
}

