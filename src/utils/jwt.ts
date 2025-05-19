import jwt, { JwtPayload } from 'jsonwebtoken';
import * as CustomError from '../errors';
import { JWT_SECRET } from '../secrets';

// Interface representing the user data to embed in the token
interface TokenUser {
  email: string;
  userId: number;
  role: string;
}

// Interface for the payload structure in the access token
interface AccessTokenPayload {
  tokenUser: TokenUser;
}

// Interface representing the full decoded access token structure
interface DecodedAccessToken extends JwtPayload {
  payload: AccessTokenPayload;
}

// Function to create an access token using user details
// - Accepts a TokenUser object
// - Returns a JWT string signed with a secret and valid for 14 minutes
export function createAccessToken(tokenUser: TokenUser): string {
  return jwt.sign(
    { payload: { tokenUser } },
    JWT_SECRET as string,
    { expiresIn: '60d' }
  );
}

// Function to validate and decode a given access token
// - Accepts a token string
// - Returns the decoded token if valid, else throws appropriate errors
export function validateAccessToken(token: string): DecodedAccessToken {
  try {
    return jwt.verify(
      token,
      JWT_SECRET as string
    ) as DecodedAccessToken;
  } catch (error: unknown) {
    // If token is malformed or signature fails
    if (error instanceof jwt.JsonWebTokenError) {
      throw new CustomError.UnauthenticatedError('Invalid AccessToken Fake');
    }
    // If token is expired
    else if (error instanceof jwt.TokenExpiredError) {
      throw new CustomError.UnauthenticatedError('Your AccessToken has expired! Please login again.');
    }
    // Catch-all for any other JWT-related error
    else {
      throw new CustomError.UnauthenticatedError('Unauthorized');
    }
  }
}

