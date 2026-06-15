import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../users/schemas/user.schema';

export interface CustomRequest extends Request {
    user?: UserDocument;
}

/**
 * Requestdan foydalanuvchi ID sini xavfsiz olish.
 *
 * - req.user mavjud bo'lmasa → UnauthorizedException
 * - JWT payload da id/sub/_id bo'lmasa → UnauthorizedException
 *
 * @example
 * const userId = getUserId(req);
 */
export function getUserId(req: Request): string {
    const user = (req as any).user;

    if (!user) {
        throw new UnauthorizedException('Tizimga kirish talab etiladi');
    }

    const id: string | undefined =
        user.id ??
        user._id?.toString() ??
        user.sub;

    if (!id) {
        throw new UnauthorizedException('Token ichida foydalanuvchi ID topilmadi');
    }

    return id;
}
