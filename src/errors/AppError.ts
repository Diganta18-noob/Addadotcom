import { HTTP_STATUS } from '../constants';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any[];

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors?: any[], isOperational: boolean = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', errors?: any[]) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden: Insufficient permissions') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Requested resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: any[]) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}
