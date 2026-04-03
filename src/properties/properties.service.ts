import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from 'src/users/entity/adminUser.entity';
import { ILike, Repository } from 'typeorm';
import { randomUUID, UUID } from 'crypto';
import { Property } from './entity/property.entity';
import { PropertyQr } from 'src/qr/entities/propertyQr.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AddPropertyDto } from './dto/add-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(PropertyQr)
    private propertyQrRepository: Repository<PropertyQr>,
  ) {}

  // add property by admin user
  async addProperty(dto: AddPropertyDto, userId: UUID): Promise<Property> {
    try {
      const admin = await this.adminUserRepository.findOne({
        where: { userId: userId, status: CommonStatus.ACTIVE },
      });

      if (!admin)
        throw new ForbiddenException('Admin is not active or not found');

      // 2. Check if property with same name already exists for this admin
      const existingProperty = await this.propertyRepository.findOne({
        where: {
          name: ILike(dto.name),
          admin: { userId: userId },
        },
        relations: {
          admin: true,
        },
      });

      if (existingProperty)
        throw new BadRequestException('Property Name Already Exists');

      // 3. add and save property
      const res = await this.propertyRepository.save({
        ...dto,
        admin: admin,
        createdBy: userId,
        updatedBy: userId,
      } as Property);

      const propertyQr = this.propertyQrRepository.create({
        qrId: randomUUID(),
        status: CommonStatus.ACTIVE,
        property: res,
        createdBy: userId,
        updatedBy: userId,
      });
      await this.propertyQrRepository.save(propertyQr);

      return res;
    } catch (error) {
      throw error;
    }
  }
  async updateProperty(
    propertyId: UUID,
    dto: UpdatePropertyDto,
    adminUserId: UUID,
  ): Promise<Property> {
    try {
      // Validate admin exists & active
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });

      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      // Validate property belongs to this admin
      const property = await this.propertyRepository.findOne({
        where: { propertyId, admin: { userId: adminUserId } },
        relations: { admin: true },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      // Check duplicate name (if updating name)
      if (dto.name) {
        const existing = await this.propertyRepository.findOne({
          where: {
            name: ILike(dto.name),
            admin: { userId: adminUserId },
          },
        });

        if (existing && existing.propertyId !== propertyId) {
          throw new BadRequestException('Property name already exists');
        }
      }

      // Update property
      const updated = await this.propertyRepository.save({
        ...property,
        ...dto,
        updatedBy: adminUserId,
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  async getPropertyById(
    propertyId: UUID,
    adminUserId: UUID,
  ): Promise<Property> {
    try {
      const property = await this.propertyRepository.findOne({
        where: {
          propertyId,
          admin: { userId: adminUserId },
        },
        relations: { admin: true, outlets: true },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      return property;
    } catch (error) {
      throw error;
    }
  }

  async getAllProperties(adminUserId: UUID): Promise<Property[]> {
    try {
      return await this.propertyRepository.find({
        where: {
          admin: { userId: adminUserId },
        },
        relations: { outlets: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw error;
    }
  }
}
