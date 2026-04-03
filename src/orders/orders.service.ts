import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { In } from 'typeorm';
import { Outlet } from 'src/outlets/entity/outlet.entity';
import { Menuitem } from 'src/menuitems/entity/menuitem.entity';
import { OutletUnit } from 'src/outlets/entity/outletUnit.entity';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/orderItem.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { OrderStatus } from 'src/utils/enum/orderStatus.enum';
import { ValidateUnitDto } from './dto/validate-unit.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import type { UUID } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Outlet)
    private outletRepository: Repository<Outlet>,
    @InjectRepository(Menuitem)
    private menuitemRepository: Repository<Menuitem>,
    @InjectRepository(OutletUnit)
    private outletUnitRepository: Repository<OutletUnit>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async getOutletMenu(outletId: UUID) {
    const menuitems = await this.menuitemRepository.find({
      where: {
        outlets: { outletId },
        status: CommonStatus.ACTIVE,
      },
      relations: { outlets: true },
    });

    return menuitems;
  }

  async validateUnit(dto: ValidateUnitDto) {
    const unit = await this.outletUnitRepository.findOne({
      where: {
        outlet: { outletId: dto.outletId },
        number: dto.unitNumber,
        status: CommonStatus.ACTIVE,
      },
    });

    return { valid: !!unit };
  }

  async createOrder(dto: CreateOrderDto) {
    // Validate outlet
    const outlet = await this.outletRepository.findOne({
      where: { outletId: dto.outletId, status: CommonStatus.ACTIVE },
    });
    if (!outlet) {
      throw new NotFoundException('Outlet not found or not active');
    }

    // Validate unit
    const unitExists = await this.validateUnit({
      outletId: dto.outletId,
      unitNumber: dto.unitNumber,
    });
    if (!unitExists.valid) {
      throw new BadRequestException('Invalid unit for this outlet');
    }

    // Validate menuitems
    const menuItemIds = dto.items.map((item) => item.menuItemId);
    const menuitems = await this.menuitemRepository.find({
      where: { menuitemId: In(menuItemIds), status: CommonStatus.ACTIVE },
      relations: { outlets: true },
    });

    if (menuitems.length !== menuItemIds.length) {
      throw new BadRequestException('Some menu items not found or not active');
    }

    // Check all menuitems belong to the outlet's property
    const outletPropertyId = outlet.property?.propertyId;
    for (const item of menuitems) {
      const belongs = item.outlets?.some(
        (out) => out.property?.propertyId === outletPropertyId,
      );
      if (!belongs) {
        throw new BadRequestException('Menu item not available in this outlet');
      }
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];
    for (const itemDto of dto.items) {
      const menuitem = menuitems.find(
        (m) => m.menuitemId === itemDto.menuItemId,
      );
      if (!menuitem) continue;
      const price = menuitem.price!;
      const subtotal = price * itemDto.quantity;
      totalAmount += subtotal;

      const orderItem = this.orderItemRepository.create({
        menuitem,
        quantity: itemDto.quantity,
        price,
      });
      orderItems.push(orderItem);
    }

    // Create order
    const order = this.orderRepository.create({
      outlet,
      unitNumber: dto.unitNumber,
      totalAmount,
      status: OrderStatus.PENDING_PAYMENT,
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    return {
      orderId: savedOrder.orderId,
      totalAmount: savedOrder.totalAmount,
    };
  }

  async getOrder(orderId: UUID) {
    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: { outlet: true, items: { menuitem: true } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
