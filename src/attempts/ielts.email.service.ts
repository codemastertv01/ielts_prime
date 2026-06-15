// attempts/ielts.email.service.ts
import { Injectable, Logger } from '@nestjs/common';

// ─── Email payload types ───────────────────────────────────────────────────────

export interface IELTSResultEmailPayload {
    // User info
    userEmail: string;
    userName: string;
    // Exam info
    examTitle: string;
    examType: string;
    module: string;
    attemptNumber: number;
    // Scores
    overallBandScore: number;
    readingBandScore?: number;
    listeningBandScore?: number;
    writingBandScore?: number;
    speakingBandScore?: number;
    percentageScore: number;
    isPassed: boolean;
    passingScore: number;
    // Writing detail feedback
    writingFeedback?: Array<{
        taskNumber: number;
        bandScore: number;
        criteriaScores?: {
            taskAchievement?: number;
            coherenceCohesion?: number;
            lexicalResource?: number;
            grammaticalRange?: number;
        };
        feedback?: string;
    }>;
    // Speaking detail feedback
    speakingFeedback?: Array<{
        partNumber: number;
        bandScore: number;
        criteriaScores?: {
            fluencyCoherence?: number;
            lexicalResource?: number;
            grammaticalRange?: number;
            pronunciation?: number;
        };
        feedback?: string;
    }>;
    // Dates
    startedAt: Date;
    submittedAt?: Date;
    gradedAt?: Date;
    // Result link
    resultUrl: string;
}

export interface IELTSGradingNotificationPayload {
    adminEmail: string;
    adminName: string;
    attemptId: string;
    examTitle: string;
    userName: string;
    userEmail: string;
    sectionsToGrade: string[];
    submittedAt: Date;
    resultUrl: string;
}

// ─── Email template builder ────────────────────────────────────────────────────

@Injectable()
export class IELTSEmailService {
    private readonly logger = new Logger(IELTSEmailService.name);

    // ════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ════════════════════════════════════════════════════════

    /**
     * Foydalanuvchiga to'liq natija emaili yuboradi.
     * IELTS rasmiysiga o'xshash formatda: overall band + har bir section band.
     */
    async sendResultEmail(payload: IELTSResultEmailPayload): Promise<void> {
        try {
            const subject = `Sizning IELTS natijangiz: Band ${payload.overallBandScore} — ${payload.examTitle}`;
            const html = this.buildResultHtml(payload);
            const text = this.buildResultText(payload);

            await this.sendEmail({
                to: payload.userEmail,
                subject,
                html,
                text,
            });

            this.logger.log(`Natija emaili yuborildi: user=${payload.userEmail} band=${payload.overallBandScore}`);
        } catch (err) {
            this.logger.error(`sendResultEmail xatosi: ${err.message}`, err.stack);
        }
    }

    /**
     * Foydalanuvchiga baholash boshlanganligi haqida xabar yuboradi.
     * Writing yoki Speaking topshirilganda darhol chaqiriladi.
     */
    async sendGradingStartedEmail(payload: { userEmail: string; userName: string; examTitle: string; sectionsToGrade: string[]; expectedDays: number }): Promise<void> {
        try {
            const subject = `Imtihon topshirildi — Baholash boshlandi: ${payload.examTitle}`;
            const html = this.buildGradingStartedHtml(payload);
            await this.sendEmail({ to: payload.userEmail, subject, html });
            this.logger.log(`Grading started emaili yuborildi: user=${payload.userEmail}`);
        } catch (err) {
            this.logger.error(`sendGradingStartedEmail xatosi: ${err.message}`);
        }
    }

    /**
     * Adminlarga baholash kerakligi haqida xabar yuboradi.
     */
    async sendGradingRequiredEmail(payload: IELTSGradingNotificationPayload): Promise<void> {
        try {
            const subject = `[BAHOLASH KERAK] ${payload.examTitle} — ${payload.userName}`;
            const html = this.buildGradingRequiredHtml(payload);
            await this.sendEmail({ to: payload.adminEmail, subject, html });
            this.logger.log(`Admin grading emaili yuborildi: admin=${payload.adminEmail}`);
        } catch (err) {
            this.logger.error(`sendGradingRequiredEmail xatosi: ${err.message}`);
        }
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — HTML Builders
    // ════════════════════════════════════════════════════════

    private buildResultHtml(p: IELTSResultEmailPayload): string {
        const bandColor = this.getBandColor(p.overallBandScore);
        const statusText = p.isPassed ? '✅ Muvaffaqiyatli' : '❌ Minimal ball yetmadi';
        const statusColor = p.isPassed ? '#16a34a' : '#dc2626';

        const sectionRows = this.buildSectionRows(p);
        const writingDetail = this.buildWritingDetailHtml(p.writingFeedback);
        const speakingDetail = this.buildSpeakingDetailHtml(p.speakingFeedback);

        return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IELTS Natija</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:40px 40px 32px;text-align:center;">
            <p style="margin:0 0 8px;color:#93c5fd;font-size:13px;letter-spacing:2px;text-transform:uppercase;">IELTS TEST NATIJALARI</p>
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">${p.examTitle}</h1>
            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">${p.examType} · ${p.module} · Urinish #${p.attemptNumber}</p>
          </td>
        </tr>

        <!-- OVERALL BAND -->
        <tr>
          <td style="padding:40px 40px 24px;text-align:center;">
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Umumiy Band Score</p>
            <div style="display:inline-block;width:120px;height:120px;border-radius:50%;background:${bandColor};line-height:120px;text-align:center;margin:12px auto;">
              <span style="font-size:52px;font-weight:800;color:#fff;">${p.overallBandScore}</span>
            </div>
            <p style="margin:12px 0 4px;font-size:16px;font-weight:600;color:${statusColor};">${statusText}</p>
            <p style="margin:0;color:#9ca3af;font-size:13px;">Minimal o'tish bali: ${p.passingScore} · Foizda: ${p.percentageScore}%</p>
          </td>
        </tr>

        <!-- SECTION SCORES -->
        <tr>
          <td style="padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td colspan="2" style="padding-bottom:16px;">
                  <h2 style="margin:0;font-size:16px;font-weight:700;color:#111827;border-bottom:2px solid #e5e7eb;padding-bottom:12px;">Section Natijalari</h2>
                </td>
              </tr>
              ${sectionRows}
            </table>
          </td>
        </tr>

        ${writingDetail}
        ${speakingDetail}

        <!-- DATE INFO -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" style="background:#f9fafb;border-radius:8px;padding:16px;" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#6b7280;font-size:13px;padding:4px 0;">📅 Boshlangan:</td>
                <td style="color:#374151;font-size:13px;text-align:right;padding:4px 0;">${this.formatDate(p.startedAt)}</td>
              </tr>
              ${p.submittedAt ? `<tr><td style="color:#6b7280;font-size:13px;padding:4px 0;">📤 Topshirilgan:</td><td style="color:#374151;font-size:13px;text-align:right;padding:4px 0;">${this.formatDate(p.submittedAt)}</td></tr>` : ''}
              ${p.gradedAt ? `<tr><td style="color:#6b7280;font-size:13px;padding:4px 0;">✅ Baholangan:</td><td style="color:#374151;font-size:13px;text-align:right;padding:4px 0;">${this.formatDate(p.gradedAt)}</td></tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- CTA BUTTON -->
        <tr>
          <td style="padding:0 40px 40px;text-align:center;">
            <a href="${p.resultUrl}"
               style="display:inline-block;background:#2563eb;color:#fff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;">
              To'liq natijani ko'rish →
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Bu email avtomatik yuborildi. Savollar uchun support@ielts-platform.uz ga murojaat qiling.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
    }

    private buildSectionRows(p: IELTSResultEmailPayload): string {
        const sections = [
            { name: 'Reading', score: p.readingBandScore, icon: '📖' },
            { name: 'Listening', score: p.listeningBandScore, icon: '🎧' },
            { name: 'Writing', score: p.writingBandScore, icon: '✍️' },
            { name: 'Speaking', score: p.speakingBandScore, icon: '🎤' },
        ].filter((s) => s.score != null);

        return sections
            .map(
                (s) => `
          <tr>
            <td style="padding:10px 0;font-size:14px;color:#374151;">${s.icon} ${s.name}</td>
            <td style="padding:10px 0;text-align:right;">
              <span style="background:${this.getBandColor(s.score!)};color:#fff;padding:4px 14px;border-radius:20px;font-size:14px;font-weight:700;">${s.score}</span>
            </td>
          </tr>`
            )
            .join('');
    }

    private buildWritingDetailHtml(feedback?: IELTSResultEmailPayload['writingFeedback']): string {
        if (!feedback?.length) return '';
        const rows = feedback
            .map(
                (t) => `
          <tr>
            <td colspan="2" style="padding:12px 0 4px;">
              <strong style="color:#374151;">Task ${t.taskNumber}</strong>
              <span style="background:${this.getBandColor(t.bandScore)};color:#fff;padding:2px 10px;border-radius:12px;font-size:13px;margin-left:8px;">${t.bandScore}</span>
            </td>
          </tr>
          ${
              t.criteriaScores
                  ? `
          <tr>
            <td style="color:#6b7280;font-size:12px;padding:2px 0;">Task Achievement</td>
            <td style="font-size:12px;text-align:right;color:#374151;">${t.criteriaScores.taskAchievement ?? '-'}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:12px;padding:2px 0;">Coherence & Cohesion</td>
            <td style="font-size:12px;text-align:right;color:#374151;">${t.criteriaScores.coherenceCohesion ?? '-'}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:12px;padding:2px 0;">Lexical Resource</td>
            <td style="font-size:12px;text-align:right;color:#374151;">${t.criteriaScores.lexicalResource ?? '-'}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:12px;padding:2px 0;">Grammatical Range</td>
            <td style="font-size:12px;text-align:right;color:#374151;">${t.criteriaScores.grammaticalRange ?? '-'}</td>
          </tr>`
                  : ''
          }
          ${t.feedback ? `<tr><td colspan="2" style="padding:8px 0;font-size:13px;color:#4b5563;font-style:italic;">"${t.feedback}"</td></tr>` : ''}`
            )
            .join('');

        return `
        <tr>
          <td style="padding:0 40px 24px;">
            <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111827;">Writing Batafsil Natija</h3>
            <table width="100%" style="background:#f0f9ff;border-radius:8px;padding:16px;" cellpadding="0" cellspacing="0">
              ${rows}
            </table>
          </td>
        </tr>`;
    }

    private buildSpeakingDetailHtml(feedback?: IELTSResultEmailPayload['speakingFeedback']): string {
        if (!feedback?.length) return '';
        const rows = feedback
            .map(
                (p) => `
          <tr>
            <td colspan="2" style="padding:12px 0 4px;">
              <strong style="color:#374151;">Part ${p.partNumber}</strong>
              <span style="background:${this.getBandColor(p.bandScore)};color:#fff;padding:2px 10px;border-radius:12px;font-size:13px;margin-left:8px;">${p.bandScore}</span>
            </td>
          </tr>
          ${
              p.criteriaScores
                  ? `
          <tr>
            <td style="color:#6b7280;font-size:12px;padding:2px 0;">Fluency & Coherence</td>
            <td style="font-size:12px;text-align:right;color:#374151;">${p.criteriaScores.fluencyCoherence ?? '-'}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:12px;padding:2px 0;">Lexical Resource</td>
            <td style="font-size:12px;text-align:right;color:#374151;">${p.criteriaScores.lexicalResource ?? '-'}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:12px;padding:2px 0;">Grammatical Range</td>
            <td style="font-size:12px;text-align:right;color:#374151;">${p.criteriaScores.grammaticalRange ?? '-'}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:12px;padding:2px 0;">Pronunciation</td>
            <td style="font-size:12px;text-align:right;color:#374151;">${p.criteriaScores.pronunciation ?? '-'}</td>
          </tr>`
                  : ''
          }
          ${p.feedback ? `<tr><td colspan="2" style="padding:8px 0;font-size:13px;color:#4b5563;font-style:italic;">"${p.feedback}"</td></tr>` : ''}`
            )
            .join('');

        return `
        <tr>
          <td style="padding:0 40px 24px;">
            <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111827;">Speaking Batafsil Natija</h3>
            <table width="100%" style="background:#f0fdf4;border-radius:8px;padding:16px;" cellpadding="0" cellspacing="0">
              ${rows}
            </table>
          </td>
        </tr>`;
    }

    private buildGradingStartedHtml(p: { userName: string; examTitle: string; sectionsToGrade: string[]; expectedDays: number }): string {
        const sections = p.sectionsToGrade.map((s) => `<li style="padding:4px 0;">${s}</li>`).join('');
        return `
<table width="100%" style="font-family:Arial,sans-serif;background:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="600" style="background:#fff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#1e3a8a;padding:32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">Imtihon topshirildi ✅</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    <p>Assalomu alaykum, <strong>${p.userName}</strong>!</p>
    <p>Sizning <strong>${p.examTitle}</strong> imtihon javobi muvaffaqiyatli qabul qilindi.</p>
    <p>Quyidagi bo'limlar baholanadi:</p>
    <ul>${sections}</ul>
    <p>Baholash taxminan <strong>${p.expectedDays} ish kuni</strong> davomida yakunlanadi.</p>
    <p>Natija tayyor bo'lgach, email orqali xabar beriladi.</p>
  </td></tr>
</table>
</td></tr>
</table>`;
    }

    private buildGradingRequiredHtml(p: IELTSGradingNotificationPayload): string {
        const sections = p.sectionsToGrade.map((s) => `<li>${s}</li>`).join('');
        return `
<table width="100%" style="font-family:Arial,sans-serif;background:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="600" style="background:#fff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#dc2626;padding:32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:20px;">⚠️ Baholash Kerak</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    <p>Salom, <strong>${p.adminName}</strong>!</p>
    <table width="100%" style="background:#fef2f2;border-radius:8px;padding:16px;">
      <tr><td style="color:#6b7280;font-size:13px;">O'quvchi:</td><td style="font-weight:600;">${p.userName} (${p.userEmail})</td></tr>
      <tr><td style="color:#6b7280;font-size:13px;">Imtihon:</td><td>${p.examTitle}</td></tr>
      <tr><td style="color:#6b7280;font-size:13px;">Topshirilgan:</td><td>${this.formatDate(p.submittedAt)}</td></tr>
    </table>
    <p>Baholanishi kerak bo'lgan bo'limlar:</p>
    <ul>${sections}</ul>
    <p style="text-align:center;margin-top:24px;">
      <a href="${p.resultUrl}" style="background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Baholashga o'tish →</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>`;
    }

    private buildResultText(p: IELTSResultEmailPayload): string {
        return [`IELTS NATIJANGIZ — ${p.examTitle}`, ``, `Salom, ${p.userName}!`, ``, `Umumiy Band Score: ${p.overallBandScore}`, `Holat: ${p.isPassed ? 'Muvaffaqiyatli' : 'Minimal ball yetmadi'} (minimal: ${p.passingScore})`, ``, p.readingBandScore != null ? `Reading: ${p.readingBandScore}` : '', p.listeningBandScore != null ? `Listening: ${p.listeningBandScore}` : '', p.writingBandScore != null ? `Writing: ${p.writingBandScore}` : '', p.speakingBandScore != null ? `Speaking: ${p.speakingBandScore}` : '', ``, `To'liq natija: ${p.resultUrl}`].filter(Boolean).join('\n');
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Transport
    // ════════════════════════════════════════════════════════

    /**
     * Email yuborish.
     * Nodemailer, SendGrid, Amazon SES yoki boshqa transport bilan almashtiring.
     * Hozirda faqat log yozadi — real transportni shu yerga qo'shing.
     */
    private async sendEmail(opts: { to: string; subject: string; html: string; text?: string }): Promise<void> {
        // TODO: Replace with real email transport
        // Example (Nodemailer):
        //
        // const transporter = createTransport({
        //   host: process.env.SMTP_HOST,
        //   port: +process.env.SMTP_PORT,
        //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        // });
        // await transporter.sendMail({
        //   from: `"IELTS Platform" <no-reply@ielts-platform.uz>`,
        //   to: opts.to,
        //   subject: opts.subject,
        //   html: opts.html,
        //   text: opts.text,
        // });

        this.logger.log(`[EMAIL] To: ${opts.to} | Subject: ${opts.subject}`);
    }

    // ════════════════════════════════════════════════════════
    // PRIVATE — Utilities
    // ════════════════════════════════════════════════════════

    private getBandColor(band: number): string {
        if (band >= 8) return '#16a34a'; // green
        if (band >= 7) return '#2563eb'; // blue
        if (band >= 6) return '#7c3aed'; // purple
        if (band >= 5) return '#d97706'; // amber
        return '#dc2626'; // red
    }

    private formatDate(date: Date): string {
        return new Date(date).toLocaleString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}
