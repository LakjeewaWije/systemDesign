import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from './entity/adminUser.entity';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('app.secret'),
        signOptions: { expiresIn: 2592000 },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
})
export class UsersModule {}
