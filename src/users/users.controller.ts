import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/utils/customDecorators/roles.decorator';
import { UsersService } from './users.service';
import { UserQueryDto } from './dto/query/get-user.dto';
import { RolesGuard } from 'src/utils/roles.guard';
import { Role } from 'src/utils/enum/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get all Users - Doctor and Patient',
    description: 'Get all users',
  })
  // @Public()
  @Roles(Role.DOCTOR, Role.PATIENT)
  @Get('/get/all')
  async getAll() {
    var res = await this.usersService.getAllUsers();
    return res;
  }
}
