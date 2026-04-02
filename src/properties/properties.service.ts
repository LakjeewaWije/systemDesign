import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from 'src/users/entity/adminUser.entity';
import { ILike, Repository } from 'typeorm';
import { AddPropertyDto } from './entity/add-property.dto';
import { UUID } from 'crypto';
import { Property } from './entity/property.entity';
import { CommonStatus } from 'src/utils/enum/commonStatus.enum';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
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

      return res;
    } catch (error) {
      throw error;
    }
  }
}
