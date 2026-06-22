import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class IELTSCacheService {
    private readonly logger = new Logger(IELTSCacheService.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async cacheExam(examId: string, exam: any, ttl: number = 3600): Promise<void> {
        try {
            await this.cacheManager.set(`exam:${examId}`, exam, ttl);
            this.logger.debug(`Exam cached: ${examId}`);
        } catch (error) {
            this.logger.warn(`Cache error: ${error.message}`);
        }
    }

    async getCachedExam(examId: string): Promise<any> {
        try {
            return await this.cacheManager.get(`exam:${examId}`);
        } catch (error) {
            this.logger.warn(`Cache get error: ${error.message}`);
            return null;
        }
    }

    async clearExamCache(examId: string): Promise<void> {
        try {
            await this.cacheManager.del(`exam:${examId}`);
            this.logger.debug(`Cache cleared: ${examId}`);
        } catch (error) {
            this.logger.warn(`Cache clear error: ${error.message}`);
        }
    }

    async cacheUserAttempts(userId: string, attempts: any[], ttl: number = 300): Promise<void> {
        try {
            await this.cacheManager.set(`attempts:${userId}`, attempts, ttl);
        } catch (error) {
            this.logger.warn(`Cache error: ${error.message}`);
        }
    }

    async getCachedUserAttempts(userId: string): Promise<any[] | null> {
        try {
            return (await this.cacheManager.get(`attempts:${userId}`)) || null;
        } catch (error) {
            return null;
        }
    }

    async clearUserAttemptsCache(userId: string): Promise<void> {
        try {
            await this.cacheManager.del(`attempts:${userId}`);
        } catch (error) {
            this.logger.warn(`Cache clear error: ${error.message}`);
        }
    }
}
