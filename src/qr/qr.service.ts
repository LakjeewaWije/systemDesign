import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Outlet } from 'src/outlets/entity/outlet.entity';
import { Property } from 'src/properties/entity/property.entity';
import { PropertyQr } from './entities/propertyQr.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { Repository } from 'typeorm';
import { UUID } from 'crypto';

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(PropertyQr)
    private propertyQrRepository: Repository<PropertyQr>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Outlet)
    private outletRepository: Repository<Outlet>,
  ) {}

  async getQrForProperty(propertyId: UUID) {
    const property = await this.propertyRepository.findOne({
      where: { propertyId },
      relations: { propertyQr: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (!property.propertyQr) {
      throw new NotFoundException('QR code not generated for this property');
    }

    return {
      qrId: property.propertyQr.qrId,
      url: `api/qr/${property.propertyQr.qrId}`,
      status: property.propertyQr.status,
    };
  }

  async resolveQr(qrId: UUID) {
    const propertyQr = await this.propertyQrRepository.findOne({
      where: { qrId },
      relations: { property: { outlets: true } },
    });

    if (!propertyQr) {
      throw new NotFoundException('QRCode not found');
    }

    if (propertyQr.status !== undefined && propertyQr.status !== 1) {
      throw new ForbiddenException('QRCode is not active');
    }

    const property = propertyQr.property;

    if (!property) {
      throw new NotFoundException('Property not found for this QR');
    }

    return {
      propertyId: property.propertyId,
      outlets: property.outlets ?? [],
    };
  }

  async updateQrStatus(qrId: UUID, status: CommonStatus, adminUserId: UUID) {
    const propertyQr = await this.propertyQrRepository.findOne({
      where: { qrId },
      relations: { property: { admin: true } },
    });

    if (!propertyQr) {
      throw new NotFoundException('QRCode not found');
    }

    if (!propertyQr.property) {
      throw new NotFoundException('Property not found for this QR');
    }

    // optional: verify admin owns property
    if (propertyQr.property.admin?.userId !== adminUserId) {
      throw new ForbiddenException('Access denied');
    }

    propertyQr.status = status;
    propertyQr.updatedBy = adminUserId;

    return this.propertyQrRepository.save(propertyQr);
  }
}
