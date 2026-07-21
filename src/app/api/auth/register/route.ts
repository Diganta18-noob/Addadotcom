import { NextRequest } from 'next/server';
import { AuthService } from '../../../../services/auth.service';
import { RegisterSchema } from '../../../../validators/auth.validator';
import { sendSuccess, sendError } from '../../../../utils/apiResponse';
import { HTTP_STATUS } from '../../../../constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = RegisterSchema.parse(body);

    const result = await AuthService.register(validatedInput);

    return sendSuccess(result, 'Registration successful', HTTP_STATUS.CREATED);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError('Validation error', HTTP_STATUS.BAD_REQUEST, error.errors);
    }
    return sendError(error);
  }
}
