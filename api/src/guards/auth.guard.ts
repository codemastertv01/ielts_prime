// guards/auth.guard.ts
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDocument } from '../users/schemas/user.schema';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => (target: any, key?: any, descriptor?: any) => {
    if (descriptor) {
        Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
        return descriptor;
    }
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
    return target;
};

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly reflector: Reflector
    ) {}

    canActivate(context: ExecutionContext): boolean {
        // @Public() decorator — skip auth
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic) return true;
        const req = context.switchToHttp().getRequest();
        const authHeader: string | undefined = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const [scheme, token] = authHeader.split(' ');

        if (scheme?.toLowerCase() !== 'bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization format. Use: Bearer <token>');
        }

        try {
            const secret = this.configService.get<string>('JWT_SECRET');
            const decoded = jwt.verify(token, secret as string);
            req.user = decoded as UserDocument;
            return true;
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token has expired');
            }
            if (err.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid token');
            }
            throw new UnauthorizedException('Authentication failed');
        }
    }
}
