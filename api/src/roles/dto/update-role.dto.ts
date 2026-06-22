import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

/**
 * All fields from CreateRoleDto become optional.
 * isSystemRole: once true, cannot be set back to false (enforced in service).
 * name: locked for system roles (enforced in service).
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
