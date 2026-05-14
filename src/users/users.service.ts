import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Any, FindManyOptions, ILike, Like, Repository } from 'typeorm';

import { User } from './entity/user.entity';
import { IntroductorySessionStatus } from './enums/introductorySessionStatus.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findUserByMobilePhoneWithRole(
    mobilePhone: string,
    role: string,
  ): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: {
        mobilePhone: mobilePhone,
        roles: ILike(`%${role}%`),
      },
    });
  }

  async findUserByEmailAddressWithRole(
    emailAddress: string,
    role: string,
  ): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: {
        emailAddress: ILike(emailAddress),
        roles: ILike(`%${role}%`),
      },
    });
  }
}
