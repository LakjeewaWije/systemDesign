import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outlet } from 'src/outlets/entity/outlet.entity';
import { Menuitem } from 'src/menuitems/entity/menuitem.entity';
import { OutletUnit } from 'src/outlets/entity/outletUnit.entity';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/orderItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outlet, Menuitem, OutletUnit, Order, OrderItem]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
