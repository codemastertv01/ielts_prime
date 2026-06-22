// ─── app.module.ts ────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthGuard } from './guards/auth.guard';
import { ApiPathPermissionGuard } from './guards/api-path-permission.guard';

import { User, UserSchema } from './users/schemas/user.schema';
import { Role, RoleSchema } from './roles/schemas/role.schema';
import { Permission, PermissionSchema } from './permissions/schemas/permission.schema';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { IELTSModule } from './ielts/ielts.module';
import { IELTSAttemptsModule } from './attempts/ielts.attempts.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { DatabaseSeederModule } from './database/database-seeder.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        DiscoveryModule,
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URL'),
            }),
            inject: [ConfigService],
        }),

        // ── Guard uchun kerakli modellar ──────────────────────
        // RolesModule va PermissionsModule exports: [MongooseModule] bo'lishi kerak
        // Agar export qilinmagan bo'lsa, shu yerda qo'shing:
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Permission.name, schema: PermissionSchema },
        ]),

        AuthModule,
        RolesModule,
        UsersModule,
        PermissionsModule,
        DatabaseSeederModule,
        IELTSModule,
        IELTSAttemptsModule,
        VocabularyModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // ── Global guardlar (tartib muhim: Avval Auth, keyin Permission) ──
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: ApiPathPermissionGuard },
    ],
})
export class AppModule {}

// ─── CONTROLLER ISHLATISH MISOLLARI ──────────────────────────

// 1. Admin exam controller — path + permission tekshiruv
//
// import { RequireApiPath } from '../decorators/require-api-path.decorator';
//
// @ApiTags('IELTS Exams — Admin')
// @Controller('admin/ielts/exams')
// @UseGuards(AuthGuard)
// @RequireApiPath({ permissions: ['ielts:exam:admin'] })
// export class IELTSExamAdminController { ... }

// 2. Faqat path tekshiruvi (permission name shart emas)
//
// @Controller('admin/users')
// @RequireApiPath()
// export class AdminUsersController { ... }

// 3. Method darajasida — alohida handler uchun
//
// @Get('stats')
// @RequireApiPath({ permissions: ['ielts:stats:view'] })
// async getStats() { ... }

// 4. Public route — AuthGuard ham o'tkazib yuboradi
//
// @Get('health')
// @Public()
// health() { return { status: 'ok' }; }

// ─── PERMISSION DOCUMENT MISOLI ──────────────────────────────
// MongoDB'da saqlanadigan permission:
//
// {
//   "_id": ObjectId("..."),
//   "name": "ielts:exam:admin",
//   "apiPaths": [
//     "/admin/ielts/exams",          // barcha methodlar, prefix match
//     "GET /admin/ielts/exams/stats", // faqat GET, exact
//     "/admin/ielts/attempts",
//     "/admin/ielts/*"               // /admin/ielts/ ostidagi hammasi
//   ],
//   "isSystemPermission": false,
//   "isDeleted": false,
//   "status": "ACTIVE"
// }
//
// Super admin permission:
// {
//   "name": "super:admin",
//   "apiPaths": ["*"],               // yoki
//   "isSystemPermission": true,      // bu flag yetarli
// }

// ─── ROLES MODULE — export qilish kerak ──────────────────────
//
// @Module({
//     imports: [
//         MongooseModule.forFeature([
//             { name: Role.name, schema: RoleSchema },
//             { name: Permission.name, schema: PermissionSchema },
//         ]),
//     ],
//     exports: [MongooseModule],  // ← BU SHART
// })
// export class RolesModule {}
