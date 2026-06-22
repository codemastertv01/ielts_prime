import { Request } from 'express';

export interface MetadataInfo {
    userId: string;
    username: string;
    email: string;
    ipAddress: string;
    userAgent: string;
    device: string;
    browser: string;
    os: string;
    longitude: number;
    latitude: number;
    country: string;
    city: string;
    timestamp: Date;
    region: string;
    vpn: boolean;
}

export function buildMeta(req: Request): MetadataInfo {
    const u = (req as any).user ?? {};
    return {
        userId: u.id ?? u._id ?? 'unknown',
        username: u.username ?? 'unknown',
        email: u.email ?? '',
        ipAddress: req.ip ?? '0.0.0.0',
        userAgent: req.headers?.['user-agent'] ?? '',
        device: (req as any).device ?? 'unknown',
        browser: (req as any).browser ?? 'unknown',
        os: (req as any).os ?? 'unknown',
        longitude: 0,
        latitude: 0,
        country: (req as any).country ?? 'unknown',
        city: (req as any).city ?? 'unknown',
        region: (req as any).region ?? 'unknown',
        vpn: false,
        timestamp: new Date(),
    } as MetadataInfo;
}
