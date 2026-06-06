import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  validateSync,
} from 'class-validator';

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
  ENV!: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  APP_PORT!: number;

  // @IsNotEmpty()
  // DB_DOCKER_IMAGE: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  DB_PORT!: number;

  @IsNotEmpty()
  DB_HOST!: string;

  @IsNotEmpty()
  DB_USERNAME!: string;

  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsNotEmpty()
  DB_NAME!: string;

  @IsOptional()
  REDIS_HOST?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  REDIS_PORT?: number;

  @IsOptional()
  STRIPE_SECRET_KEY?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  BOOKING_PAYMENT_AMOUNT_CENTS?: number;

  @IsOptional()
  BOOKING_PAYMENT_CURRENCY?: string;
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
