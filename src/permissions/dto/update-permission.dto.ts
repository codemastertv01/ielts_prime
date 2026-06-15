import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';

/**
 * All fields from CreatePermissionDto become optional.
 * No additional fields needed — PartialType handles everything.
 * isSystemPermission: once true, cannot be set back to false (enforced in service).
 */
export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
