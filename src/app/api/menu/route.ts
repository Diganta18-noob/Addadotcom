import { NextRequest } from 'next/server';
import { MenuService } from '../../../services/menu.service';
import { GetMenuQuerySchema, CreateMenuItemSchema } from '../../../validators/menu.validator';
import { sendSuccess, sendError, MetaPagination } from '../../../utils/apiResponse';
import { HTTP_STATUS } from '../../../constants';
import { authenticateRequest } from '../../../middlewares/auth.middleware';
import { authorizeRoles } from '../../../middlewares/rbac.middleware';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validatedQuery = GetMenuQuerySchema.parse(queryObj);
    const result = (await MenuService.getMenuItems(validatedQuery)) as { items: any[]; meta: MetaPagination };

    return sendSuccess(result.items, 'Menu items retrieved successfully', HTTP_STATUS.OK, result.meta);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError('Invalid menu query parameters', HTTP_STATUS.BAD_REQUEST, error.errors);
    }
    return sendError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = authenticateRequest(req);
    authorizeRoles(user, ['ADMIN', 'MANAGER']);

    const body = await req.json();
    const validatedInput = CreateMenuItemSchema.parse(body);

    const item = await MenuService.createMenuItem(validatedInput);

    return sendSuccess(item, 'Menu item created successfully', HTTP_STATUS.CREATED);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendError('Validation failed for menu item', HTTP_STATUS.BAD_REQUEST, error.errors);
    }
    return sendError(error);
  }
}
