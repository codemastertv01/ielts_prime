import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Permission, PermissionSchema } from '../permissions/schemas/permission.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Permission.name, schema: PermissionSchema },
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
