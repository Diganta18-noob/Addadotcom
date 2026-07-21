import { NextRequest } from 'next/server';
import { AuthService, TokenPayload } from '../services/auth.service';
import { UnauthorizedError } from '../errors/AppError';

export interface AuthenticatedNextRequest extends NextRequest {
  user?: TokenPayload;
}

export function authenticateRequest(req: NextRequest): TokenPayload {
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = req.cookies.get('accessToken')?.value || null;
  }

  if (!token) {
    throw new UnauthorizedError('Authentication token missing or invalid');
  }

  return AuthService.verifyAccessToken(token);
}
