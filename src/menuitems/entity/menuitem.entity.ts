import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Outlet } from 'src/outlets/entity/outlet.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';

@Entity()
export class Menuitem {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Index()
  @PrimaryGeneratedColumn('uuid')
  menuitemId?: UUID;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price?: number;

  @Column({ type: 'int', default: CommonStatus.ACTIVE })
  status?: CommonStatus;

  @ManyToMany(() => Outlet, (outlet) => outlet.menuitems, {
    cascade: true,
  })
  @JoinTable()
  outlets?: Outlet[];

  @Column({ type: 'uuid', nullable: true })
  createdBy?: UUID;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: UUID;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
