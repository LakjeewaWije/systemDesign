import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/utils/customDecorators/roles.decorator';
import { Role } from 'src/utils/enum/role.enum';
import { RolesGuard } from 'src/utils/roles.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulesService } from './schedules.service';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Roles(Role.DOCTOR)
  @Post()
  @ApiOperation({ summary: 'Create doctor weekly schedule by day' })
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
    @Req() req: Request,
  ) {
    return await this.schedulesService.create(
      this.getAuthUserId(req),
      createScheduleDto,
    );
  }

  @Roles(Role.DOCTOR)
  @Get()
  @ApiOperation({ summary: 'Get authenticated doctor schedules' })
  async findAll(@Req() req: Request) {
    return await this.schedulesService.findAll(this.getAuthUserId(req));
  }

  @Roles(Role.DOCTOR)
  @Get('/:scheduleId')
  @ApiOperation({ summary: 'Get schedule by id' })
  async findOne(
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Req() req: Request,
  ) {
    return await this.schedulesService.findOne(
      this.getAuthUserId(req),
      scheduleId,
    );
  }

  @Roles(Role.DOCTOR)
  @Patch('/:scheduleId')
  @ApiOperation({ summary: 'Update schedule by id' })
  async update(
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: Request,
  ) {
    return await this.schedulesService.update(
      this.getAuthUserId(req),
      scheduleId,
      updateScheduleDto,
    );
  }

  @Roles(Role.DOCTOR)
  @Delete('/:scheduleId')
  @ApiOperation({ summary: 'Delete schedule by id' })
  async remove(
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Req() req: Request,
  ) {
    return await this.schedulesService.remove(
      this.getAuthUserId(req),
      scheduleId,
    );
  }

  private getAuthUserId(req: Request): string {
    return req['user'].userId;
  }
}
