// ielts/ielts.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { IELTSExam, IELTSExamSchema } from './schemas/ielts.schema';
import { IELTSExamAttempt, IELTSExamAttemptSchema } from '../attempts/schemas/ielts.attempts.schema';

import { IELTSExamService } from './ielts.exams.service';
import { IELTSCacheService } from './ielts.cache.service';
import { IELTSCronService } from './ielts.cron.service';
import { IELTSValidationService } from './ielts.validation.service';
import { IELTSNotificationService } from './ielts.notification.service';
import { IELTSExamController, IELTSExamAdminController } from './ielts.exams.controller';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
            { name: Permission.name, schema: PermissionSchema },
            { name: IELTSExam.name, schema: IELTSExamSchema },
            { name: IELTSExamAttempt.name, schema: IELTSExamAttemptSchema },
        ]),
        CacheModule.register({ ttl: 300, max: 200 }),
        ScheduleModule.forRoot(),
    ],
    controllers: [IELTSExamController, IELTSExamAdminController],
    providers: [IELTSExamService, IELTSCacheService, IELTSCronService, IELTSValidationService, IELTSNotificationService],
    exports: [IELTSExamService, IELTSCacheService, IELTSValidationService, IELTSNotificationService],
})
export class IELTSModule {}
