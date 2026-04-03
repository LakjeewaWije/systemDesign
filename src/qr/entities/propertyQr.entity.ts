import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from 'src/properties/entity/property.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';

@Entity()
export class PropertyQr {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Column({ type: 'uuid', unique: true })
  qrId?: UUID;

  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status?: CommonStatus;

  @OneToOne(() => Property, (property) => property.propertyQr, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  property?: Property;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: UUID;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: UUID;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
