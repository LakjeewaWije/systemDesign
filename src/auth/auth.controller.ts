import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Param,
  ParseEnumPipe,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SignUpUserDto } from 'src/auth/dto/signup-user.dto';
import { Public } from 'src/utils/customDecorators/publicRequest.decorator';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from 'src/utils/enum/role.enum';
import { User } from 'src/users/entity/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('auth')
@Controller('auth')
// @UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * singup doctor
   * @param signUpUserDto
   * @param res
   */
  @Public()
  @Post('/doctor/signup')
  async signUpDoctor(
    @Body() signUpUserDto: SignUpUserDto,
    @Req() req: Request,
  ) {
    var res = await this.authService.signUpUser(signUpUserDto, Role.DOCTOR);

    if (!res) {
      throw new BadRequestException(`SignUp failed!, Please try again`);
    }

    return { user: res };
  }

  /**
   * singup patient
   * @param signUpUserDto
   * @param res
   */
  @Public()
  @Post('/patient/signup')
  async signUpPatient(
    @Body() signUpUserDto: SignUpUserDto,
    @Req() req: Request,
  ) {
    var res = await this.authService.signUpUser(signUpUserDto, Role.PATIENT);

    return { user: res };
  }

  /**
   * login patient
   * @param logInUser
   * @param res
   */
  @Public()
  @Post('/patient/login')
  async logInPatient(@Body() logInUser: LoginUserDto, @Req() req: Request) {
    let user: User | null = await this.authService.logInUser(
      logInUser,
      Role.PATIENT,
    );

    if (!user) {
      throw new BadRequestException(`Invalid credentials!`);
    }

    let tokenPayload: any = {
      userId: user.userId,
      roles: user.roles,
      firstName: user.firstName,
      emailAddress: user.emailAddress,
      mobilePhone: user.mobilePhone,
    };

    const jwtToken = await this.authService.generateJWT(tokenPayload, '7d');

    const res = {
      user: user,
      accessToken: jwtToken,
    };

    return res;
  }

  /**
   * login doctor
   * @param logInUser
   * @param res
   */
  @Public()
  @Post('/doctor/login')
  async logInDoctor(@Body() logInUser: LoginUserDto, @Req() req: Request) {
    var user: User | null = await this.authService.logInUser(
      logInUser,
      Role.DOCTOR,
    );

    if (!user) {
      throw new BadRequestException(`Invalid credentials!`);
    }

    var tokenPayload: any = {
      userId: user.userId,
      roles: user.roles,
      firstName: user.firstName,
      emailAddress: user.emailAddress,
      mobilePhone: user.mobilePhone,
    };

    const jwtToken = await this.authService.generateJWT(tokenPayload, '7d');

    const res = {
      user: user,
      accessToken: jwtToken,
    };

    return res;
  }
}
