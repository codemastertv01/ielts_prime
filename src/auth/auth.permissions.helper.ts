import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

interface RoleDoc {
    _id: Types.ObjectId;
    permissions: Types.ObjectId[];
    isDeleted: boolean;
    status: string;
}

interface PermissionDoc {
    _id: Types.ObjectId;
    name: string;
    isDeleted: boolean;
    status: string;
}

@Injectable()
export class AuthPermissionsHelper {
    constructor(
        @InjectModel('Role') private readonly roleModel: Model<RoleDoc>,
        @InjectModel('Permission')
        private readonly permissionModel: Model<PermissionDoc>
    ) {}

    async resolveUserPermissionNames(user: { roles?: any[] }): Promise<string[]> {
        const roleIds = (user.roles ?? []).filter((r) => Types.ObjectId.isValid(r?.toString())).map((r) => new Types.ObjectId(r.toString()));

        if (roleIds.length === 0) return [];

        const roles = await this.roleModel
            .find({ _id: { $in: roleIds }, isDeleted: false, status: 'ACTIVE' })
            .select('permissions')
            .lean()
            .exec();

        const permIdSet = new Set<string>();
        for (const role of roles) {
            for (const pid of role.permissions ?? []) {
                permIdSet.add(pid.toString());
            }
        }

        if (permIdSet.size === 0) return [];

        const permIds = Array.from(permIdSet).map((id) => new Types.ObjectId(id));

        const permissions = await this.permissionModel
            .find({ _id: { $in: permIds }, isDeleted: false, status: 'ACTIVE' })
            .select('name')
            .lean()
            .exec();

        return permissions.map((p) => p.name);
    }
}
