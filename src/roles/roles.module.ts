import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
            { name: Permission.name, schema: PermissionSchema },
        ]),
    ],
    controllers: [RolesController],
    providers: [RolesService],
    exports: [RolesService, MongooseModule],
})
export class RolesModule {}
