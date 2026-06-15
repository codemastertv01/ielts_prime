import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { HttpMethod, Permission, PermissionDocument } from '../permissions/schemas/permission.schema';
import * as bcrypt from 'bcryptjs';
import { EntityStatus } from '../dto/entity-status.dto';
import { MetadataInfo } from '../dto/metadata-info.dto';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
    private readonly logger = new Logger(DatabaseSeederService.name);

    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private discoveryService: DiscoveryService,
        private metadataScanner: MetadataScanner,
        private reflector: Reflector
    ) {}

    async onApplicationBootstrap() {
        this.logger.log('🚀 Ma’lumotlar bazasini optimallashtirish boshlandi...');
        // await this.seed();
    }

    async seed() {
        // try {
        //     const permissions = await this.syncPermissions();

        //     const roles = await this.syncRoles(permissions);

        //     await this.syncUsers(roles);

        //     this.logger.log('✅ Seeding jarayoni muvaffaqiyatli yakunlandi.');
        // } catch (error) {
        //     console.log("salom", error)
        //     this.logger.error('❌ Seedingda xatolik:', error.message);
        // }
    }

    private async syncPermissions(): Promise<PermissionDocument[]> {
        const controllers = this.discoveryService.getControllers();
        const detectedPermissions: any[] = [];

        controllers.forEach((wrapper) => {
            const { instance } = wrapper;
            if (!instance || !instance.constructor) return;

            const controllerPath = this.reflector.get(PATH_METADATA, instance.constructor);
            const prototype = Object.getPrototypeOf(instance);

            this.metadataScanner.scanFromPrototype(instance, prototype, (methodName) => {
                const methodRef = prototype[methodName];
                const route = this.reflector.get(PATH_METADATA, methodRef);
                const methodId = this.reflector.get(METHOD_METADATA, methodRef);

                if (route === undefined || methodId === undefined) return;

                const httpMethod = RequestMethod[methodId] as unknown as HttpMethod;
                const fullPath = `/api/v1/${controllerPath}/${route}`.replace(/\/+/g, '/').replace(/\/$/, '');

                detectedPermissions.push({
                    name: `${controllerPath}:${methodName}`.toLowerCase(),
                    resource: controllerPath.toLowerCase(),
                    action: httpMethod,
                    apiPath: fullPath.toLowerCase(),
                    method: httpMethod,
                    isSystemPermission: true,
                    status: EntityStatus.ACTIVE,
                    createdBy: this.systemMeta(),
                });
            });
        });

        for (const perm of detectedPermissions) {
            await this.permissionModel.updateOne({ name: perm.name }, { $set: perm }, { upsert: true });
        }

        this.logger.log(`🔍 ${detectedPermissions.length} ta API endpoint aniqlandi va tizimga kiritildi.`);
        return await this.permissionModel.find({ isDeleted: { $ne: true } });
    }

    private async syncRoles(allPermissions: PermissionDocument[]): Promise<{ admin: RoleDocument; user: RoleDocument }> {
        const systemMeta = this.systemMeta();

        const userPermIds = allPermissions.filter((p) => p.apiPath?.includes('/auth/')).map((p) => p._id);

        const adminPermIds = allPermissions.map((p) => p._id);

        const adminRole = await this.roleModel.findOneAndUpdate(
            { name: 'Admin' },
            {
                $set: {
                    description: 'To‘liq vakolatli tizim administratori',
                    permissions: adminPermIds,
                    isSystemRole: true,
                    status: EntityStatus.ACTIVE,
                    updatedBy: systemMeta,
                },
                $setOnInsert: { createdBy: systemMeta },
            },
            { upsert: true, new: true }
        );

        const userRole = await this.roleModel.findOneAndUpdate(
            { name: 'User' },
            {
                $set: {
                    description: 'Cheklangan huquqli foydalanuvchi',
                    permissions: userPermIds,
                    isSystemRole: false,
                    status: EntityStatus.ACTIVE,
                    updatedBy: systemMeta,
                },
                $setOnInsert: { createdBy: systemMeta },
            },
            { upsert: true, new: true }
        );

        this.logger.log('🎭 Rollar va Permissionlar bog‘liqligi yangilandi.');
        return { admin: adminRole, user: userRole };
    }

    private async syncUsers(roles: { admin: RoleDocument; user: RoleDocument }) {
        const systemMeta = this.systemMeta();
        const commonPassword = await bcrypt.hash('admin', 12);
        const commonPassword2 = await bcrypt.hash('user', 12);

        await this.userModel.updateOne(
            { email: 'admin@gmail.com' },
            {
                $set: {
                    username: 'admin',
                    firstName: 'Super',
                    lastName: 'Admin',
                    password: commonPassword,
                    roles: [roles.admin._id],
                    isEmailVerified: true,
                    status: EntityStatus.ACTIVE,
                    updatedBy: systemMeta,
                },
                $setOnInsert: { createdBy: systemMeta },
            },
            { upsert: true }
        );

        await this.userModel.updateOne(
            { email: 'user@gmail.com' },
            {
                $set: {
                    username: 'user',
                    firstName: 'Standard',
                    lastName: 'User',
                    password: commonPassword2,
                    roles: [roles.user._id],
                    isEmailVerified: true,
                    status: EntityStatus.ACTIVE,
                    updatedBy: systemMeta,
                },
                $setOnInsert: { createdBy: systemMeta },
            },
            { upsert: true }
        );

        this.logger.log('👥 Admin (admin@gmail.com) va User (user@gmail.com) tayyor.');
    }

    private systemMeta(): MetadataInfo {
        return {
            userId: 'system',
            username: 'system',
            email: 'system@seed',
            ipAddress: '0.0.0.0',
            userAgent: 'SeederScript',
            device: 'server',
            browser: 'server',
            os: 'linux',
            longitude: 0,
            latitude: 0,
            country: 'N/A',
            city: 'N/A',
            timestamp: new Date(),
            region: 'N/A',
            vpn: false,
        };
    }
}
