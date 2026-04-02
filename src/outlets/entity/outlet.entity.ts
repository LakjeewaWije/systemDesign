import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OutletType } from '../enum/outletType.enum';
import { Property } from 'src/properties/entity/property.entity';

@Entity()
export class Outlet {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Index()
  @PrimaryGeneratedColumn('uuid')
  outletId?: UUID;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: OutletType,
    nullable: false,
  })
  type?: OutletType;

  @Index()
  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status?: number;

  @ManyToOne(() => Property, (property) => property.outlets, {
    onDelete: 'CASCADE',
  })
  property?: Property;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  createdBy?: UUID;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  updatedBy?: UUID;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
