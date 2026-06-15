// import { Model } from "mongoose";
// import { InjectModel } from "@nestjs/mongoose";
// import { Injectable, Logger } from "@nestjs/common";
// import { IELTSExam, IELTSExamAttempt, IELTSExamAttemptDocument, IELTSExamDocument } from "./schemas/ielts.schema";

// @Injectable()
// export class IELTSAnalyticsService {
//     private readonly logger = new Logger(IELTSAnalyticsService.name);

//     constructor(
//         @InjectModel(IELTSExamAttempt.name) private attemptModel: Model<IELTSExamAttemptDocument>,
//         @InjectModel(IELTSExam.name) private examModel: Model<IELTSExamDocument>,
//     ) { }

//     async getUserAnalytics(userId: string): Promise<any> {
//         try {
//             const attempts = await this.attemptModel.find({ userId, status: EntityStatus.GRADED, isDeleted: false}).lean();

//             if (attempts.length === 0) {
//                 return {
//                     totalAttempts: 0,
//                     averageOverallBandScore: 0,
//                     sectionAverages: {
//                         reading: 0,
//                         listening: 0,
//                         writing: 0,
//                         speaking: 0,
//                     },
//                     progressTrend: [],
//                     strongestSection: null,
//                     weakestSection: null,
//                 };
//             }

//             const scores = {
//                 overall: attempts.filter(a => a.overallBandScore).map(a => a.overallBandScore!),
//                 reading: attempts.filter(a => a.readingBandScore).map(a => a.readingBandScore!),
//                 listening: attempts.filter(a => a.listeningBandScore).map(a => a.listeningBandScore!),
//                 writing: attempts.filter(a => a.writingBandScore).map(a => a.writingBandScore!),
//                 speaking: attempts.filter(a => a.speakingBandScore).map(a => a.speakingBandScore!),
//             };

//             const sectionAverages = {
//                 reading: this.calculateAverage(scores.reading),
//                 listening: this.calculateAverage(scores.listening),
//                 writing: this.calculateAverage(scores.writing),
//                 speaking: this.calculateAverage(scores.speaking),
//             };

//             const sections = Object.entries(sectionAverages).filter(([_, score]) => score > 0).map(([name, score]) => ({ name, score }));

//             const strongest = sections.length > 0 ? sections.reduce((max, s) => s.score > max.score ? s : max) : null;
//             const weakest = sections.length > 0 ? sections.reduce((min, s) => s.score < min.score ? s : min) : null;

//             return {
//                 totalAttempts: attempts.length,
//                 averageOverallBandScore: this.calculateAverage(scores.overall),
//                 sectionAverages,
//                 strongestSection: strongest,
//                 weakestSection: weakest,
//                 progressTrend: attempts
//                     .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
//                     .slice(-10)
//                     .map(a => ({
//                         attemptDate: a.createdAt,
//                         attemptNumber: a.attemptNumber,
//                         overallBandScore: a.overallBandScore,
//                         readingBandScore: a.readingBandScore,
//                         listeningBandScore: a.listeningBandScore,
//                         writingBandScore: a.writingBandScore,
//                         speakingBandScore: a.speakingBandScore,
//                     })),
//             };
//         } catch (error) {
//             this.logger.error(`Error getting user analytics: ${error.message}`, error.stack);
//             throw error;
//         }
//     }

//     async getExamStatistics(examId: string): Promise<any> {
//         try {
//             const attempts = await this.attemptModel.find({ examId, status: EntityStatus.GRADED, isDeleted: false}).lean();

//             if (attempts.length === 0) {
//                 return {
//                     totalAttempts: 0,
//                     completedAttempts: 0,
//                     averageOverallBandScore: 0,
//                     averageCompletionTime: 0,
//                     scoreDistribution: {},
//                     topScorers: [],
//                 };
//             }

//             const overallScores = attempts.filter(a => a.overallBandScore).map(a => a.overallBandScore!);
//             const completionTimes = attempts.map(a => a.totalTimeSpentMinutes);

//             const scoreDistribution: Record<string, number> = {};
//             overallScores.forEach(score => {
//                 const range = this.getScoreRange(score);
//                 scoreDistribution[range] = (scoreDistribution[range] || 0) + 1;
//             });

//             return {
//                 totalAttempts: attempts.length,
//                 averageOverallBandScore: this.calculateAverage(overallScores),
//                 averageCompletionTime: this.calculateAverage(completionTimes),
//                 scoreDistribution,
//                 topScorers: attempts
//                     .sort((a, b) => (b.overallBandScore || 0) - (a.overallBandScore || 0))
//                     .slice(0, 10)
//                     .map(a => ({
//                         userId: a.userId,
//                         attemptNumber: a.attemptNumber,
//                         overallBandScore: a.overallBandScore,
//                         submittedAt: a.submittedAt,
//                     })),
//             };
//         } catch (error) {
//             this.logger.error(`Error getting exam statistics: ${error.message}`, error.stack);
//             throw error;
//         }
//     }

//     private calculateAverage(numbers: number[]): number {
//         if (numbers.length === 0) return 0;
//         const sum = numbers.reduce((acc, val) => acc + val, 0);
//         return Math.round((sum / numbers.length) * 2) / 2;
//     }

//     private getScoreRange(score: number): string {
//         if (score >= 8.5) return '8.5-9.0';
//         if (score >= 8.0) return '8.0-8.5';
//         if (score >= 7.5) return '7.5-8.0';
//         if (score >= 7.0) return '7.0-7.5';
//         if (score >= 6.5) return '6.5-7.0';
//         if (score >= 6.0) return '6.0-6.5';
//         if (score >= 5.5) return '5.5-6.0';
//         if (score >= 5.0) return '5.0-5.5';
//         return '< 5.0';
//     }
// }
