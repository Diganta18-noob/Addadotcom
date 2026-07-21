import { NextRequest } from 'next/server';
import { AuthService } from '../../../../services/auth.service';
import { sendSuccess, sendError } from '../../../../utils/apiResponse';
import { HTTP_STATUS } from '../../../../constants';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return sendError('Refresh token missing', HTTP_STATUS.UNAUTHORIZED);
    }

    const tokens = await AuthService.refreshAccessToken(refreshToken);

    const response = sendSuccess(tokens, 'Token refreshed successfully', HTTP_STATUS.OK);

    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return sendError(error);
  }
}
