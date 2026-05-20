import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserPayload, Role } from '../types/index.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is missing or invalid', 'TOKEN_MISSING');
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_please_change_in_production';
    const decoded = jwt.verify(token, secret) as UserPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Invalid authorization token', 'TOKEN_INVALID');
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication required', 'AUTH_REQUIRED');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        'You do not have permission to access this resource',
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
};
export default authenticate;
