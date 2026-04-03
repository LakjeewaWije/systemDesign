import { Module } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from 'src/properties/entity/property.entity';
import { Outlet } from 'src/outlets/entity/outlet.entity';
import { PropertyQr } from './entities/propertyQr.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Property, Outlet, PropertyQr]),
  ],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
