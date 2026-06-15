import { IsEmail, IsString, MinLength, MaxLength, Matches, IsNumberString, IsOptional, ValidateIf, IsNotEmpty, Equals, IsDate, IsBoolean } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';

export interface EmailData {
    link: string;
    text: string;
    color: string;
    intro: string;
    subject: string;
    outro?: string;
    instructions: string;
}

export class UsersDto {
    @IsString({ message: 'Ism matn (string) boʻlishi kerak.' })
    @MinLength(2, { message: 'Ism kamida 2 belgidan iborat boʻlishi kerak.' })
    firstName: string;

    @IsString({ message: 'Familiya matn (string) boʻlishi kerak.' })
    @MinLength(2, { message: 'Familiya kamida 2 belgidan iborat boʻlishi kerak.' })
    lastName: string;

    @IsEmail({}, { message: 'Elektron pochta manzili xato formatda.' })
    email: string;

    @IsString({ message: 'Foydalanuvchi nomi matn (string) boʻlishi kerak.' })
    @MinLength(3, { message: 'Foydalanuvchi nomi kamida 3 belgidan iborat boʻlishi kerak.' })
    @MaxLength(30, { message: 'Foydalanuvchi nomi koʻpi bilan 30 belgidan iborat boʻlishi kerak.' })
    @Matches(/^[a-zA-Z0-9_.]+$/, { message: 'Foydalanuvchi nomi faqat lotin harflari, raqamlar va _ . dan iborat boʻlishi kerak.' })
    username: string;

    @IsString({ message: 'Parol matn (string) boʻlishi kerak.' })
    @MinLength(8, { message: 'Parol kamida 8 belgidan iborat boʻlishi kerak.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Parol kamida 8 belgi, bitta katta harf, bitta kichik harf, bitta raqam va bitta maxsus belgi (@$!%*?&) oʻz ichiga olishi kerak.' })
    password: string;

    @Match('password', { message: 'Tasdiqlash paroli, asosiy parol bilan mos kelishi kerak.' })
    confirmPassword: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Elektron pochta manzili xato formatda.' })
    email: string;

    @IsString({ message: 'Parol matn (string) boʻlishi kerak.' })
    @MinLength(1, { message: 'Parol boʻsh boʻlishi mumkin emas.' })
    password: string;
}

export class ResetPasswordDto {
    @IsString({ message: 'Yangi parol matn (string) boʻlishi kerak.' })
    @MinLength(8, { message: 'Yangi parol kamida 8 belgidan iborat boʻlishi kerak.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Parol kamida 8 belgi, bitta katta harf, bitta kichik harf, bitta raqam va bitta maxsus belgi oʻz ichiga olishi kerak.' })
    password: string;

    @Match('password', { message: 'Tasdiqlash paroli, asosiy parol bilan mos kelishi kerak.' })
    confirmPassword: string;
}

export class SendVerificationCodeDto {
    @IsEmail({}, { message: 'Elektron pochta manzili toʻgʻri formatda boʻlishi kerak.' })
    email: string;
}

export class ConfirmVerificationCodeDto {
    @IsEmail({}, { message: 'Elektron pochta manzili toʻgʻri formatda boʻlishi kerak.' })
    email: string;

    @IsNumberString({}, { message: 'Tasdiqlash kodi faqat raqamlardan iborat boʻlishi kerak.' })
    @MinLength(6, { message: 'Tasdiqlash kodi 6 xonali boʻlishi kerak.' })
    @MaxLength(6, { message: 'Tasdiqlash kodi 6 xonali boʻlishi kerak.' })
    verificationcode: string;
}

export class BlockUserDto {
    @IsString({ message: 'Foydalanuvchi IDsi matn turida boʻlishi kerak.' })
    @IsNotEmpty({ message: 'Bloklanuvchi foydalanuvchi IDsi kiritilishi shart.' })
    userId: string;

    @IsBoolean({ message: 'Bloklash holati mantiqiy turda boʻlishi kerak.' })
    isBlocked: boolean;

    @ValidateIf((o) => o.isBlocked === true)
    @IsString({ message: 'Bloklash sababi matn turida boʻlishi kerak.' })
    @MinLength(10, { message: 'Bloklash sababi kamida 10 belgidan iborat boʻlishi kerak.' })
    blockReason: string;

    @IsOptional()
    @ValidateIf((o) => o.isBlocked === true)
    @IsDate({ message: 'Bloklash muddati toʻgʻri sana formatida boʻlishi kerak.' })
    blockedUntil?: Date;
}
