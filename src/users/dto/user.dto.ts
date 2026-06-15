import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsArray, IsDateString, IsNumber, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { EntityStatus } from '../../dto/entity-status.dto';
import type { MetadataInfo } from '../../dto/metadata-info.dto';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_-]+$/)
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+?[1-9]\d{1,14}$/)
    phone?: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    roles: string[];

    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @IsNotEmpty()
    createdBy: MetadataInfo;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_-]+$/)
    username?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MinLength(8)
    password?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    firstName?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    lastName?: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+?[1-9]\d{1,14}$/)
    phone?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    roles?: string[];

    @IsBoolean()
    @IsOptional()
    isEmailVerified?: boolean;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;
}

export class UserQueryDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;

    @IsOptional()
    @IsBoolean()
    isBlocked?: boolean;

    @IsOptional()
    @IsNumber()
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    limit?: number = 10;
}

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    usernameOrEmail: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class VerifyEmailDto {
    @IsString()
    @IsNotEmpty()
    code: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string;
}

export class BlockUserDto {
    @IsBoolean()
    @IsNotEmpty()
    isBlocked: boolean;

    @IsDateString()
    @IsOptional()
    blockedUntil?: Date;

    @IsString()
    @IsOptional()
    blockReason?: string;

    @IsNotEmpty()
    blockedBy: MetadataInfo;
}

export class RestoreDto {
    @IsNotEmpty()
    restoredBy: MetadataInfo;
}
