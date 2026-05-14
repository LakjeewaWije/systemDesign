import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UUID } from 'crypto';
import parsePhoneNumber from 'libphonenumber-js';
import { SignUpUserDto } from 'src/auth/dto/signup-user.dto';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from 'src/utils/enum/role.enum';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entity/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Transactional()
  async signUpUser(
    signUpUserDto: SignUpUserDto,
    role: Role,
  ): Promise<User | null> {
    try {
      let user = await this.usersService.findUserByMobilePhoneWithRole(
        signUpUserDto.mobilePhone,
        role,
      );

      if (user)
        throw new BadRequestException(
          `User with Mobilephone ${signUpUserDto.mobilePhone} with Role : ${role} already exists!`,
        );

      const hashedPassword = await bcrypt.hash(signUpUserDto.password, 10);
      const phoneNumber = parsePhoneNumber(signUpUserDto.mobilePhone);

      //save user intially
      const signUpUserDtoNew: User = {
        ...(user ? user : {}),
        ...signUpUserDto,
        countryCode: phoneNumber?.countryCallingCode,
        password: hashedPassword,
        roles: [role],
      };

      const res = await this.usersRepository.save(signUpUserDtoNew);

      // update user with profile details
      const formatUserDtoNew: User = {
        ...res,
        createdBy: res.id,
        updatedBy: res.id,
      };

      const resUser = await this.usersRepository.save(formatUserDtoNew);

      const userRes = await this.usersRepository.findOne({
        where: { id: resUser.id },
      });

      return userRes;
    } catch (error) {
      throw error;
    }
  }

  async logInUser(logInUser: LoginUserDto, role: Role): Promise<User | null> {
    try {
      let user = await this.usersService.findUserByEmailAddressWithRole(
        logInUser.emailAddress,
        role,
      );

      if (!user)
        throw new NotFoundException(
          `User with Email ${logInUser.emailAddress} with Role : ${role} not found`,
        );

      if (!user.password)
        throw new UnauthorizedException('User password not set');

      const validPassword = await this.comparePasswords(
        logInUser.password,
        user.password,
      );

      if (!validPassword) throw new UnauthorizedException('Invalid password');

      let userRes = await this.usersRepository
        .createQueryBuilder('user')
        .where({ userId: user.userId })
        .getOne();

      return userRes;
    } catch (error) {
      throw error;
    }
  }

  // compare passwords
  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  // generate jwt token if when user logs in
  async generateJWT(
    payload: any,
    expiresIn: number | string | any,
  ): Promise<string> {
    try {
      return await this.jwtService.signAsync(payload, {
        expiresIn: expiresIn,
        issuer: 'systemdesign.com',
      });
    } catch (error) {
      throw error;
    }
  }
}
