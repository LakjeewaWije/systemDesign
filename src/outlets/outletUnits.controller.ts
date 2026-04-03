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
import { UpdateOutletUnitDto } from './dto/update-outlet-unit.dto';
import { OutletUnitsService } from './outletUnits.service';
import { AddUnitsRangeDto } from './dto/add-units.dto';

@UseGuards(AuthGuard, RightsGuard)
@ApiBearerAuth()
@ApiTags('Outlet Units')
@Controller()
export class OutletUnitsController {
  constructor(
    private readonly outletService: OutletsService,
    private readonly outletUnitService: OutletUnitsService,
  ) {}

  @ApiOperation({
    summary: 'Add units by range',
    description: 'Add table/room numbers to an outlet using a numeric range',
  })
  @Rights(Right.SUPER_ADMIN_ADD_OUTLET_UNITS)
  @Post(`/api/${USERS_ROUTES.ADMIN}/outlets/:outletId/units/range`)
  async addUnitsRange(
    @Param('outletId') outletId: UUID,
    @Body() dto: AddUnitsRangeDto,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.outletUnitService.addUnitsRange(
      outletId,
      dto,
      adminUserId,
    );

    return { units: res };
  }

  @ApiOperation({
    summary: 'Update outlet unit',
    description: 'Update the status and booking status of an outlet unit',
  })
  @Rights(Right.SUPER_ADMIN_UPDATE_OUTLET_UNITS)
  @Patch(`/api/${USERS_ROUTES.ADMIN}/outlets/:outletId/units/:unitId`)
  async updateUnit(
    @Param('outletId') outletId: UUID,
    @Param('unitId') unitId: UUID,
    @Body() dto: UpdateOutletUnitDto,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.outletUnitService.updateUnit(
      unitId,
      dto,
      adminUserId,
    );

    return { unit: res };
  }

  @ApiOperation({
    summary: 'Get outlet unit',
    description: 'Get a single outlet unit by ID',
  })
  @Rights(Right.SUPER_ADMIN_GET_OUTLET_UNIT)
  @Get(`/api/${USERS_ROUTES.ADMIN}/outlets/:outletId/units/:unitId`)
  async getUnit(
    @Param('outletId') outletId: UUID,
    @Param('unitId') unitId: UUID,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.outletUnitService.getUnitById(unitId, adminUserId);

    return { unit: res };
  }

  @ApiOperation({
    summary: 'Get all outlet units',
    description: 'Get all units for a specific outlet',
  })
  @Rights(Right.SUPER_ADMIN_GET_ALL_OUTLET_UNITS)
  @Get(`/api/${USERS_ROUTES.ADMIN}/outlets/:outletId/units`)
  async getAllUnitsForOutlet(
    @Param('outletId') outletId: UUID,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.outletUnitService.getAllUnitsForOutlet(
      outletId,
      adminUserId,
    );

    return { units: res };
  }
}
