import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/properties/entity/property.entity';
import { AdminUser } from 'src/users/entity/adminUser.entity';
import { Between, ILike, Repository } from 'typeorm';
import { CreateOutletDto } from './dto/add-outlet.dto';
import { Outlet } from './entity/outlet.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import { UUID } from 'crypto';
import { UpdateOutletDto } from './dto/update-outlet';
import { UpdateOutletUnitDto } from './dto/update-outlet-unit.dto';
import { OutletUnit } from './entity/outletUnit.entity';
import { AddUnitsRangeDto } from './dto/add-units.dto';

@Injectable()
export class OutletUnitsService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Outlet)
    private outletRepository: Repository<Outlet>,
    @InjectRepository(OutletUnit)
    private outletUnitRepository: Repository<OutletUnit>,
  ) {}

  async addUnitsRange(
    outletId: UUID,
    dto: AddUnitsRangeDto,
    adminUserId: UUID,
  ): Promise<OutletUnit[]> {
    try {
      const { startNumber, endNumber } = dto;

      if (startNumber > endNumber) {
        throw new BadRequestException(
          'startNumber cannot be greater than endNumber',
        );
      }

      // validate admin
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });
      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      // validate outlet ownership
      const outlet = await this.outletRepository.findOne({
        where: { outletId, property: { admin: { userId: adminUserId } } },
        relations: { property: { admin: true } },
      });
      if (!outlet) {
        throw new NotFoundException('Outlet not found');
      }

      // get existing numbers for this outlet in the requested range
      const existingUnits = await this.outletUnitRepository.find({
        where: {
          outlet: { outletId },
          number: Between(startNumber, endNumber),
        },
      });

      const existingNumbers = new Set(existingUnits.map((u) => u.number));

      const unitsToCreate: OutletUnit[] = [];

      for (let n = startNumber; n <= endNumber; n++) {
        if (!existingNumbers.has(n)) {
          const unit = this.outletUnitRepository.create({
            number: n,
            outlet,
            createdBy: adminUserId,
            updatedBy: adminUserId,
          });
          unitsToCreate.push(unit);
        }
      }

      if (unitsToCreate.length === 0) {
        return [];
      }

      const saved = await this.outletUnitRepository.save(unitsToCreate);
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async updateUnit(
    unitId: UUID,
    dto: UpdateOutletUnitDto,
    adminUserId: UUID,
  ): Promise<OutletUnit> {
    try {
      // validate admin
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });
      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      // validate unit exists and belongs to outlet owned by admin
      const unit = await this.outletUnitRepository.findOne({
        where: { unitId },
        relations: { outlet: { property: { admin: true } } },
      });
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      if (unit.outlet?.property?.admin?.userId !== adminUserId) {
        throw new ForbiddenException('Access denied');
      }

      // update fields
      if (dto.status !== undefined) {
        unit.status = dto.status;
      }
      if (dto.bookingStatus !== undefined) {
        unit.bookingStatus = dto.bookingStatus;
      }
      unit.updatedBy = adminUserId;

      const saved = await this.outletUnitRepository.save(unit);
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async getUnitById(unitId: UUID, adminUserId: UUID): Promise<OutletUnit> {
    try {
      // validate admin
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });
      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      // get unit with outlet and property relations
      const unit = await this.outletUnitRepository.findOne({
        where: { unitId },
        relations: { outlet: { property: { admin: true } } },
      });
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
      if (unit.outlet?.property?.admin?.userId !== adminUserId) {
        throw new ForbiddenException('Access denied');
      }

      return unit;
    } catch (error) {
      throw error;
    }
  }

  async getAllUnitsForOutlet(
    outletId: UUID,
    adminUserId: UUID,
  ): Promise<OutletUnit[]> {
    try {
      // validate admin
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });
      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      // validate outlet ownership
      const outlet = await this.outletRepository.findOne({
        where: { outletId, property: { admin: { userId: adminUserId } } },
        relations: { property: { admin: true } },
      });
      if (!outlet) {
        throw new NotFoundException('Outlet not found');
      }

      // get all units for the outlet
      const units = await this.outletUnitRepository.find({
        where: { outlet: { outletId } },
        relations: { outlet: true },
        order: { number: 'ASC' },
      });

      return units;
    } catch (error) {
      throw error;
    }
  }
}
