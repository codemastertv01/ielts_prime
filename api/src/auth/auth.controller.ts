import type { Response } from 'express';
import { Body, Controller, HttpCode, HttpStatus, Param, Post, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfirmVerificationCodeDto, LoginDto, ResetPasswordDto, SendVerificationCodeDto, UsersDto } from './dto/auth.dto';
import { Public } from '../guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('google')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Google OAuth login' })
    async googleLogin(@Body('code') code: string, @Res() res: Response) {
        return this.authService.handleGoogle(code, res);
    }

    @Post('register')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Ro'yxatdan o'tish" })
    async register(@Body() body: UsersDto) {
        return await this.authService.register(body);
    }

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Tizimga kirish' })
    async login(@Body() body: LoginDto) {
        return await this.authService.login(body);
    }

    @Post('forgot-password')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Parolni tiklash so\'rovnomasi yuborish' })
    async forgotPassword(@Body('email') email: string) {
        return await this.authService.forgotPassword(email);
    }

    @Post('reset-password/:token')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Parolni yangilash' })
    async resetPassword(@Body() body: ResetPasswordDto, @Param('token') token: string) {
        return await this.authService.resetPassword(body, token);
    }

    @Post('send/verification/code')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Tasdiqlash kodi yuborish' })
    async sendVerificationCode(@Body() body: SendVerificationCodeDto) {
        return await this.authService.sendVerificationCode(body);
    }

    @Post('confirm/verification/code')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Tasdiqlash kodini tekshirish' })
    async confirmVerificationCode(@Body() body: ConfirmVerificationCodeDto) {
        return await this.authService.confirmVerificationCode(body);
    }

    // @Post('admin/block')
    // @HttpCode(HttpStatus.OK)
    // async blockUser(@Body() body: BlockUserDto) {
    //     const adminId = new Types.ObjectId().toHexString();
    //     return this.authService.blockOrUnblockUser(body.userId, body.isBlocked, body.blockReason, body.blockedUntil, adminId);
    // }
}
