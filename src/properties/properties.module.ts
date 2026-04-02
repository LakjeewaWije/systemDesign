import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { UsersModule } from 'src/users/users.module';
import { Property } from './entity/property.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Property])],
  providers: [PropertiesService],
  controllers: [PropertiesController],
})
export class PropertiesModule {}
