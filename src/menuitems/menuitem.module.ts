import { Module } from '@nestjs/common';
import { MenuitemController } from './menuitem.controller';
import { MenuitemService } from './menuitem.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from 'src/properties/entity/property.entity';
import { Outlet } from 'src/outlets/entity/outlet.entity';
import { AdminUser } from 'src/users/entity/adminUser.entity';
import { Menuitem } from './entity/menuitem.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Property, Outlet, AdminUser, Menuitem]),
  ],
  controllers: [MenuitemController],
  providers: [MenuitemService],
})
export class MenuitemModule {}
