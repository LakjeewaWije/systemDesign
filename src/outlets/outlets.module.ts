import { Module } from '@nestjs/common';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from 'src/properties/entity/property.entity';
import { Outlet } from './entity/outlet.entity';
import { AdminUser } from 'src/users/entity/adminUser.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Property, Outlet, AdminUser]),
  ],
  controllers: [OutletsController],
  providers: [OutletsService],
})
export class OutletsModule {}
