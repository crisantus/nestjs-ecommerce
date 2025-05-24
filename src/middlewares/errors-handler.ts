import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError
} from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { AxiosError } from 'axios';

interface CustomError extends Error {
  statusCode?: number;
  code?: number | string;
  value?: string;
  response?: any;
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

  // 🟡 Prisma Errors
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

  // 🟠 Zod Validation
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

  // 🔴 JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = StatusCodes.UNAUTHORIZED;
  } else if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired';
    statusCode = StatusCodes.UNAUTHORIZED;
  }

  // 🟢 Axios (Flutterwave, Paystack) Error
  else if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError<any>;
    const provider = req.originalUrl.includes("flutterwave") ? "Flutterwave" : "Paystack";

    if (axiosErr.response) {
      const errData = axiosErr.response.data;

      // Flutterwave & Paystack specific shape handling
      const apiMessage =
        errData?.message || errData?.data?.message || errData?.statusMessage || "Unknown payment error";

      message = `[${provider}] ${apiMessage}`;
      statusCode = axiosErr.response.status || StatusCodes.BAD_REQUEST;

      res.status(statusCode).json({
        status: false,
        message,
        errorCode: statusCode,
        provider,
        raw: errData,
      });
    } else {
      message = `[${provider}] No response from payment provider`;
      statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    }
  }

  // 🔚 Default Error Response
  res.status(statusCode).json({
    status: false,
    message,
    errorCode: statusCode,
  });
};
