import { NextResponse } from 'next/server';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../errors/AppError';

export interface MetaPagination {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

export interface StandardApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: MetaPagination | null;
  timestamp: string;
  errors?: any[] | null;
}

export function sendSuccess<T = any>(
  data: T,
  message: string = 'Operation completed successfully',
  statusCode: number = HTTP_STATUS.OK,
  meta?: MetaPagination | null
): NextResponse<StandardApiResponse<T>> {
  const payload: StandardApiResponse<T> = {
    success: true,
    message,
    data,
    meta: meta || null,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(payload, { status: statusCode });
}

export function sendError(
  error: Error | AppError | string | any,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: any[]
): NextResponse<StandardApiResponse<null>> {
  let message = 'An unexpected server error occurred';
  let code = statusCode;
  let errorDetails = errors;

  if (error instanceof AppError) {
    message = error.message;
    code = error.statusCode;
    errorDetails = error.errors || errorDetails;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  const payload: StandardApiResponse<null> = {
    success: false,
    message,
    data: null,
    meta: null,
    errors: errorDetails || null,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(payload, { status: code });
}
