import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[Error Log]: ${err.stack || err.message}`);

  // Handled application-specific errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      },
    });
    return;
  }

  // Mongoose Cast Error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid ID format',
        code: 'CAST_ERROR',
        statusCode: 400,
      },
    });
    return;
  }

  // Mongoose Duplicate Key Error (e.g. email already exists)
  interface MongoDuplicateKeyError extends Error {
    code?: number;
    keyValue?: Record<string, unknown>;
  }

  const mongoErr = err as MongoDuplicateKeyError;
  if (mongoErr.code === 11000) {
    const fields = Object.keys(mongoErr.keyValue || {});
    res.status(400).json({
      success: false,
      error: {
        message: `Duplicate field value: ${fields.join(', ')}. Please use another value.`,
        code: 'DUPLICATE_KEY_ERROR',
        statusCode: 400,
      },
    });
    return;
  }

  // JWT Token errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid authorization token',
        code: 'INVALID_TOKEN',
        statusCode: 401,
      },
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Authorization token has expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
      },
    });
    return;
  }

  // Unhandled internal server errors
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    },
  });
};
export default errorHandler;
