import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {PrismaClientKnownRequestError,PrismaClientValidationError,PrismaClientInitializationError} from '@prisma/client/runtime/library';
import { ZodError } from 'zod';

interface CustomError extends Error {
  statusCode?: number;
  code?: number | string;
  value?: string;
}

export const errorHandlerMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🔥 Error Middleware Called');
  console.error('➡️ Error:', err);
  console.log('➡️ Path:', req.originalUrl);
  console.log('➡️ Body:', req.body);

  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong, try again later';

  // Prisma Errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        const fields = (err.meta?.target as string[])?.join(', ') || 'field';
        message = `Duplicate value for ${fields}. Please choose another value.`;
        statusCode = StatusCodes.BAD_REQUEST;
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = StatusCodes.NOT_FOUND;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        statusCode = StatusCodes.BAD_REQUEST;
        break;
      default:
        message = `Database error: ${err.message}`;
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        break;
    }
  } else if (err instanceof PrismaClientValidationError) {
    message = 'Invalid input data';
    statusCode = StatusCodes.BAD_REQUEST;
  } else if (err instanceof PrismaClientInitializationError) {
    message = 'Database connection failed';
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }

  // Zod Validation Error
  else if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    message = 'Validation failed';
    statusCode = StatusCodes.BAD_REQUEST;
    res.status(statusCode).json({
      status: false,
      message,
      errorCode: statusCode,
      errors: details,
    });
    return;
  }

  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = StatusCodes.UNAUTHORIZED;
  } else if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired';
    statusCode = StatusCodes.UNAUTHORIZED;
  }

  res.status(statusCode).json({
    status: false,
    message,
    errorCode: statusCode,
  });
};
