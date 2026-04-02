import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { Role } from 'src/utils/enum/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Index()
  @PrimaryGeneratedColumn('uuid')
  userId?: UUID;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName?: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Index()
  @Column({ type: 'varchar', length: 255, default: null })
  emailAddress?: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, default: null })
  password?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.ADMIN,
  })
  role?: Role;

  @Index()
  @Column({ type: 'enum', enum: CommonStatus, default: 1 })
  status?: number;

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
