import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/properties/entity/property.entity';
import { AdminUser } from 'src/users/entity/adminUser.entity';
import { ILike, Repository } from 'typeorm';
import { CreateOutletDto } from './dto/add-outlet.dto';
import { Outlet } from './entity/outlet.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { UUID } from 'crypto';
import { UpdateOutletDto } from './dto/update-outlet';

@Injectable()
export class OutletsService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Outlet)
    private outletRepository: Repository<Outlet>,
  ) {}

  async createOutlet(
    propertyId: UUID,
    dto: CreateOutletDto,
    adminUserId: UUID,
  ): Promise<Outlet> {
    try {
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });

      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      const property = await this.propertyRepository.findOne({
        where: { propertyId, admin: { userId: adminUserId } },
        relations: { admin: true },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      const existing = await this.outletRepository.findOne({
        where: {
          name: ILike(dto.name),
          property: { propertyId },
        },
      });

      if (existing) {
        throw new BadRequestException('Outlet name already exists');
      }

      return await this.outletRepository.save({
        ...dto,
        property,
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateOutlet(
    outletId: UUID,
    dto: UpdateOutletDto,
    adminUserId: UUID,
  ): Promise<Outlet> {
    try {
      // Validate admin is active
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });

      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      // Validate outlet belongs to a property owned by this admin
      const outlet = await this.outletRepository.findOne({
        where: {
          outletId,
          property: { admin: { userId: adminUserId } },
        },
        relations: {
          property: { admin: true },
        },
      });

      if (!outlet) {
        throw new NotFoundException('Outlet not found');
      }

      // Check duplicate name (if updating name)
      if (dto.name && outlet.property) {
        const existing = await this.outletRepository.findOne({
          where: {
            name: ILike(dto.name),
            property: { propertyId: outlet.property.propertyId },
          },
        });

        if (existing && existing.outletId !== outletId) {
          throw new BadRequestException('Outlet name already exists');
        }
      }

      // Update outlet
      const updated = await this.outletRepository.save({
        ...outlet,
        ...dto,
        updatedBy: adminUserId,
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  async getOutletById(outletId: UUID, adminUserId: UUID): Promise<Outlet> {
    try {
      const outlet = await this.outletRepository.findOne({
        where: {
          outletId,
          property: { admin: { userId: adminUserId } },
        },
        relations: {
          property: { admin: true },
        },
      });

      if (!outlet) {
        throw new NotFoundException('Outlet not found');
      }

      return outlet;
    } catch (error) {
      throw error;
    }
  }

  async getAllOutlets(adminUserId: UUID): Promise<Outlet[]> {
    try {
      return await this.outletRepository.find({
        where: {
          property: { admin: { userId: adminUserId } },
        },
        order: { createdAt: 'DESC' },
        relations: {
          property: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
