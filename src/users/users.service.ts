import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from './entity/adminUser.entity';
import { Repository } from 'typeorm';
import { SignUpUserDto } from './dto/signup-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
  ) {}

  // signup admin user
  async signupAdminUser(dto: SignUpUserDto): Promise<AdminUser> {
    try {
      const getUser = await this.adminUserRepository.findOne({
        where: {
          emailAddress: dto.emailAddress,
        },
      });

      if (getUser) throw new BadRequestException('Admin User Already Exists');

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const signupUserDao: AdminUser = {
        firstName: dto.firstName,
        lastName: dto.lastName,
        emailAddress: dto.emailAddress,
        password: hashedPassword,
      };

      const resAddUserDao = await this.adminUserRepository.save(signupUserDao);

      signupUserDao.createdBy = resAddUserDao.userId;
      signupUserDao.updatedBy = resAddUserDao.userId;

      const resUpdateUserDao =
        await this.adminUserRepository.save(signupUserDao);

      const res = await this.adminUserRepository.findOne({
        where: {
          id: resUpdateUserDao.id,
        },
      });

      if (!res) throw new BadRequestException('Created admin user not found');

      return res;
    } catch (error) {
      throw error;
    }
  }
}
