// import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
// import { InjectModel } from "@nestjs/mongoose";
// import { Model } from "mongoose";
// import { EntityStatus } from "../ielts/dto/status.dto";
// import { IELTSExam, IELTSExamAttempt, IELTSExamAttemptDocument, IELTSExamDocument } from "../ielts/schemas/ielts.schema";

// @Injectable()
// export class IELTSReportService {
//     private readonly logger = new Logger(IELTSReportService.name);

//     constructor(
//         @InjectModel(IELTSExamAttempt.name) private attemptModel: Model<IELTSExamAttemptDocument>,
//         @InjectModel(IELTSExam.name) private examModel: Model<IELTSExamDocument>,
//     ) { }

//     async generateUserReport(userId: string, attemptId: string): Promise<any> {
//         try {
//             const attempt = await this.attemptModel.findOne({ _id: attemptId, userId }).populate('examId').lean();

//             if (!attempt) {
//                 throw new NotFoundException('Attempt topilmadi');
//             }

//             const exam = attempt.examId as any;

//             return {
//                 attempt: {
//                     id: attempt._id,
//                     examTitle: exam.title,
//                     attemptNumber: attempt.attemptNumber,
//                     submittedAt: attempt.submittedAt,
//                     timeSpent: `${attempt.totalTimeSpentMinutes} daqiqa`,
//                     status: attempt.status,
//                 },
//                 scores: {
//                     overall: attempt.overallBandScore || 'Not graded yet',
//                     reading: attempt.readingBandScore || '-',
//                     listening: attempt.listeningBandScore || '-',
//                     writing: attempt.writingBandScore || '-',
//                     speaking: attempt.speakingBandScore || '-',
//                 },
//                 detailedResults: {
//                     reading: this.generateReadingReport(attempt),
//                     listening: this.generateListeningReport(attempt),
//                     writing: this.generateWritingReport(attempt),
//                     speaking: this.generateSpeakingReport(attempt),
//                 },
//                 recommendations: this.generateRecommendations(attempt),
//             };
//         } catch (error) {
//             this.logger.error(`Error generating report: ${error.message}`, error.stack);
//             throw error;
//         }
//     }

//     async generateCertificate(userId: string, attemptId: string): Promise<any> {
//         try {
//             const attempt = await this.attemptModel.findOne({ _id: attemptId, userId, status: EntityStatus.GRADED }).populate('examId').lean();

//             if (!attempt) {
//                 throw new NotFoundException('Graded attempt topilmadi');
//             }

//             if (!attempt.overallBandScore || attempt.overallBandScore < 4.0) {
//                 throw new BadRequestException('Sertifikat uchun band score kamida 4.0 bo\'lishi kerak');
//             }

//             const exam = attempt.examId as any;
//             const validUntil = new Date(attempt.submittedAt!);
//             validUntil.setFullYear(validUntil.getFullYear() + 2); // Valid for 2 years

//             return {
//                 certificateId: `IELTS-${attempt._id}`,
//                 userId,
//                 examInfo: {
//                     title: exam.title,
//                     type: exam.examType,
//                     module: exam.module,
//                 },
//                 issueDate: attempt.submittedAt,
//                 validUntil,
//                 scores: {
//                     overall: attempt.overallBandScore,
//                     listening: attempt.listeningBandScore,
//                     reading: attempt.readingBandScore,
//                     writing: attempt.writingBandScore,
//                     speaking: attempt.speakingBandScore,
//                 },
//             };
//         } catch (error) {
//             this.logger.error(`Error generating certificate: ${error.message}`, error.stack);
//             throw error;
//         }
//     }

//     private generateReadingReport(attempt: any): any {
//         if (!attempt.readingAnswers || attempt.readingAnswers.length === 0) {
//             return null;
//         }

//         const correct = attempt.readingAnswers.filter((a: any) => a.isCorrect).length;
//         const total = attempt.readingAnswers.length;

//         return {
//             bandScore: attempt.readingBandScore,
//             correctAnswers: correct,
//             totalQuestions: total,
//             accuracy: `${((correct / total) * 100).toFixed(1)}%`,
//         };
//     }

//     private generateListeningReport(attempt: any): any {
//         if (!attempt.listeningAnswers || attempt.listeningAnswers.length === 0) {
//             return null;
//         }

//         const correct = attempt.listeningAnswers.filter((a: any) => a.isCorrect).length;
//         const total = attempt.listeningAnswers.length;

//         return {
//             bandScore: attempt.listeningBandScore,
//             correctAnswers: correct,
//             totalQuestions: total,
//             accuracy: `${((correct / total) * 100).toFixed(1)}%`,
//         };
//     }

//     private generateWritingReport(attempt: any): any {
//         if (!attempt.writingAnswers || attempt.writingAnswers.length === 0) {
//             return null;
//         }

//         return {
//             bandScore: attempt.writingBandScore,
//             tasks: attempt.writingAnswers.map((task: any) => ({
//                 taskNumber: task.taskNumber,
//                 wordCount: task.wordCount,
//                 bandScore: task.bandScore,
//                 feedback: task.feedback,
//             })),
//         };
//     }

//     private generateSpeakingReport(attempt: any): any {
//         if (!attempt.speakingAnswers || attempt.speakingAnswers.length === 0) {
//             return null;
//         }

//         return {
//             bandScore: attempt.speakingBandScore,
//             parts: attempt.speakingAnswers.map((part: any) => ({
//                 partNumber: part.partNumber,
//                 duration: `${part.durationSeconds} soniya`,
//                 bandScore: part.bandScore,
//                 feedback: part.feedback,
//             })),
//         };
//     }

//     private generateRecommendations(attempt: any): string[] {
//         const recommendations: string[] = [];
//         const scores = [
//             { name: 'Reading', score: attempt.readingBandScore },
//             { name: 'Listening', score: attempt.listeningBandScore },
//             { name: 'Writing', score: attempt.writingBandScore },
//             { name: 'Speaking', score: attempt.speakingBandScore },
//         ].filter(s => s.score !== undefined && s.score > 0);

//         if (scores.length === 0) return recommendations;

//         const weakest = scores.reduce((min, s) => s.score! < min.score! ? s : min);
//         recommendations.push(`${weakest.name} sectioningizda ko'proq ishlash tavsiya etiladi (Band ${weakest.score})`);

//         if (attempt.overallBandScore && attempt.overallBandScore < 6.5) {
//             recommendations.push('Overall band score 6.5+ ga yetish uchun barcha sectionlarda amaliy mashqlar qiling');
//         }

//         return recommendations;
//     }
// }
