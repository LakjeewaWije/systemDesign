import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/utils/customDecorators/publicRequest.decorator';
import { USERS_ROUTES } from 'src/utils/controller-route-prefix.constants';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UsersService } from './users.service';

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
}
