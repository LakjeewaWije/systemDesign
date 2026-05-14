import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
// @Unique(['mobilePhone'])
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Column()
  @PrimaryGeneratedColumn('uuid')
  userId?: UUID;

  @Column({ type: 'varchar', length: 255, default: null })
  firstName?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  lastName?: string;

  @Column('simple-array')
  roles?: string[];

  @Column({ type: 'varchar', length: 255, default: null })
  emailAddress?: string;

  @Column({ type: 'varchar', length: 10 })
  countryCode?: string;

  @Column({ type: 'varchar', length: 15 })
  mobilePhone?: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, default: null })
  password?: string;

  @Column({ type: 'smallint', nullable: true, default: 1 })
  status?: number;

  @Exclude()
  @Column({ type: 'smallint', default: 0 })
  isDeleted?: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @Column({ type: 'int', nullable: true })
  createdBy?: number;

  @Column({ type: 'int', default: null, nullable: true })
  updatedBy?: number;
}
