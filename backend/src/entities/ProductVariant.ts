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
import { Product } from './Product';

export enum VariantType {
  SIZE = 'size',
  COLOR = 'color',
  MODEL = 'model',
  CAPACITY = 'capacity',
  OTHER = 'other'
}

@Entity('product_variants')
@Index(['productId'])
@Index(['isActive'])
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  productId: number;

  @Column('varchar', { length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: VariantType,
    default: VariantType.OTHER
  })
  type: VariantType;

  @Column('varchar', { length: 100, nullable: true })
  sku?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceAdjustment?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column('int', { default: 0 })
  stockQuantity: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('int', { default: 0 })
  sortOrder: number;

  @ManyToOne(() => Product, product => product.variants)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

