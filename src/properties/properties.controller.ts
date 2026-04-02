import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { RightsGuard } from 'src/users/auth/rights.guard';
import { AddPropertyDto } from './entity/add-property.dto';
import { PropertiesService } from './properties.service';
import { Right } from 'src/utils/enum/right.enum';
import { Rights } from 'src/utils/customDecorators/rights.decorator';

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
  @Post('/properties')
  async addProperty(@Body() dto: AddPropertyDto, @Req() req: Request | any) {
    const user = req.user.userId; // extracted from JWT by your auth guard
    const res = await this.propertyService.addProperty(dto, user);

    return { property: res };
  }
}
