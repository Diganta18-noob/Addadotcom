import { TokenPayload } from '../services/auth.service';
import { ForbiddenError } from '../errors/AppError';
import { Role } from '../constants';

export function authorizeRoles(user: TokenPayload | undefined, allowedRoles: Role[]) {
  if (!user) {
    throw new ForbiddenError('User authentication payload not found');
  }

  const userRole = user.role.toUpperCase() as Role;
  const isAllowed = allowedRoles.includes(userRole);

  if (!isAllowed) {
    throw new ForbiddenError(`Role '${user.role}' is not authorized to perform this operation`);
  }
}
