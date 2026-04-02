import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // register swagger api
  const config = new DocumentBuilder()
    .setTitle('Menu Plus')
    .setDescription('The Menu Plus API description')
    .setVersion('1.0')
    .addTag('#Menu Plus')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const flattenErrors = (errors) => {
          return errors.reduce((result, error) => {
            const children = error.children || []; // Use default empty array for children

            if (!children.length) {
              // No children, extract message from constraints
              result[error.property] = error.constraints
                ? error.constraints[Object.keys(error.constraints)[0]]
                : `${error.property} validation error`;
            } else {
              // Has children, recursively flatten and merge
              result = { ...result, ...flattenErrors(children) };
            }

            return result;
          }, {});
        };

        const flatErrors = flattenErrors(errors);

        const newResult = {
          validationErrors: flatErrors,
        };

        return new BadRequestException([newResult]);
      },
      stopAtFirstError: true,
      transform: true,
    }),
  );

  // for serializer to exclude unwanted entity fields when returning the response
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // register pino logger
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.enableCors();

  const configService = app.get(ConfigService);
  const port: any = configService.get<number>('app.port');
  console.log('App running on port ', port);
  await app.listen(port);
}
bootstrap();
