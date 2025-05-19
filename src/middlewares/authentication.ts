import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { validateAccessToken } from '../utils/jwt';
import * as CustomError from '../errors';
import { prismaClient } from '..';



// Extend Express's Request interface
export interface AuthenticatedRequest extends Request {
  user?: any; // you can replace 'any' with your User model type
}

// Middleware: Authenticate User
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {

  let token: string | undefined;

  // Step 1: Get token from header or cookies
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log(token)
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Step 2: If no token, throw
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication is invalid ');
  }

  try {
    // Step 3: Validate the token
    const decoded = validateAccessToken(token) as JwtPayload;
    //console.log(decoded)

    const tokenUser = decoded.payload.tokenUser as any;
    // Step 4: Fetch user from database
    const user = await prismaClient.user.findUnique({
      where: { id: tokenUser.userId },
    });
    if (!user) {
      throw new CustomError.UnauthenticatedError('User not found');
    }
    // Step 5: Attach the user object to the request
    req.user = user;
    // Step 6: Continue
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    throw new CustomError.UnauthenticatedError('Authentication failed');
  }
};
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export const authorizePermissions = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new CustomError.UnauthenticatedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

// Middleware: Authorize Roles
// export const authorizePermissions = (...roles: string[]) => {
//   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       throw new CustomError.UnauthenticatedError(
//         'Unauthorized to access this route'
//       );
//     }
//     next();
//   };
// };
