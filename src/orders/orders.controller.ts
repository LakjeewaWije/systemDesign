import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { ValidateUnitDto } from './dto/validate-unit.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Public } from 'src/utils/customDecorators/publicRequest.decorator';
import type { UUID } from 'crypto';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({
    summary: 'Get outlet menu',
    description: 'Returns active menu items for the outlet',
  })
  @Public()
  @Get('/api/outlets/:outletId/menu')
  async getOutletMenu(@Param('outletId') outletId: UUID) {
    return this.ordersService.getOutletMenu(outletId);
  }

  @ApiOperation({
    summary: 'Validate unit',
    description: 'Check if unit exists for outlet',
  })
  @Public()
  @Post('/api/rooms/validate')
  async validateUnit(@Body() dto: ValidateUnitDto) {
    return this.ordersService.validateUnit(dto);
  }

  @ApiOperation({
    summary: 'Create order',
    description: 'Create a new unpaid order',
  })
  @Public()
  @Post('/api/orders')
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @ApiOperation({
    summary: 'Get order status',
    description: 'Get order details and status',
  })
  @Public()
  @Get('/api/orders/:orderId')
  async getOrder(@Param('orderId') orderId: UUID) {
    return this.ordersService.getOrder(orderId);
  }
}
