import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import * as rfs from 'rotating-file-stream';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuditLogInterceptor } from './audits/auditLog.interceptor';
// import { AuditsModule } from './audits/audits.module';
import configuration from './config/configuration';
import { validate } from './utils/customValidators/env.validation';
import { HttpExceptionFilter } from './utils/http-exception.filter';
import { SuccessResponseFilter } from './utils/success-response.filter';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { OutletsModule } from './outlets/outlets.module';
import { MenuitemModule } from './menuitems/menuitem.module';
import { QrModule } from './qr/qr.module';

const logDirectory = 'logs';
const stream = rfs.createStream('application-file.log', {
  interval: '1d', // Rotate daily
  path: logDirectory,
  size: '20M', // Maximum file size
  compress: 'gzip', // Optional: compress rotated files
});

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: ['.env'],
      validate,
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('db.host'),
        port: +configService.get('db.port'),
        username: configService.get('db.username'),
        password: configService.get('db.password'),
        database: configService.get('db.database'),
        autoLoadEntities: true,
        subscribers: [],
        synchronize: true,
        extra: {
          timezone: 'UTC',
        },
      }),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          ttl: 86400000, //3600000 in ms
        }),
      }),
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          pinoHttp: {
            customProps: (req, res) => ({
              context: 'HTTP',
            }),
            transport:
              configService.get('app.env') === 'dev-local'
                ? {
                    target: 'pino-pretty',
                    options: {
                      singleLine: true,
                      translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
                      ignore: 'hostname,req,res',
                      levelLabel: true,
                      messageFormat:
                        '{levelLabel} - {pid} - method: [{req.method}] - url: {req.url} - ip: {req.remoteAddress}',
                    },
                  }
                : undefined,
            customLevels: {
              info: 'INFO', // Map the "info" level to "INFO"
            },
            formatters: {
              level(label) {
                return { level: label.toUpperCase() }; // Convert the log level to uppercase
              },
            },
            timestamp: () => `,"time":"${new Date().toLocaleString()}"`, // Add the UTC timestamp
            redact: ['req.headers', 'res.headers'], // Optional: redact sensitive data
            // Use the rotating write stream as the log destination
            stream,
          },
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../public'), // Specify the directory where your static files are located
      serveRoot: '/', // Specify the URL root path to serve the static files
    }),
    NestScheduleModule.forRoot(),
    UsersModule,
    PropertiesModule,
    OutletsModule,
    MenuitemModule,
    QrModule,
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AuditLogInterceptor,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
