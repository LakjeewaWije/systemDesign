import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QrService } from './qr.service';
import type { UUID } from 'crypto';
import { AuthGuard } from 'src/users/auth/auth.guard';
import { RightsGuard } from 'src/users/auth/rights.guard';
import { Rights } from 'src/utils/customDecorators/rights.decorator';
import { Right } from 'src/utils/enum/right.enum';
import { USERS_ROUTES } from 'src/utils/controller-route-prefix.constants';
import { Public } from 'src/utils/customDecorators/publicRequest.decorator';
import { UpdatePropertyQrDto } from './dto/update-property-qr.dto';

@UseGuards(AuthGuard, RightsGuard)
@ApiBearerAuth()
@ApiTags('QR')
@Controller()
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @ApiOperation({
    summary: 'Get QR for a property',
    description: 'Returns qrId and URL (admin view)',
  })
  @Rights(Right.SUPER_ADMIN_GET_PROPERTY_QR)
  @Get(`${USERS_ROUTES.ADMIN}/properties/:propertyId/qr`)
  async getQrForProperty(@Param('propertyId') propertyId: UUID) {
    return this.qrService.getQrForProperty(propertyId);
  }

  @ApiOperation({
    summary: 'Resolve QR code',
    description: 'Returns the propertyId and outlets linked to QR',
  })
  @Public()
  @Get('/qr/:qrId')
  async resolveQr(@Param('qrId') qrId: UUID) {
    return this.qrService.resolveQr(qrId);
  }

  @ApiOperation({
    summary: 'Update QR status',
    description: 'Set QR status to active/inactive',
  })
  @Rights(Right.SUPER_ADMIN_UPDATE_QR)
  @Patch(`${USERS_ROUTES.ADMIN}/qr/:qrId/status`)
  async updateQrStatus(
    @Param('qrId') qrId: UUID,
    @Body() dto: UpdatePropertyQrDto,
    @Req() req: Request | any,
  ) {
    const adminUserId = req.user.userId;
    const res = await this.qrService.updateQrStatus(
      qrId,
      dto.status,
      adminUserId,
    );

    return { qr: res };
  }
}
