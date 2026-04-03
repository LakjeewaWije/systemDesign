import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Menuitem } from 'src/menuitems/entity/menuitem.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  @Exclude()
  id?: number;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order?: Order;

  @ManyToOne(() => Menuitem, (menuitem) => menuitem.orderItems, {
    onDelete: 'CASCADE',
  })
  menuitem?: Menuitem;

  @Column({ type: 'int', nullable: false })
  quantity?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price?: number; // price at time of order
}
