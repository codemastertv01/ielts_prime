// decorators/require-permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'required_permissions';

/**
 * Mark a controller or route handler with required permission keys.
 * Format: 'resource:action', e.g. 'permissions:delete', 'users:manage'
 *
 * Usage:
 *   @RequirePermissions('permissions:read')
 *   @RequirePermissions('permissions:read', 'users:manage')  // ANY one is enough
 */
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
