import { Module } from '@nestjs/common';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from 'src/properties/entity/property.entity';
import { Outlet } from './entity/outlet.entity';
import { AdminUser } from 'src/users/entity/adminUser.entity';
import { OutletUnitsService } from './outletUnits.service';
import { OutletUnit } from './entity/outletUnit.entity';
import { OutletUnitsController } from './outletUnits.controller';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Property, Outlet, AdminUser, OutletUnit]),
  ],
  controllers: [OutletsController, OutletUnitsController],
  providers: [OutletsService, OutletUnitsService],
})
export class OutletsModule {}
