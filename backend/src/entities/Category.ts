import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './Product';

@Entity('categories')
@Index(['isActive'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  metaTitle?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  metaDescription?: string;

  // Self-referencing relationship for parent-child hierarchy
  @Column({ type: 'int', nullable: true })
  parentId?: number;

  @ManyToOne(() => Category, category => category.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business logic methods
  isRoot(): boolean {
    return !this.parent;
  }

  hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  async getFullPath(): Promise<string> {
    if (!this.parent) {
      return this.name;
    }
    const parentPath = await this.parent.getFullPath();
    return `${parentPath} > ${this.name}`;
  }

  isDescendantOf(category: Category): boolean {
    let current = this.parent;
    while (current) {
      if (current.id === category.id) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  // Helper method to get all subcategories recursively
  async getAllSubcategories(): Promise<Category[]> {
    const subcategories: Category[] = [];
    
    if (this.children) {
      for (const child of this.children) {
        subcategories.push(child);
        const childSubcategories = await child.getAllSubcategories();
        subcategories.push(...childSubcategories);
      }
    }
    
    return subcategories;
  }
}

