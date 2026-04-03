import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Outlet } from 'src/outlets/entity/outlet.entity';
import { OrderStatus } from 'src/utils/enum/orderStatus.enum';
import { OrderItem } from './orderItem.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Index()
  @PrimaryGeneratedColumn('uuid')
  orderId?: UUID;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status?: OrderStatus;

  @ManyToOne(() => Outlet, (outlet) => outlet.orders, {
    onDelete: 'CASCADE',
  })
  outlet?: Outlet;

  @Column({ type: 'int', nullable: false })
  unitNumber?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount?: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items?: OrderItem[];

  @Column({ type: 'uuid', nullable: true })
  createdBy?: UUID;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: UUID;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
