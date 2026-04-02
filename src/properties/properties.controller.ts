import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { RightsGuard } from 'src/users/auth/rights.guard';
import { PropertiesService } from './properties.service';
import { Right } from 'src/utils/enum/right.enum';
import { Rights } from 'src/utils/customDecorators/rights.decorator';
import { UpdatePropertyDto } from './dto/update-property.dto';
import type { UUID } from 'crypto';
import { AddPropertyDto } from './dto/add-property.dto';
import { USERS_ROUTES } from 'src/utils/controller-route-prefix.constants';

@UseGuards(AuthGuard, RightsGuard)
@ApiBearerAuth()
@ApiTags('properties')
@Controller()
export class PropertiesController {
  constructor(private readonly propertyService: PropertiesService) {}
  @ApiOperation({
    summary: 'Add Property',
    description: 'Add a new property for the authenticated admin user',
  })
  @Rights(Right.SUPER_ADMIN_ADD_PROPERTY)
  @Post(`${USERS_ROUTES.ADMIN}/properties`)
  async addProperty(@Body() dto: AddPropertyDto, @Req() req: Request | any) {
    const user = req.user.userId; // extracted from JWT by your auth guard
    const res = await this.propertyService.addProperty(dto, user);

    return { property: res };
  }

  @Patch(`${USERS_ROUTES.ADMIN}/properties/:propertyId`)
  @Rights(Right.SUPER_ADMIN_ADD_PROPERTY)
  async updateProperty(
    @Param('propertyId') propertyId: UUID,
    @Body() dto: UpdatePropertyDto,
    @Req() req: Request | any,
  ) {
    const userId = req.user.userId;

    const res = await this.propertyService.updateProperty(
      propertyId,
      dto,
      userId,
    );

    return { property: res };
  }

  @ApiOperation({
    summary: 'Get Property',
    description:
      'Get a single property belonging to the authenticated admin user',
  })
  @Get(`${USERS_ROUTES.ADMIN}/properties/:propertyId`)
  async getProperty(
    @Param('propertyId') propertyId: UUID,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.propertyService.getPropertyById(
      propertyId,
      adminUserId,
    );

    return { property: res };
  }

  @ApiOperation({
    summary: 'Get All Properties',
    description: 'Get all properties belonging to the authenticated admin user',
  })
  @Get(`${USERS_ROUTES.ADMIN}/properties`)
  async getAllProperties(@Req() req: Request | any) {
    const adminUserId = req.user.userId;

    const res = await this.propertyService.getAllProperties(adminUserId);

    return { properties: res };
  }
}
