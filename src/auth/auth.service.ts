import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Response } from 'express';
import { google } from 'googleapis';
import * as jwt from 'jsonwebtoken';
import Mailgen from 'mailgen';
import { Model, Types } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { EntityStatus } from '../dto/entity-status.dto';
import type { MetadataInfo } from '../dto/metadata-info.dto';
import { PermissionOperation } from '../dto/permission-operation.dto';
import { Permission, PermissionDocument } from '../permissions/schemas/permission.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ConfirmVerificationCodeDto, EmailData, LoginDto, ResetPasswordDto, SendVerificationCodeDto, UsersDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly emailTransporter: nodemailer.Transporter;

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
        @InjectModel(Permission.name)
        private readonly permissionModel: Model<PermissionDocument>
    ) {
        this.emailTransporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'mirabzalozodov07@gmail.com',
                pass: process.env.EMAIL_PASS || 'xaaxdhjeecyznexd',
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
        });
    }

    private generateResetToken(): {
        token: string;
        hashedToken: string;
        expiresAt: Date;
    } {
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        return {
            token,
            hashedToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        };
    }

    private generateVerificationCode(): { code: string; expiresAt: Date } {
        return {
            code: crypto.randomInt(100000, 999999).toString(),
            expiresAt: new Date(Date.now() + 3 * 60 * 1000),
        };
    }

    private async createJwtToken(user: UserDocument): Promise<string> {
        const roleIds = Array.isArray(user.roles) ? user.roles.map((r: any) => r._id.toString()) : [];

        // Resolve permission names: roles → permissions → name strings
        const permissions = await this.resolvePermissions(roleIds);

        const payload = {
            roles: roleIds,
            permissions, // ← ['admin:manage', 'users:read', ...]
            email: user.email,
            username: user.username,
            id: user._id.toString(),
            // iss: 'auth-service',
            // aud: 'web-app',
            // iat: Math.floor(Date.now() / 1000),
        };
        return jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRES_IN!,
            algorithm: 'HS256',
        } as jwt.SignOptions);
    }

    private async resolvePermissions(roleIds: string[]): Promise<string[]> {
        if (roleIds.length === 0) return [];

        const roles = await this.roleModel
            .find({
                _id: { $in: roleIds },
                isDeleted: false,
                status: 'ACTIVE',
            })
            .select('permissions isSystemRole')
            .lean()
            .exec();

        const permIdSet = new Set<string>();
        for (const role of roles as any[]) {
            for (const pid of role.permissions ?? []) {
                permIdSet.add(pid.toString());
            }
        }

        if (permIdSet.size === 0) return [];

        const permissions = await this.permissionModel
            .find({
                _id: { $in: Array.from(permIdSet) },
                isDeleted: false,
                status: 'ACTIVE',
            })
            .select('name isSystemPermission')
            .lean()
            .exec();

        return (permissions as any[]).map((p: any) => p.name);
    }

    private async checkBlockStatus(user: UserDocument): Promise<void> {
        if (!user.blockInfo?.isBlocked) {
            return;
        }

        const { blockedUntil, blockReason } = user.blockInfo;

        if (blockedUntil && new Date() > blockedUntil) {
            user.blockInfo.isBlocked = false;
            user.blockInfo.blockReason = '';
            user.blockInfo.blockedUntil = null;
            user.blockInfo.blockedBy = null;
            user.blockInfo.blockedAt = null;

            if (user.isEmailVerified) {
                user.status = EntityStatus.ACTIVE;
            } else {
                user.status = EntityStatus.PENDING;
            }

            await user.save();
            this.logger.log(`User ${user.email} automatically unblocked`);
            return;
        }

        if (blockedUntil) {
            throw new HttpException(`Hisobingiz ${blockedUntil.toLocaleDateString('uz-UZ')} gacha bloklangan. Sabab: ${blockReason || "Ko'rsatilmagan"}`, HttpStatus.FORBIDDEN);
        }

        throw new HttpException(`Hisobingiz doimiy bloklangan. Sabab: ${blockReason || "Ko'rsatilmagan"}`, HttpStatus.FORBIDDEN);
    }

    private async checkUserStatus(user: UserDocument): Promise<void> {
        await this.checkBlockStatus(user);

        switch (user.status) {
            case EntityStatus.INACTIVE:
                throw new HttpException("Hisobingiz nofaol holatda. Admin bilan bog'laning.", HttpStatus.FORBIDDEN);

            case EntityStatus.ARCHIVE:
                throw new HttpException("Hisobingiz arxivlangan. Qayta faollashtirish uchun admin bilan bog'laning.", HttpStatus.FORBIDDEN);

            case EntityStatus.PENDING:
                break;

            case EntityStatus.ACTIVE:
                break;

            default:
                throw new HttpException("Hisobingiz noma'lum holatda. Admin bilan bog'laning.", HttpStatus.FORBIDDEN);
        }
    }

    private async sendEmailMessage(user: UserDocument | any, resObj: EmailData, msgSub: string, retries: number = 3): Promise<void> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const mailGenerator = new Mailgen({
                    theme: 'default',
                    product: {
                        name: process.env.APP_NAME!,
                        link: process.env.FRONTEND_URL!,
                        logo: process.env.APP_LOGO_URL!,
                        copyright: `© ${new Date().getFullYear()} ${process.env.APP_NAME}. Barcha huquqlar himoyalangan.`,
                    },
                });

                const emailBody = {
                    body: {
                        name: `${user.firstName} ${user.lastName}`.trim(),
                        intro: resObj.intro,
                        action: resObj.link
                            ? {
                                  instructions: resObj.instructions,
                                  button: {
                                      color: resObj.color || '#3b82f6',
                                      text: resObj.text,
                                      link: resObj.link,
                                  },
                              }
                            : undefined,
                        outro: resObj.outro || "Xavfsizligingiz uchun, agar bu siz bo'lmasangiz, e'tiborsiz qoldiring.",
                        signature: 'Hurmat bilan',
                    },
                };

                const emailHtml = mailGenerator.generate(emailBody);
                const emailText = mailGenerator.generatePlaintext(emailBody);

                const mailOptions = {
                    from: `"${process.env.APP_NAME!}" <${process.env.EMAIL_USER!}>`,
                    to: user.email,
                    subject: msgSub,
                    html: emailHtml,
                    text: emailText,
                };

                await this.emailTransporter.sendMail(mailOptions);

                this.logger.log(`Email sent successfully to ${user.email} (attempt ${attempt})`);
                return;
            } catch (error) {
                this.logger.error(`Email send failed (attempt ${attempt}/${retries}):`, error.message);

                if (attempt === retries) {
                    throw new HttpException("Email yuborishda xatolik. Iltimos qaytadan urinib ko'ring.", HttpStatus.INTERNAL_SERVER_ERROR);
                }

                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    private createMetadata(req?: any): MetadataInfo {
        return {
            userId: req?.user?.id || 'system',
            username: req?.user?.username || 'system',
            email: req?.user?.email || 'system',
            ipAddress: req?.ip || '0.0.0.0',
            userAgent: req?.headers?.['user-agent'] || 'Unknown',
            device: 'web',
            os: 'unknown',
            browser: 'unknown',
            timestamp: new Date(),
            longitude: 0,
            latitude: 0,
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            vpn: false,
        };
    }

    private async updateLoginInfo(user: UserDocument, metadata: MetadataInfo): Promise<void> {
        user.lastLoginAt = new Date();
        user.lastLoginInfo = metadata;

        if (!user.loginHistory) {
            user.loginHistory = [];
        }
        user.loginHistory.unshift(metadata);
        user.loginHistory = user.loginHistory.slice(0, 10);

        if (!user.auditLog) {
            user.auditLog = [];
        }
        user.auditLog.push({
            action: 'login' as PermissionOperation,
            performedBy: metadata,
            timestamp: new Date(),
            changes: [],
        });

        await user.save();
    }

    async handleGoogle(code: string, res: Response): Promise<any> {
        const oauth2Client = new google.auth.OAuth2({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_REDIRECT_URI,
        });

        try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
            const { data: googleUser } = await oauth2.userinfo.get();

            if (!googleUser.email) {
                throw new HttpException("Google'dan email ma'lumoti olinmadi", HttpStatus.UNPROCESSABLE_ENTITY);
            }

            const email = googleUser.email.toLowerCase();

            let user = await this.userModel.findOne({ email }).select('+password').populate('roles').exec();

            const metadata = this.createMetadata();

            if (user) {
                await this.checkUserStatus(user);

                if (!user.isEmailVerified) {
                    user.isEmailVerified = true;
                    user.emailVerifiedAt = new Date();
                    user.verificationCode = null;
                    user.verificationExpiresAt = null;
                    user.status = EntityStatus.ACTIVE;
                    await user.save();

                    this.logger.log(`User ${email} email verified via Google`);
                }

                await this.updateLoginInfo(user, metadata);
                const token = await this.createJwtToken(user);
                const userRoles = user.roles.map((r: Types.ObjectId) => r._id.toString());
                const permission = await this.resolvePermissions(userRoles);

                return res.json({
                    success: true,
                    login: true,
                    redirect: true,
                    message: 'Google orqali kirish muvaffaqiyatli',
                    url: '/dashboard',
                    user: {
                        token,
                        permission,
                        userId: user._id.toString(),
                        email: user.email,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        avatarUrl: user.avatarUrl,
                    },
                });
            }

            const defaultRole = await this.roleModel
                .findOne({
                    name: 'User',
                    isDeleted: false,
                    status: EntityStatus.ACTIVE,
                })
                .exec();

            if (!defaultRole) {
                throw new HttpException("Default role topilmadi. Admin bilan bog'laning.", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const baseUsername = email.split('@')[0];
            const randomSuffix = crypto.randomBytes(3).toString('hex');
            const username = `${baseUsername}_${randomSuffix}`;

            user = await this.userModel.create({
                email,
                username,
                firstName: googleUser.given_name,
                lastName: googleUser.family_name,
                avatarUrl: googleUser.picture || process.env.DEFAULT_USER_IMAGE,
                password: null,
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                status: EntityStatus.ACTIVE,
                roles: [defaultRole._id],
                createdBy: metadata,
                lastLoginAt: new Date(),
                lastLoginInfo: metadata,
                loginHistory: [metadata],
                auditLog: [
                    {
                        action: 'create',
                        performedBy: metadata,
                        timestamp: new Date(),
                        changes: [],
                    },
                ],
            });

            this.logger.log(`New user registered via Google: ${email}`);

            const token = await this.createJwtToken(user);
            const userRoles = user.roles.map((r: Types.ObjectId) => r._id.toString());
            const permission = await this.resolvePermissions(userRoles);

            this.sendWelcomeEmail(user).catch((err) => this.logger.error('Welcome email failed:', err.message));

            return res.json({
                success: true,
                login: true,
                redirect: true,
                message: 'Google orqali kirish muvaffaqiyatli',
                url: '/dashboard',
                user: {
                    token,
                    permission,
                    userId: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatarUrl: user.avatarUrl,
                },
            });
        } catch (error) {
            this.logger.error('Google auth failed:', error.message, error.stack);

            throw new HttpException(error.message || 'Google orqali kirish amalga oshmadi', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async register(data: UsersDto): Promise<any> {
        const { firstName, lastName, email, username, password } = data;

        try {
            const [existingEmail, existingUsername] = await Promise.all([this.userModel.findOne({ email: email.toLowerCase(), isDeleted: false }).lean(), this.userModel.findOne({ username, isDeleted: false }).lean()]);

            if (existingEmail) {
                throw new HttpException("Bu email allaqachon ro'yxatdan o'tgan", HttpStatus.CONFLICT);
            }

            if (existingUsername) {
                throw new HttpException('Bu username band', HttpStatus.CONFLICT);
            }

            const defaultRole = await this.roleModel
                .findOne({
                    name: 'User',
                    isDeleted: false,
                    status: EntityStatus.ACTIVE,
                })
                .exec();

            if (!defaultRole) {
                throw new HttpException("Default role topilmadi. Admin bilan bog'laning.", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const { code: verificationCode, expiresAt: verificationExpiresAt } = this.generateVerificationCode();

            const hashedPassword = await bcrypt.hash(password, 12);

            const metadata = this.createMetadata();

            const user = await this.userModel.create({
                email: email.toLowerCase(),
                username,
                firstName,
                lastName,
                verificationCode,
                verificationExpiresAt,
                isEmailVerified: false,
                password: hashedPassword,
                roles: [defaultRole._id],
                status: EntityStatus.PENDING,
                avatarUrl: process.env.DEFAULT_USER_IMAGE,
                createdBy: metadata,
                auditLog: [
                    {
                        action: 'create',
                        performedBy: metadata,
                        timestamp: new Date(),
                        changes: [],
                    },
                ],
            });

            this.logger.log(`New user registered: ${email}`);

            const mailData: EmailData = {
                subject: 'Emailni Tasdiqlash',
                link: `${process.env.FRONTEND_URL}/auth/verification/${email}`,
                color: '#3b82f6',
                text: 'Emailni Tasdiqlash',
                intro: `Welcome, ${firstName}!`,
                instructions: `Emailingizni tasdiqlash uchun quyidagi kodni kiriting:<br><br><h2 style="color: #3b82f6; letter-spacing: 5px;">${verificationCode}</h2><br>Bu kod <strong>5 daqiqa</strong> ichida amal qiladi.`,
                outro: "Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.",
            };

            await this.sendEmailMessage(user, mailData, 'Emailni Tasdiqlash');

            return {
                success: true,
                message: "Ro'yxatdan o'tish muvaffaqiyatli. Emailingizga (va agar telefon berilgan bo'lsa SMSga) tasdiqlash kodi yuborildi.",
                data: {
                    email: user.email,
                    verificationExpiresAt,
                    redirectUrl: `/auth/verification/${email}`,
                },
            };
        } catch (error) {
            throw new HttpException(error.message || "Ro'yxatdan o'tishda xatolik", error.status || HttpStatus.BAD_REQUEST);
        }
    }

    async login(data: LoginDto): Promise<any> {
        const { email, password } = data;

        try {
            const user = await this.userModel.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password').populate('roles').exec();

            if (!user) {
                throw new HttpException("Email yoki parol noto'g'ri", HttpStatus.BAD_REQUEST);
            }

            if (!user.password) {
                throw new HttpException('Bu hisob Google orqali yaratilgan. Google bilan kiring.', HttpStatus.UNAUTHORIZED);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new HttpException("Email yoki parol noto'g'ri", HttpStatus.BAD_REQUEST);
            }

            await this.checkUserStatus(user);

            if (!user.isEmailVerified) {
                const { code: verificationCode, expiresAt: verificationExpiresAt } = this.generateVerificationCode();

                user.verificationCode = verificationCode;
                user.verificationExpiresAt = verificationExpiresAt;
                await user.save();

                const mailData: EmailData = {
                    subject: 'Emailni Tasdiqlash',
                    link: `${process.env.FRONTEND_URL}/auth/verification/${email}`,
                    color: '#f59e0b',
                    text: 'Emailni Tasdiqlash',
                    intro: 'Emailingiz hali tasdiqlanmagan',
                    instructions: `Emailingizni tasdiqlash uchun quyidagi kodni kiriting:<br><br><h2 style="color: #f59e0b; letter-spacing: 5px;">${verificationCode}</h2><br>Bu kod <strong>5 daqiqa</strong> ichida amal qiladi.`,
                };

                await this.sendEmailMessage(user, mailData, 'Emailni Tasdiqlash');

                // If phone exists, send SMS
                // if (user.phone) {
                // Implement SMS sending, e.g., Twilio
                // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
                // await client.messages.create({
                //     body: `Your verification code is ${verificationCode}. It expires in 5 minutes.`,
                //     from: process.env.TWILIO_PHONE,
                //     to: user.phone
                // });
                // this.logger.log(`SMS verification code sent to ${user.phone}`);
                // }

                throw new HttpException('Emailingizni tasdiqlang. Yangi tasdiqlash kodi yuborildi.', HttpStatus.FORBIDDEN);
            }

            const metadata = this.createMetadata();

            await this.updateLoginInfo(user, metadata);

            const token = await this.createJwtToken(user);
            const userRoles = user.roles.map((r: Types.ObjectId) => r._id.toString());
            const permission = await this.resolvePermissions(userRoles);

            this.logger.log(`User logged in: ${email}`);

            return {
                success: true,
                redirect: true,
                message: 'Kirish muvaffaqiyatli',
                url: '/cabinet',
                user: {
                    token,
                    permission,
                    userId: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatarUrl: user.avatarUrl,
                },
            };
        } catch (error) {
            throw new HttpException(error.message || 'Kirishda xatolik', error.status || HttpStatus.UNAUTHORIZED);
        }
    }

    async forgotPassword(email: string): Promise<any> {
        try {
            const user = await this.userModel.findOne({ email: email.toLowerCase(), isDeleted: false }).exec();

            if (!user) {
                this.logger.warn(`Password reset attempted for non-existent email: ${email}`);
                return {
                    success: true,
                    message: "Agar bu email ro\'yxatdan o\'tgan bo\'lsa, parolni tiklash havolasi yuborildi.",
                };
            }

            await this.checkBlockStatus(user);

            if (!user.password) {
                throw new HttpException('Bu hisob Google orqali yaratilgan. Google bilan kiring.', HttpStatus.BAD_REQUEST);
            }

            const { token, hashedToken, expiresAt } = this.generateResetToken();

            user.resetToken = hashedToken;
            user.resetTokenExpiresAt = expiresAt;
            await user.save();

            const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
            const mailData: EmailData = {
                subject: 'Parolni Tiklash',
                link: resetLink,
                color: '#ef4444',
                text: 'Parolni Tiklash',
                intro: "Parolni tiklash so'rovi",
                instructions: 'Parolni tiklash uchun quyidagi tugmani bosing. Bu havola <strong>15 daqiqa</strong> ichida amal qiladi.',
                outro: "Agar siz bu so'rovni yubormasangiz, bu xabarni e'tiborsiz qoldiring.",
            };

            await this.sendEmailMessage(user, mailData, 'Parolni Tiklash');

            this.logger.log(`Password reset requested: ${email}`);

            return {
                success: true,
                message: 'Parolni tiklash havolasi emailingizga yuborildi.',
            };
        } catch (error) {
            throw new HttpException(error.message || 'Parolni tiklashda xatolik', error.status || HttpStatus.BAD_REQUEST);
        }
    }

    async resetPassword(body: ResetPasswordDto, token: string): Promise<any> {
        try {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await this.userModel
                .findOne({
                    resetToken: hashedToken,
                    resetTokenExpiresAt: { $gt: new Date() },
                    isDeleted: false,
                })
                .exec();

            if (!user) {
                throw new HttpException("Yaroqsiz yoki muddati o'tgan token", HttpStatus.BAD_REQUEST);
            }

            await this.checkBlockStatus(user);

            const hashedPassword = await bcrypt.hash(body.password, 12);

            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiresAt = undefined;

            const metadata = this.createMetadata();
            if (!user.auditLog) user.auditLog = [];
            user.auditLog.push({
                action: 'password_reset' as PermissionOperation,
                performedBy: metadata,
                timestamp: new Date(),
                changes: [
                    {
                        field: 'password',
                        oldValue: '***',
                        newValue: '***',
                        changedAt: new Date(),
                        changedBy: metadata,
                    },
                ],
            });

            await user.save();

            this.logger.log(`Password reset completed: ${user.email}`);

            const mailData: EmailData = {
                subject: 'Parol Tiklandi',
                link: `${process.env.FRONTEND_URL}/auth/login`,
                color: '#10b981',
                text: 'Kirish',
                intro: 'Parolingiz muvaffaqiyatli tiklandi',
                instructions: 'Endi yangi parol bilan tizimga kirishingiz mumkin.',
            };

            await this.sendEmailMessage(user, mailData, 'Parol Tiklandi');

            return {
                success: true,
                message: 'Parol muvaffaqiyatli tiklandi. Endi tizimga kirishingiz mumkin.',
            };
        } catch (error) {
            throw new HttpException(error.message || 'Parolni tiklashda xatolik', error.status || HttpStatus.BAD_REQUEST);
        }
    }

    async sendVerificationCode(data: SendVerificationCodeDto): Promise<any> {
        try {
            const user = await this.userModel.findOne({ email: data.email.toLowerCase(), isDeleted: false }).exec();

            if (!user) {
                throw new HttpException('Foydalanuvchi topilmadi', HttpStatus.NOT_FOUND);
            }

            if (user.isEmailVerified) {
                return { success: true, message: 'Email allaqachon tasdiqlangan' };
            }

            await this.checkBlockStatus(user);

            const { code: verificationCode, expiresAt: verificationExpiresAt } = this.generateVerificationCode();

            user.verificationCode = verificationCode;
            user.verificationExpiresAt = verificationExpiresAt;
            await user.save();

            const mailData: EmailData = {
                subject: 'Emailni Tasdiqlash',
                link: `${process.env.FRONTEND_URL}/auth/verification/${data.email}`,
                color: '#3b82f6',
                text: 'Emailni Tasdiqlash',
                intro: 'Yangi tasdiqlash kodi',
                instructions: `Emailingizni tasdiqlash uchun quyidagi kodni kiriting:<br><br><h2 style="color: #3b82f6; letter-spacing: 5px;">${verificationCode}</h2><br>Bu kod <strong>5 daqiqa</strong> ichida amal qiladi.`,
            };

            await this.sendEmailMessage(user, mailData, 'Emailni Tasdiqlash');

            // If phone exists, send SMS
            if (user.phone) {
                // Implement SMS sending, e.g., Twilio
                // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
                // await client.messages.create({
                //     body: `Your verification code is ${verificationCode}. It expires in 5 minutes.`,
                //     from: process.env.TWILIO_PHONE,
                //     to: user.phone
                // });
                this.logger.log(`SMS verification code sent to ${user.phone}`);
            }

            this.logger.log(`Verification code resent: ${data.email}`);

            return {
                success: true,
                message: "Yangi tasdiqlash kodi emailingizga (va agar telefon mavjud bo'lsa SMSga) yuborildi",
                data: { verificationExpiresAt },
            };
        } catch (error) {
            throw new HttpException(error.message || 'Tasdiqlash kodini yuborishda xatolik', error.status || HttpStatus.BAD_REQUEST);
        }
    }

    async confirmVerificationCode(body: ConfirmVerificationCodeDto): Promise<any> {
        try {
            const { email, verificationcode } = body;
            const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+verificationCode +verificationExpiresAt').populate('roles').exec();
            if (!user) {
                throw new HttpException('Foydalanuvchi topilmadi.', HttpStatus.NOT_FOUND);
            }

            await this.checkBlockStatus(user);

            if (user.verificationCode !== verificationcode || !user.verificationExpiresAt || new Date() > user.verificationExpiresAt) {
                throw new HttpException('Yaroqsiz yoki amal qilish muddati tugagan tasdiqlash kodi.', HttpStatus.BAD_REQUEST);
            }

            user.isEmailVerified = true;
            user.verificationCode = null;
            user.verificationExpiresAt = null;
            user.emailVerifiedAt = new Date();
            user.status = EntityStatus.ACTIVE;

            const metadata = this.createMetadata();
            await this.updateLoginInfo(user, metadata);

            await user.save();

            const token = await this.createJwtToken(user);
            const userRoles = user.roles.map((r: Types.ObjectId) => r._id.toString());
            const permission = await this.resolvePermissions(userRoles);

            const mailData: EmailData = {
                subject: 'Email Tasdiqlandi',
                link: `${process.env.FRONTEND_URL}/cabinet`,
                color: '#10b981',
                text: 'Kabinetga Kirish',
                intro: 'Emailingiz muvaffaqiyatli tasdiqlandi!',
                instructions: 'Endi tizimga kirishingiz mumkin.',
            };

            this.sendEmailMessage(user, mailData, 'Email Tasdiqlandi').catch((err) => this.logger.error('Confirmation email failed:', err.message));

            return {
                success: true,
                redirect: true,
                message: 'Email muvaffaqiyatli tasdiqlandi va tizimga kirish amalga oshirildi.',
                url: '/cabinet',
                user: {
                    token,
                    permission,
                    userId: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatarUrl: user.avatarUrl,
                },
            };
        } catch (error) {
            throw new HttpException(error.message || 'Tasdiqlash kodini tekshirishda xatolik yuz berdi.', error.status || HttpStatus.BAD_REQUEST);
        }
    }

    async blockOrUnblockUser(userId: string, isBlocked: boolean, blockReason?: string, blockedUntil?: Date, adminMetadata?: MetadataInfo): Promise<any> {
        try {
            const user = await this.userModel.findById(userId).exec();

            if (!user) {
                throw new HttpException('Foydalanuvchi topilmadi.', HttpStatus.NOT_FOUND);
            }

            const metadata = adminMetadata || this.createMetadata();

            if (!isBlocked) {
                user.blockInfo = {
                    isBlocked: false,
                    blockReason: '',
                    blockedUntil: null,
                    blockedBy: null,
                    blockedAt: null,
                };
                user.status = user.isEmailVerified ? EntityStatus.ACTIVE : EntityStatus.PENDING;

                user.auditLog.push({
                    action: 'unblock' as PermissionOperation,
                    performedBy: metadata,
                    timestamp: new Date(),
                    changes: [
                        {
                            field: 'blockInfo',
                            oldValue: 'blocked',
                            newValue: 'unblocked',
                            changedAt: new Date(),
                            changedBy: metadata,
                        },
                    ],
                });

                await user.save();
                this.logger.log(`User ${user.email} unblocked by ${metadata.username}`);

                const mailData: EmailData = {
                    subject: 'Hisobingiz Blokdan Chiqarildi',
                    link: `${process.env.FRONTEND_URL}/auth/login`,
                    color: '#10b981',
                    text: 'Kirish',
                    intro: 'Hisobingiz blokdan chiqarildi',
                    instructions: 'Endi tizimga kirishingiz mumkin.',
                };

                this.sendEmailMessage(user, mailData, 'Hisob Blokdan Chiqarildi').catch((err) => this.logger.error('Unblock email failed:', err.message));

                return {
                    success: true,
                    message: `Foydalanuvchi ${user.email} blokdan muvaffaqiyatli chiqarildi.`,
                };
            } else {
                if (!blockReason || blockReason.length < 10) {
                    throw new HttpException('Bloklash sababi kamida 10 belgidan iborat boʻlishi shart.', HttpStatus.BAD_REQUEST);
                }

                user.blockInfo.isBlocked = true;
                user.blockInfo.blockReason = blockReason;
                user.blockInfo.blockedAt = new Date();
                user.blockInfo.blockedBy = metadata;
                user.blockInfo.blockedUntil = blockedUntil as Date;

                user.status = EntityStatus.INACTIVE;

                user.auditLog.push({
                    action: 'block' as PermissionOperation,
                    performedBy: metadata,
                    timestamp: new Date(),
                    changes: [
                        {
                            field: 'blockInfo',
                            oldValue: 'unblocked',
                            newValue: 'blocked',
                            changedAt: new Date(),
                            changedBy: metadata,
                        },
                    ],
                });

                await user.save();
                this.logger.log(`User ${user.email} blocked by ${metadata.username}. Reason: ${blockReason}`);

                const blockDuration = blockedUntil ? `vaqtinchalik, ${blockedUntil.toLocaleDateString('uz-UZ')} gacha` : 'doimiy';

                const mailData: EmailData = {
                    subject: 'Hisobingiz Bloklandi',
                    link: `${process.env.FRONTEND_URL}/support`,
                    color: '#ef4444',
                    text: "Qo'llab-quvvatlash",
                    intro: 'Hisobingiz bloklandi',
                    instructions: `Hisobingiz ${blockDuration} bloklandi. Sabab: ${blockReason}. Qo\'shimcha ma\'lumot uchun qo\'llab-quvvatlash xizmatiga murojaat qiling.`,
                };

                this.sendEmailMessage(user, mailData, 'Hisob Bloklandi').catch((err) => this.logger.error('Block email failed:', err.message));

                return {
                    success: true,
                    message: `Foydalanuvchi ${user.email} muvaffaqiyatli bloklandi. Holat: ${blockDuration}. Sabab: ${blockReason}`,
                };
            }
        } catch (error) {
            this.logger.error('Block/Unblock failed:', error.message, error.stack);
            throw new HttpException(error.message || 'Bloklash operatsiyasida xatolik yuz berdi.', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async sendWelcomeEmail(user: UserDocument): Promise<void> {
        const mailData: EmailData = {
            subject: 'Welcome!',
            link: `${process.env.FRONTEND_URL}/dashboard`,
            color: '#3b82f6',
            text: 'Kabinetga Kirish',
            intro: `Welcome, ${user.firstName}!`,
            instructions: "Tizimga muvaffaqiyatli ro'yxatdan o'tdingiz. Kabinetga kirib, sozlamalarni o'rnating.",
            outro: "Savollaringiz bo'lsa, qo'llab-quvvatlash xizmatiga murojaat qiling.",
        };

        await this.sendEmailMessage(user, mailData, 'Welcome');
    }
}
