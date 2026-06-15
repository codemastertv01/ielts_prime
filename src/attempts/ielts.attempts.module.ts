// attempts/ielts.attempts.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';

import { IELTSAttemptController } from './ielts.attempts.controller';
import { IELTSExamAttemptService } from './ielts.attempts.service';
import { IELTSNotificationService } from './ielts.notification.service';

import { IELTSExamAttempt, IELTSExamAttemptSchema } from './schemas/ielts.attempts.schema';
import { IELTSExam, IELTSExamSchema } from '../ielts/schemas/ielts.schema';
import { IELTSExamService } from '../ielts/ielts.exams.service';
import { IELTSCacheService } from '../ielts/ielts.cache.service';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { IELTSEmailService } from './ielts.email.service';
import { IELTSValidationService } from '../ielts/ielts.validation.service';
import { IELTSAttemptAdminController } from './ielts.attempts.admin.controller';
import { IELTSExamAttemptsAdminService } from './ielts.attempts.admin.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: IELTSExamAttempt.name, schema: IELTSExamAttemptSchema },
            { name: IELTSExam.name, schema: IELTSExamSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Permission.name, schema: PermissionSchema },
        ]),
        CacheModule.register({ ttl: 300, max: 100 }),
    ],
    controllers: [IELTSAttemptController, IELTSAttemptAdminController],
    providers: [
        IELTSExamAttemptService,
        IELTSNotificationService,
        IELTSExamService,
        IELTSCacheService,
        IELTSEmailService,
        IELTSValidationService,
        IELTSExamAttemptsAdminService
    ],
    exports: [IELTSExamAttemptService, IELTSExamAttemptsAdminService, IELTSNotificationService,  IELTSEmailService],
})
export class IELTSAttemptsModule {}
