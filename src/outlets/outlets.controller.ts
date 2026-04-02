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
import { CreateOutletDto } from './dto/add-outlet.dto';
import { OutletsService } from './outlets.service';
import type { UUID } from 'crypto';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { RightsGuard } from 'src/users/auth/rights.guard';
import { Rights } from 'src/utils/customDecorators/rights.decorator';
import { Right } from 'src/utils/enum/right.enum';
import { USERS_ROUTES } from 'src/utils/controller-route-prefix.constants';
import { UpdateOutletDto } from './dto/update-outlet';

@UseGuards(AuthGuard, RightsGuard)
@ApiBearerAuth()
@ApiTags('Outlets')
@Controller()
export class OutletsController {
  constructor(private readonly outletService: OutletsService) {}
  @ApiOperation({
    summary: 'Create Outlet',
    description: 'Create an outlet for a specific property',
  })
  @Rights(Right.SUPER_ADMIN_ADD_OUTLET)
  @Get(`${USERS_ROUTES.ADMIN}/properties/:propertyId/outlets`)
  async createOutlet(
    @Param('propertyId') propertyId: UUID,
    @Body() dto: CreateOutletDto,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.outletService.createOutlet(
      propertyId,
      dto,
      adminUserId,
    );

    return { outlet: res };
  }

  @ApiOperation({
    summary: 'Update Outlet',
    description: 'Update an outlet belonging to a property owned by the admin',
  })
  @Rights(Right.SUPER_ADMIN_UPDATE_OUTLET)
  @Patch(`${USERS_ROUTES.ADMIN}/outlets/:outletId`)
  async updateOutlet(
    @Param('outletId') outletId: UUID,
    @Body() dto: UpdateOutletDto,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.outletService.updateOutlet(
      outletId,
      dto,
      adminUserId,
    );

    return { outlet: res };
  }

  @ApiOperation({
    summary: 'Get Outlet',
    description:
      'Get a single outlet belonging to the authenticated admin user',
  })
  @Rights(Right.SUPER_ADMIN_GET_OUTLET)
  @Get(`${USERS_ROUTES.ADMIN}/outlets/:outletId`)
  async getOutlet(
    @Param('outletId') outletId: UUID,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.outletService.getOutletById(outletId, adminUserId);

    return { outlet: res };
  }

  @ApiOperation({
    summary: 'Get All Outlets',
    description: 'Get all outlets belonging to the authenticated admin user',
  })
  @Rights(Right.SUPER_ADMIN_GET_ALL_OUTLETS)
  @Get(`${USERS_ROUTES.ADMIN}/outlets`)
  async getAllOutlets(@Req() req: Request | any) {
    const adminUserId = req.user.userId;

    const res = await this.outletService.getAllOutlets(adminUserId);

    return { outlets: res };
  }
}
