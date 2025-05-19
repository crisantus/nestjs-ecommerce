
import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  console.warn(`⚠️ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: false,
    message: 'Route does not exist',
  });
};
