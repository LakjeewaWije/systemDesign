import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/properties/entity/property.entity';
import { AdminUser } from 'src/users/entity/adminUser.entity';
import { Repository } from 'typeorm';
import { In } from 'typeorm';
import { CreateMenuitemDto } from './dto/create-menuitem.dto';
import { Menuitem } from './entity/menuitem.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';
import type { UUID } from 'crypto';
import { UpdateMenuitemDto } from './dto/update-menuitem.dto';
import { Outlet } from 'src/outlets/entity/outlet.entity';

@Injectable()
export class MenuitemService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Outlet)
    private outletRepository: Repository<Outlet>,
    @InjectRepository(Menuitem)
    private menuitemRepository: Repository<Menuitem>,
  ) {}

  async createMenuitem(
    dto: CreateMenuitemDto,
    adminUserId: UUID,
  ): Promise<Menuitem> {
    try {
      // validate admin
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });
      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      // validate outlets
      const outlets = await this.outletRepository.find({
        where: {
          outletId: In(dto.outletIds),
          property: { admin: { userId: adminUserId } },
        },
        relations: { property: { admin: true } },
      });
      if (outlets.length !== dto.outletIds.length) {
        throw new BadRequestException(
          'Some outlets not found or not owned by admin',
        );
      }

      // create menuitem
      const menuitem = this.menuitemRepository.create({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        outlets,
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });

      const saved = await this.menuitemRepository.save(menuitem);
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async updateMenuitem(
    menuitemId: UUID,
    dto: UpdateMenuitemDto,
    adminUserId: UUID,
  ): Promise<Menuitem> {
    try {
      // validate admin
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });
      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      // validate menuitem exists and belongs to admin
      const menuitem = await this.menuitemRepository.findOne({
        where: { menuitemId },
        relations: { outlets: { property: { admin: true } } },
      });
      if (!menuitem) {
        throw new NotFoundException('Menuitem not found');
      }
      // check if any outlet belongs to admin
      const ownedOutlets = menuitem.outlets?.filter(
        (outlet) => outlet.property?.admin?.userId === adminUserId,
      );
      if (!ownedOutlets || ownedOutlets.length === 0) {
        throw new ForbiddenException('Access denied');
      }

      // update fields
      if (dto.name !== undefined) menuitem.name = dto.name;
      if (dto.description !== undefined) menuitem.description = dto.description;
      if (dto.price !== undefined) menuitem.price = dto.price;
      if (dto.status !== undefined) menuitem.status = dto.status;
      if (dto.outletIds !== undefined) {
        // validate new outlets
        const outlets = await this.outletRepository.find({
          where: {
            outletId: In(dto.outletIds),
            property: { admin: { userId: adminUserId } },
          },
          relations: { property: { admin: true } },
        });
        if (outlets.length !== dto.outletIds.length) {
          throw new BadRequestException(
            'Some outlets not found or not owned by admin',
          );
        }
        menuitem.outlets = outlets;
      }
      menuitem.updatedBy = adminUserId;

      const saved = await this.menuitemRepository.save(menuitem);
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async getAllMenuitems(adminUserId: UUID): Promise<Menuitem[]> {
    try {
      // validate admin
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });
      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      const menuitems = await this.menuitemRepository.find({
        where: {
          outlets: { property: { admin: { userId: adminUserId } } },
        },
        relations: { outlets: { property: true } },
      });

      return menuitems;
    } catch (error) {
      throw error;
    }
  }

  async getMenuitemById(
    menuitemId: UUID,
    adminUserId: UUID,
  ): Promise<Menuitem> {
    try {
      // validate admin
      const admin = await this.adminUserRepository.findOne({
        where: { userId: adminUserId, status: CommonStatus.ACTIVE },
      });
      if (!admin) {
        throw new ForbiddenException('Admin is not active or not found');
      }

      const menuitem = await this.menuitemRepository.findOne({
        where: { menuitemId },
        relations: { outlets: { property: { admin: true } } },
      });
      if (!menuitem) {
        throw new NotFoundException('Menuitem not found');
      }
      // check ownership
      const ownedOutlets = menuitem.outlets?.filter(
        (outlet) => outlet.property?.admin?.userId === adminUserId,
      );
      if (!ownedOutlets || ownedOutlets.length === 0) {
        throw new ForbiddenException('Access denied');
      }

      return menuitem;
    } catch (error) {
      throw error;
    }
  }
}
