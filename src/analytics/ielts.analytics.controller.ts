// import { Controller, Get, Param, Request, UseGuards } from "@nestjs/common";
// import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
// import { AuthGuard } from "../guards/auth.guard";
// import { IELTSAnalyticsService } from "./ielts.analytics.service";
// import { IELTSReportService } from "./ielts.report.service";

// @ApiTags('IELTS Analytics')
// @Controller('ielts/analytics')
// @UseGuards(AuthGuard)
// @ApiBearerAuth("access-token")
// export class IELTSAnalyticsController {
//     constructor(
//         private readonly analyticsService: IELTSAnalyticsService,
//         private readonly reportService: IELTSReportService,
//     ) { }

//     @Get('user')
//     @ApiOperation({ summary: 'User analytics va progress' })
//     async getUserAnalytics(@Request() req: any) {
//         const userId = req.user.id;
//         return await this.analyticsService.getUserAnalytics(userId);
//     }

//     @Get('exam/:examId')
//     @ApiOperation({ summary: 'Exam statistikasi (Admin only)' })
//     // @UseGuards(/* AdminRoleGuard */)
//     async getExamStatistics(@Param('examId') examId: string) {
//         return await this.analyticsService.getExamStatistics(examId);
//     }

//     @Get('report/:attemptId')
//     @ApiOperation({ summary: 'Detailed user report' })
//     async getUserReport(@Param('attemptId') attemptId: string, @Request() req: any) {
//         const userId = req.user.id;
//         return await this.reportService.generateUserReport(userId, attemptId);
//     }

//     @Get('certificate/:attemptId')
//     @ApiOperation({ summary: 'Certificate yaratish' })
//     async getCertificate(@Param('attemptId') attemptId: string, @Request() req: any) {
//         const userId = req.user.id;
//         return await this.reportService.generateCertificate(userId, attemptId);
//     }
// }
