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
import { Quotation } from './Quotation';
import { Product } from './Product';
import { ProductVariant } from './ProductVariant';
import { RentalUnit } from './enums';

@Entity('quotation_items')
@Index(['quotationId'])
@Index(['productId'])
export class QuotationItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  quotationId: number;

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

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relationships
  @ManyToOne(() => Quotation, quotation => quotation.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationId' })
  quotation: Quotation;

  @ManyToOne(() => Product, product => product.quotationItems)
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

