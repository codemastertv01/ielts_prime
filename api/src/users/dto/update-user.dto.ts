import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

/**
 * General profile update — does NOT include username/email/phone/password.
 * Those fields have a 14-day cooldown and are handled by dedicated DTOs.
 */
export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    firstName?: string;

    @ApiPropertyOptional({ example: 'Doe' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    lastName?: string;

    @ApiPropertyOptional({ type: [String], example: ['64f1a2b3c4d5e6f7a8b9c0d1'] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    roles?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;

    @ApiPropertyOptional({ example: 'Full-stack developer.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    @IsOptional()
    @IsUrl({}, { message: "Avatar URL formati noto'g'ri" })
    avatarUrl?: string;
}
