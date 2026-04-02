import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpException | QueryFailedError | EntityNotFoundError | Error,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()?.['message']
          ? exception.getResponse()?.['message']
          : exception['message']
        : exception.toString();

    let isValidationError = false;
    let validationErrors = {};

    if (Array.isArray(message)) {
      if (message[0].hasOwnProperty('validationErrors')) {
        isValidationError = true;
        validationErrors = message[0].validationErrors;
      }
    }

    console.log('validationErrors', isValidationError, message);

    if (isValidationError) {
      response.status(status).json({
        statusCode: status,
        data: {},
        validationErrors: validationErrors,
        errors: {},
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        data: {},
        validationErrors: validationErrors,
        errors: {
          message,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}

// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { Request, Response } from 'express';
// import { EntityNotFoundError, QueryFailedError } from 'typeorm';

// @Catch()
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(
//     exception: HttpException | QueryFailedError | EntityNotFoundError | Error,
//     host: ArgumentsHost,
//   ) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     let message =
//       exception instanceof HttpException
//         ? exception.getResponse()?.['message']
//           ? exception.getResponse()?.['message']
//           : exception['message']
//         : exception.toString();

//     let isValidationError = false;
//     if (Array.isArray(message)) {
//       if (message[0].isValidationError) {
//         isValidationError = true;
//         message = message.map(({ isValidationError, ...rest }) => ({
//           ...rest,
//         }));
//       }
//     }

//     response.status(status).json({
//       statusCode: status,
//       isValidationError: isValidationError,
//       message: message,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//     });
//   }
// }
