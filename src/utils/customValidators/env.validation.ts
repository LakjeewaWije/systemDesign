import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  // @IsUrl()
  // GOOGLE_SCOPE_URL: string;

  // @IsUrl()
  // FCM_URL: string;

  // @IsEmail()
  // SERVICE_ACCOUNT_EMAIL: string;

  // @IsNotEmpty()
  // SERVICE_ACCOUNT_JSON: string;

  @IsNotEmpty()
  ENV: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  APP_PORT: number;

  // @IsNotEmpty()
  // DB_DOCKER_IMAGE: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  DB_PORT: number;

  @IsNotEmpty()
  DB_HOST: string;

  @IsNotEmpty()
  DB_USERNAME: string;

  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsNotEmpty()
  DB_NAME: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  NUDENET_DOCKER_EXPOSE_PORT: number;

  @IsNotEmpty()
  NUDENET_DOCKER_IMAGE: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
