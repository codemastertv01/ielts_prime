// guards/api-path-permission.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { IS_PUBLIC_KEY } from './auth.guard';
import { User } from '../users/schemas/user.schema';
import { Role } from '../roles/schemas/role.schema';
import { Permission } from '../permissions/schemas/permission.schema';

// ─── Lean types ───────────────────────────────────────────────

interface UserLean {
    _id: Types.ObjectId;
    roles: Types.ObjectId[];
}

interface RoleLean {
    _id: Types.ObjectId;
    isSystemRole: boolean;
    permissions: Types.ObjectId[];
}

interface PermissionLean {
    _id: Types.ObjectId;
    apiPath: string | null;
    method: string;
    scope: string;
    isSystemPermission: boolean;
}

// ─── Guard ────────────────────────────────────────────────────

@Injectable()
export class ApiPathPermissionGuard implements CanActivate {
    private readonly logger = new Logger(ApiPathPermissionGuard.name);

    constructor(
        private readonly reflector: Reflector,
        @InjectModel(User.name) private readonly userModel: Model<UserLean>,
        @InjectModel(Role.name) private readonly roleModel: Model<RoleLean>,
        @InjectModel(Permission.name) private readonly permissionModel: Model<PermissionLean>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. @Public() → guard ishlamaydi
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const req = context.switchToHttp().getRequest();
        const jwtPayload = req.user;

        if (!jwtPayload) {
            throw new ForbiddenException('Autentifikatsiya talab etiladi');
        }

        const userId = (jwtPayload._id ?? jwtPayload.id ?? jwtPayload.sub)?.toString();
        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw new ForbiddenException('Token ichida user ID topilmadi');
        }

        // 2. Per-request cache
        if (!req._permissionAccess) {
            req._permissionAccess = await this.resolveAccess(userId);
        }

        const { isSuperAdmin, entries } = req._permissionAccess as {
            isSuperAdmin: boolean;
            entries: Array<{ method: string; path: string }>;
        };

        // 3. Super admin → hamma routega ruxsat
        if (isSuperAdmin) return true;

        // 4. So'rov method va path
        const method = req.method.toUpperCase() as string;
        const rawPath = req.path as string;

        // 5. entries ichida mos keladigani bormi?
        const allowed = entries.some(
            (entry) => entry.method === method && this.matchPath(rawPath, entry.path),
        );

        if (!allowed) {
            this.logger.warn(`FORBIDDEN | userId=${userId} | ${method} ${rawPath}`);
            throw new ForbiddenException(`Ruxsat mavjud emas: ${method} ${rawPath}`);
        }

        return true;
    }

    // ─── User → Role → Permission zanjiri ────────────────────

    private async resolveAccess(userId: string) {
        // Step 1: User ni olamiz
        // Faqat isDeleted tekshiramiz — status: 'ACTIVE' emas,
        // chunki valid JWT tokenga ega user istalgan statusda bo'lishi mumkin
        const user = await this.userModel
            .findOne({ _id: new Types.ObjectId(userId), isDeleted: false })
            .select('roles')
            .lean()
            .exec();

        if (!user?.roles?.length) {
            return { isSuperAdmin: false, entries: [] };
        }

        // Step 2: Rollarni olamiz
        const roles = await this.roleModel
            .find({ _id: { $in: user.roles }, isDeleted: false, status: 'ACTIVE' })
            .select('isSystemRole permissions')
            .lean()
            .exec();

        if (!roles.length) {
            return { isSuperAdmin: false, entries: [] };
        }

        // ✅ isSystemRole = true → SUPER ADMIN, hamma routega kirish
        if (roles.some((r) => r.isSystemRole)) {
            return { isSuperAdmin: true, entries: [] };
        }

        // Step 3: Permission ID larini yig'amiz
        const permIdSet = new Set<string>();
        for (const role of roles) {
            for (const permId of role.permissions ?? []) {
                const str = permId?.toString();
                if (str && Types.ObjectId.isValid(str)) permIdSet.add(str);
            }
        }

        if (!permIdSet.size) {
            return { isSuperAdmin: false, entries: [] };
        }

        // Step 4: Permissionlarni olamiz
        const permissions = await this.permissionModel
            .find({
                _id: { $in: Array.from(permIdSet).map((id) => new Types.ObjectId(id)) },
                isDeleted: false,
                status: 'ACTIVE',
            })
            .select('apiPath method scope isSystemPermission')
            .lean()
            .exec();

        if (!permissions.length) {
            return { isSuperAdmin: false, entries: [] };
        }

        // ✅ isSystemPermission = true → SUPER ADMIN (bitta bo'lsa ham yetarli)
        if (permissions.some((p) => p.isSystemPermission)) {
            return { isSuperAdmin: true, entries: [] };
        }

        // Step 5: Qolgan permissionlar → apiPath bo'yicha tekshiruv
        // scope: 'frontend' bo'lsa → API da ishlatilmaydi
        const entries = permissions
            .filter((p) => !!p.apiPath && p.scope !== 'frontend')
            .map((p) => ({
                method: (p.method ?? 'GET').toUpperCase(),
                path: p.apiPath as string,
            }));

        return { isSuperAdmin: false, entries };
    }

    // ─── Path matching ────────────────────────────────────────
    //
    // DB dagi apiPath formatlari:
    //   '/api/v1/admin/users'      → exact yoki prefix match
    //   '/api/v1/admin/users/*'    → wildcard (pastdagi hammasi)
    //   '*'                        → hamma yo'l (faqat isSystemPermission bilan)

    private matchPath(requestPath: string, pattern: string): boolean {
        if (!pattern) return false;

        const p = pattern.trim().toLowerCase();
        const rp = requestPath.toLowerCase().split('?')[0]; // query string ni olib tashlaymiz

        // Global wildcard
        if (p === '*') return true;

        // Trailing wildcard: /api/v1/admin/*
        if (p.endsWith('/*')) {
            const base = p.slice(0, -2);
            return rp === base || rp.startsWith(base + '/');
        }

        // Exact yoki prefix
        return rp === p || rp.startsWith(p + '/');
    }
}
