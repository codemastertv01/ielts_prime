import { MongooseModule } from '@nestjs/mongoose';
import { Module, forwardRef } from '@nestjs/common';
import { DatabaseSeederService } from './database-seeder.service';
import { UsersModule } from '../users/users.module';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';
import { DiscoveryModule } from '@nestjs/core';

@Module({
    imports: [
        DiscoveryModule,
        MongooseModule.forFeature([
            { name: Permission.name, schema: PermissionSchema },
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
        ]),
        forwardRef(() => UsersModule),
    ],
    providers: [DatabaseSeederService],
    exports: [DatabaseSeederService],
})
export class DatabaseSeederModule {}
