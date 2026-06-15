import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength} from 'class-validator';
import { RoleType } from '../schemas/role.schema';

export class CreateRoleDto {
    @ApiProperty({
        example: 'content-moderator',
        description: "Role nomi — harf, raqam, _, - va bo'sh joy",
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    @Matches(/^[a-zA-Z0-9_\s-]+$/, {
        message: "Role nomi faqat harf, raqam, _, - va bo'sh joy bo'lishi mumkin",
    })
    name: string;

    @ApiPropertyOptional({ example: 'Manages content moderation tasks' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        type: [String],
        example: ['64f1a2b3c4d5e6f7a8b9c0d1'],
        description: 'Permission ObjectId-lar ro\'yxati',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];

    @ApiPropertyOptional({
        default: false,
        description: 'Once true, name is locked and cannot be deleted.',
    })
    @IsOptional()
    @IsBoolean()
    isSystemRole?: boolean;

    @ApiPropertyOptional({ enum: RoleType, default: RoleType.CUSTOM })
    @IsOptional()
    @IsEnum(RoleType, {
        message: `Type quyidagilardan biri bo'lishi kerak: ${Object.values(RoleType).join(', ')}`,
    })
    type?: RoleType;

    @ApiPropertyOptional({ example: 10, minimum: 0, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    priority?: number;
}
