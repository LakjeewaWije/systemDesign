import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/utils/customDecorators/publicRequest.decorator';
import { USERS_ROUTES } from 'src/utils/controller-route-prefix.constants';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UsersService } from './users.service';
import { SignInUserDto } from './dto/signin-user.dto';
import { Right } from 'src/utils/enum/right.enum';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({
    summary: 'Signup User',
    description: 'Signup as admin user',
  })
  @Public()
  @Post(`${USERS_ROUTES.ADMIN}/signup`)
  async signupUser(@Body() dto: SignUpUserDto, @Req() req: Request) {
    const res = await this.usersService.signupAdminUser(dto);

    return { user: res };
  }

  @ApiOperation({
    summary: 'Signin User',
    description: 'Signin as admin user',
  })
  @Public()
  @Post(`${USERS_ROUTES.ADMIN}/signin`)
  async signinUser(@Body() dto: SignInUserDto, @Req() req: Request) {
    var resUser = await this.usersService.signinAdminUser(dto);

    var tokenPayload: any = {
      userId: resUser.userId,
      firstName: resUser.firstName,
      mobilePhone: resUser.emailAddress,
      rights: [],
    };

    // Loop through the enum values and add them to the 'rights' array
    for (const right in Right) {
      if (right.includes('SUPER_ADMIN')) tokenPayload.rights.push(Right[right]);
    }

    const jwtToken = await this.authService.generateJWT(tokenPayload, '7d');

    const jwtRefreshToken = await this.authService.generateJWT(
      { ...tokenPayload, type: 'refresh' },
      '7d',
    );

    const res = {
      user: resUser,
      rights: tokenPayload.rights,
      accessToken: jwtToken,
      refreshToken: jwtRefreshToken,
    };

    return { user: res };
  }
}
