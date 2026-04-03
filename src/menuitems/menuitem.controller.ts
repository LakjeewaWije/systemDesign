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
import { CreateMenuitemDto } from './dto/create-menuitem.dto';
import { MenuitemService } from './menuitem.service';
import type { UUID } from 'crypto';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { RightsGuard } from 'src/users/auth/rights.guard';
import { Rights } from 'src/utils/customDecorators/rights.decorator';
import { Right } from 'src/utils/enum/right.enum';
import { USERS_ROUTES } from 'src/utils/controller-route-prefix.constants';
import { UpdateMenuitemDto } from './dto/update-menuitem.dto';

@UseGuards(AuthGuard, RightsGuard)
@ApiBearerAuth()
@ApiTags('Menuitems')
@Controller()
export class MenuitemController {
  constructor(private readonly menuitemService: MenuitemService) {}

  @ApiOperation({
    summary: 'Create menuitem',
    description: 'Create a new menuitem and assign it to selected outlets',
  })
  @Rights(Right.SUPER_ADMIN_ADD_MENUITEM)
  @Post(`${USERS_ROUTES.ADMIN}/menuitems`)
  async createMenuitem(
    @Body() dto: CreateMenuitemDto,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.menuitemService.createMenuitem(dto, adminUserId);

    return { menuitem: res };
  }

  @ApiOperation({
    summary: 'Update menuitem',
    description: 'Update an existing menuitem',
  })
  @Rights(Right.SUPER_ADMIN_UPDATE_MENUITEM)
  @Patch(`${USERS_ROUTES.ADMIN}/menuitems/:menuitemId`)
  async updateMenuitem(
    @Param('menuitemId') menuitemId: UUID,
    @Body() dto: UpdateMenuitemDto,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.menuitemService.updateMenuitem(
      menuitemId,
      dto,
      adminUserId,
    );

    return { menuitem: res };
  }

  @ApiOperation({
    summary: 'Get all menuitems',
    description: 'Get all menuitems for the admin',
  })
  @Rights(Right.SUPER_ADMIN_GET_ALL_MENUITEMS)
  @Get(`${USERS_ROUTES.ADMIN}/menuitems`)
  async getAllMenuitems(@Req() req: Request | any) {
    const adminUserId = req.user.userId;

    const res = await this.menuitemService.getAllMenuitems(adminUserId);

    return { menuitems: res };
  }

  @ApiOperation({
    summary: 'Get menuitem by ID',
    description: 'Get a single menuitem by its ID',
  })
  @Rights(Right.SUPER_ADMIN_GET_MENUITEM)
  @Get(`${USERS_ROUTES.ADMIN}/menuitems/:menuitemId`)
  async getMenuitemById(
    @Param('menuitemId') menuitemId: UUID,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;

    const res = await this.menuitemService.getMenuitemById(
      menuitemId,
      adminUserId,
    );

    return { menuitem: res };
  }
}
