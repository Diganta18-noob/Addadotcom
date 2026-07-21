import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../services/auth.service';
import { LoginSchema } from '../../../../validators/auth.validator';
import { sendSuccess, sendError } from '../../../../utils/apiResponse';
import { HTTP_STATUS } from '../../../../constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = LoginSchema.parse(body);

    const result = await AuthService.login(validatedInput);

    const response = sendSuccess(result, 'Login successful', HTTP_STATUS.OK);

    // Set Refresh Token in Secure HttpOnly Cookie
    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    response.cookies.set('accessToken', result.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError('Validation error', HTTP_STATUS.BAD_REQUEST, error.errors);
    }
    return sendError(error);
  }
}
