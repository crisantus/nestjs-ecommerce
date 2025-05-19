// import { NextFunction, Request, Response } from "express";

// export const AsyncErrorHandler = (method: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     method(req, res, next).catch((error) => {
//       next(error);
//     });
//   };
// };

import { NextFunction, Request, Response } from "express";

export const AsyncErrorHandler = (
  method: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await method(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
