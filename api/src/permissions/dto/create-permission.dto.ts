import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PermissionCategory, PermissionScope, HttpMethod } from '../schemas/permission.schema';
import { PERMISSION_ACTIONS, PermissionOperation } from '../../dto/permission-operation.dto';

export class CreatePermissionDto {
    @ApiProperty({
        example: 'users:delete',
        description: 'Unique permission identifier (lowercase, colon-separated)',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @Matches(/^[a-z0-9:_.*-]+$/, {
        message: "Permission nomi faqat kichik harf, raqam, :, _, -, . va * bo'lishi mumkin",
    })
    name: string;

    @ApiProperty({ example: 'users', description: 'Resource name (lowercase)' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    @Matches(/^[a-z0-9_*-]+$/, {
        message: "Resource nomi faqat kichik harf, raqam, _, - va * bo'lishi mumkin",
    })
    resource: string;

    @ApiProperty({
        enum: PERMISSION_ACTIONS,
        example: PermissionOperation.DELETE,
        description: 'Action type',
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(PERMISSION_ACTIONS, {
        message: `Action quyidagilardan biri bo'lishi kerak: ${PERMISSION_ACTIONS.join(', ')}`,
    })
    action: string;

    @ApiPropertyOptional({ example: 'Allows deleting user accounts' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        enum: PermissionCategory,
        default: PermissionCategory.CUSTOM,
    })
    @IsOptional()
    @IsEnum(PermissionCategory, {
        message: `Category quyidagilardan biri bo'lishi kerak: ${Object.values(PermissionCategory).join(', ')}`,
    })
    category?: PermissionCategory;

    @ApiPropertyOptional({
        enum: PermissionScope,
        default: PermissionScope.BOTH,
    })
    @IsOptional()
    @IsEnum(PermissionScope, {
        message: `Scope quyidagilardan biri bo'lishi kerak: ${Object.values(PermissionScope).join(', ')}`,
    })
    scope?: PermissionScope;

    @ApiPropertyOptional({
        example: '/api/users',
        description: 'API endpoint path (must start with /api/)',
    })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    @Matches(/^\/api\/[a-z0-9/_:-]*$/, {
        message: "API path '/api/' bilan boshlanishi va faqat kichik harf, raqam, /, _, - bo'lishi kerak",
    })
    apiPath?: string;

    @ApiPropertyOptional({
        enum: HttpMethod,
        default: HttpMethod.GET,
    })
    @IsOptional()
    @IsEnum(HttpMethod)
    method?: HttpMethod;

    @ApiPropertyOptional({
        example: '/dashboard/users',
        description: 'Frontend route path',
    })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    @Matches(/^\/[a-z0-9/_-]*$/, {
        message: "Frontend path '/' bilan boshlanishi kerak",
    })
    frontendPath?: string;

    @ApiPropertyOptional({
        example: 'btn:users:delete',
        description: 'UI element key for frontend access control',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Matches(/^[a-z0-9:_-]+$/, {
        message: "uiKey faqat kichik harf, raqam, :, _, - bo'lishi mumkin",
    })
    uiKey?: string;

    @ApiPropertyOptional({
        default: false,
        description: 'Once set to true, cannot be reverted. System permissions are protected from deletion.',
    })
    @IsOptional()
    @IsBoolean()
    isSystemPermission?: boolean;
}
