import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'john_doe' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: "Username faqat harf, raqam, _ va - bo'lishi mumkin",
    })
    username: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail({}, { message: "Email formati noto'g'ri" })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: "Parol kamida 1 katta harf, 1 kichik harf va 1 raqam bo'lishi kerak",
    })
    password: string;

    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @ApiPropertyOptional({ example: '+998901234567' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: "Telefon raqami noto'g'ri formatda" })
    phone?: string;

    @ApiPropertyOptional({ type: [String], example: ['64f1a2b3c4d5e6f7a8b9c0d1'] })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    roles?: string[];

    @ApiPropertyOptional({ example: 'Frontend developer, coffee lover.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    @IsOptional()
    @IsUrl({}, { message: "Avatar URL formati noto'g'ri" })
    avatarUrl?: string;
}
