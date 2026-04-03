import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { UUID } from 'crypto';

class OrderItemDto {
  @ApiProperty({ example: 'uuid-of-menuitem' })
  @IsNotEmpty()
  menuItemId: UUID;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-of-outlet' })
  @IsNotEmpty()
  outletId: UUID;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  unitNumber: number;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
