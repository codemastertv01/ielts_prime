// ielts/ielts.validation.service.ts
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IELTSExamDocument } from './schemas/ielts.schema';
import { EntityStatus } from '../dto/entity-status.dto';

const VALID_BAND_SCORES = new Set([0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]);

/** Max writing words = minimumWords * 3 */
const WRITING_MAX_MULTIPLIER = 3;

@Injectable()
export class IELTSValidationService {
    private readonly logger = new Logger(IELTSValidationService.name);

    // ── Exam access ───────────────────────────────────────────

    validateExamAccess(exam: IELTSExamDocument): void {
        if (!exam.isPublished) {
            throw new BadRequestException('Bu imtihon hali nashr qilinmagan');
        }
        if (exam.status !== EntityStatus.ACTIVE) {
            throw new BadRequestException('Bu imtihon hozirda faol emas');
        }

        const now = new Date();
        if (exam.availableFrom && exam.availableFrom > now) {
            throw new BadRequestException(`Imtihon ${exam.availableFrom.toLocaleDateString('uz-UZ')} dan boshlanadi`);
        }
        if (exam.availableUntil && exam.availableUntil < now) {
            throw new BadRequestException('Bu imtihon muddati tugagan');
        }
    }

    // ── Writing content ───────────────────────────────────────

    validateWritingContent(content: string, minimumWords: number): void {
        if (!content?.trim()) {
            throw new BadRequestException("Yozuv matni bo'sh bo'lmasligi kerak");
        }

        const wc = this.countWords(content);
        const maxWords = minimumWords * WRITING_MAX_MULTIPLIER;

        if (wc < minimumWords) {
            throw new BadRequestException(`Kamida ${minimumWords} so'z kerak (sizda: ${wc} so'z)`);
        }
        if (wc > maxWords) {
            throw new BadRequestException(`Matn juda uzun. Maksimal: ${maxWords} so'z (sizda: ${wc})`);
        }
    }

    // ── Band score ────────────────────────────────────────────

    validateBandScore(score: number, field = 'score'): void {
        if (!VALID_BAND_SCORES.has(score)) {
            throw new BadRequestException(`"${field}" noto'g'ri band score: ${score}. ` + `Faqat 0–9, 0.5 qadam qiymatlar ruxsat etilgan.`);
        }
    }

    validateAllBandScores(scores: Record<string, number>): void {
        for (const [field, score] of Object.entries(scores)) {
            this.validateBandScore(score, field);
        }
    }

    // ── Speaking duration ─────────────────────────────────────

    validateSpeakingDuration(durationSeconds: number, partNumber: number, minSeconds = 30, maxSeconds = 900): void {
        if (durationSeconds < minSeconds) {
            throw new BadRequestException(`Part ${partNumber}: minimum ${minSeconds} soniya recording kerak`);
        }
        if (durationSeconds > maxSeconds) {
            throw new BadRequestException(`Part ${partNumber}: maksimal ${Math.floor(maxSeconds / 60)} daqiqa ruxsat etilgan`);
        }
    }

    // ── Recording URL ─────────────────────────────────────────

    validateRecordingUrl(url: string, partNumber: number): void {
        if (!url?.trim()) {
            throw new BadRequestException(`Part ${partNumber}: recording URL bo'sh bo'lmasligi kerak`);
        }
        if (!/^https?:\/\/.+/.test(url)) {
            throw new BadRequestException(`Part ${partNumber}: recording URL formati noto'g'ri`);
        }
    }

    // ── Answer submission ─────────────────────────────────────

    validateAnswerCount(answers: any[], expectedCount: number, sectionName: string): void {
        if (answers.length === 0) {
            throw new BadRequestException(`${sectionName}: hech qanday javob berilmagan`);
        }
        if (answers.length > expectedCount) {
            this.logger.warn(`${sectionName}: ${answers.length} javob berildi, expected max ${expectedCount}`);
        }
    }

    // ── Private utils ─────────────────────────────────────────

    private countWords(text: string): number {
        return (text ?? '')
            .trim()
            .split(/\s+/)
            .filter((w) => w.length > 0).length;
    }
}
