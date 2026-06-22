import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * All sensitive-field DTOs require the current password for confirmation.
 * Each field enforces a 14-day cooldown (checked in service).
 */

// ── Change username ────────────────────────────────────────────────────────────

export class ChangeUsernameDto {
    @ApiProperty({ example: 'new_username' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: "Username faqat harf, raqam, _ va - bo'lishi mumkin",
    })
    newUsername: string;

    @ApiProperty({ description: 'Joriy parol tasdiqlash uchun' })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;
}

// ── Change email ───────────────────────────────────────────────────────────────

export class ChangeEmailDto {
    @ApiProperty({ example: 'new@example.com' })
    @IsEmail({}, { message: "Email formati noto'g'ri" })
    @IsNotEmpty()
    newEmail: string;

    @ApiProperty({ description: 'Joriy parol tasdiqlash uchun' })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;
}

// ── Change phone ───────────────────────────────────────────────────────────────

export class ChangePhoneDto {
    @ApiProperty({ example: '+998901234567' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: "Telefon raqami noto'g'ri formatda" })
    newPhone: string;

    @ApiProperty({ description: 'Joriy parol tasdiqlash uchun' })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;
}

// ── Change password ────────────────────────────────────────────────────────────

export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({ minLength: 8 })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: "Yangi parol kamida 1 katta harf, 1 kichik harf va 1 raqam bo'lishi kerak",
    })
    newPassword: string;

    @ApiProperty({ description: 'Yangi parolni tasdiqlash' })
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}

// ── Admin reset password (no current password needed) ─────────────────────────

export class AdminResetPasswordDto {
    @ApiProperty({ minLength: 8 })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: "Parol kamida 1 katta harf, 1 kichik harf va 1 raqam bo'lishi kerak",
    })
    newPassword: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    reason?: string;
}
