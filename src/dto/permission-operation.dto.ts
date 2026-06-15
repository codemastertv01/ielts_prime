export enum PermissionOperation {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    MANAGE = 'MANAGE',
    ALL = '*',
}

export const PERMISSION_ACTIONS = Object.values(PermissionOperation);
