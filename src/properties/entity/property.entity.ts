import { Exclude } from 'class-transformer';
import type { UUID } from 'crypto';
import { Outlet } from 'src/outlets/entity/outlet.entity';
import { AdminUser } from 'src/users/entity/adminUser.entity';
import { PropertyQr } from 'src/qr/entities/propertyQr.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @Index()
  @PrimaryGeneratedColumn('uuid')
  propertyId?: UUID;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name?: string;

  @Index()
  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  city?: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  country?: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string;

  @Index()
  @Column({ type: 'enum', enum: CommonStatus, default: CommonStatus.ACTIVE })
  status?: number;

  // ⭐ Many Properties → One Admin
  @ManyToOne(() => AdminUser, (admin) => admin.properties, {
    onDelete: 'CASCADE',
  })
  admin?: AdminUser;

  // ⭐ One Property → Many Outlets
  @OneToMany(() => Outlet, (outlet) => outlet.property)
  outlets?: Outlet[];

  // ⭐ One Property → One QR token
  @OneToOne(() => PropertyQr, (qr) => qr.property, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  propertyQr?: PropertyQr;

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
