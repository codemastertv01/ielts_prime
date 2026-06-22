import { REQUIRED_SECTIONS } from '@/constants/exam';
import { QuestionTypeEnum, SpeakingPartTypeEnum, WritingTaskSubtypeEnum } from '@/types/exam';
import type { BasicInfoFormData, ListeningPart, ListeningQuestion, ReadingPassage, ReadingQuestion, SpeakingPart, SpeakingQuestion, ValidationError, WritingTask } from '@/types/exam';

// ─── Date helpers ─────────────────────────────────────────────

export function fmtDate(d?: string | Date | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function fmtShortDate(d?: string | Date | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
    });
}

/** local datetime-local string → UTC ISO string */
export function toUTC(local: string): string | undefined {
    if (!local) return undefined;
    return new Date(local).toISOString();
}

/** UTC ISO string → local datetime-local string */
export function fromUTC(utc?: string | Date | null): string {
    if (!utc) return '';
    const d = new Date(utc);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` + `T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Makers ───────────────────────────────────────────────────

export function makeReadingPassage(n: number): ReadingPassage {
    return {
        passageNumber: n,
        title: '',
        content: '',
        wordCount: 0,
        paragraphLabels: [],
        source: '',
        keywords: [],
        questionGroups: [],
        questions: [],
        totalQuestions: 0,
        totalPoints: 0,
    };
}

export function makeReadingQuestion(n: number): ReadingQuestion {
    return {
        questionNumber: n,
        type: QuestionTypeEnum.MULTIPLE_CHOICE,
        question: '',
        options: [],
        matchingPool: [],
        correctAnswer: '',
        acceptableAnswers: [],
        points: 1,
    };
}

export function makeListeningPart(n: number): ListeningPart {
    return {
        partNumber: n,
        title: '',
        context: '',
        audioUrl: '',
        durationSeconds: 0,
        isMonologue: false,
        speakerCount: 2,
        questionGroups: [],
        questions: [],
        totalQuestions: 0,
        totalPoints: 0,
    };
}

export function makeListeningQuestion(n: number): ListeningQuestion {
    return {
        questionNumber: n,
        type: QuestionTypeEnum.NOTE_COMPLETION,
        question: '',
        options: [],
        matchingPool: [],
        correctAnswer: '',
        acceptableAnswers: [],
        points: 1,
    };
}

export function makeWritingTask(idx: number): WritingTask {
    const isFirst = idx === 0;
    return {
        taskNumber: idx + 1,
        type: isFirst ? QuestionTypeEnum.TASK_1_ACADEMIC : QuestionTypeEnum.TASK_2,
        subtype: isFirst ? WritingTaskSubtypeEnum.LINE_GRAPH : WritingTaskSubtypeEnum.OPINION_ESSAY,
        prompt: '',
        letterBulletPoints: [],
        essayDirectives: [],
        minimumWords: isFirst ? 150 : 250,
        suggestedTimeMinutes: isFirst ? 20 : 40,
        maxBandScore: 9,
        assessmentCriteria: [],
    };
}

export function makeSpeakingPart(idx: number): SpeakingPart {
    const types = [SpeakingPartTypeEnum.INTRODUCTION_FAMILIAR_TOPICS, SpeakingPartTypeEnum.LONG_TURN_CUE_CARD, SpeakingPartTypeEnum.ANALYTICAL_DISCUSSION];
    return {
        partNumber: idx + 1,
        partType: types[idx] ?? SpeakingPartTypeEnum.INTRODUCTION_FAMILIAR_TOPICS,
        title: `Part ${idx + 1}`,
        durationMinutes: idx === 1 ? 4 : 5,
        topicGroups: [],
        cueCardPoints: [],
        preparationTimeSeconds: idx === 1 ? 60 : 0,
        minimumSpeakingSeconds: 60,
        maximumSpeakingSeconds: 120,
        roundingOffQuestions: [],
        questions: [],
    };
}

export function makeSpeakingQuestion(n: number): SpeakingQuestion {
    return {
        questionNumber: n,
        question: '',
        followUpQuestions: [],
        languageTips: [],
    };
}

// ─── Payload builder ──────────────────────────────────────────

export function buildPayload(basic: BasicInfoFormData, passages: ReadingPassage[], listeningParts: ListeningPart[], writingTasks: WritingTask[], speakingParts: SpeakingPart[]): Record<string, any> {
    const required = REQUIRED_SECTIONS[basic.examType] ?? [];

    const payload: Record<string, any> = {
        title: basic.title.trim(),
        description: basic.description.trim() || undefined,
        examType: basic.examType,
        module: basic.module,
        difficulty: basic.difficulty,
        totalTimeLimitMinutes: Number(basic.totalTimeLimitMinutes),
        passingScore: Number(basic.passingScore),
        isPremium: Boolean(basic.isPremium),
        price: Number(basic.price),
        tags: basic.tags
            ? basic.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
            : [],
        thumbnailUrl: basic.thumbnailUrl.trim() || undefined,
        availableFrom: basic.availableFrom ? toUTC(basic.availableFrom) : undefined,
        availableUntil: basic.availableUntil ? toUTC(basic.availableUntil) : undefined,
    };

    if (required.includes('reading')) {
        payload.readingSection = {
            isEnabled: true,
            timeLimitMinutes: 60,
            passages,
            totalQuestions: passages.reduce((s, p) => s + p.questions.length, 0),
            totalPoints: passages.reduce((s, p) => s + p.questions.reduce((ss, q) => ss + (q.points ?? 1), 0), 0),
        };
    }
    if (required.includes('listening')) {
        payload.listeningSection = {
            isEnabled: true,
            timeLimitMinutes: 30,
            transferTimeMinutes: 10,
            parts: listeningParts,
            totalQuestions: listeningParts.reduce((s, p) => s + p.questions.length, 0),
            totalPoints: listeningParts.reduce((s, p) => s + p.questions.reduce((ss, q) => ss + (q.points ?? 1), 0), 0),
        };
    }
    if (required.includes('writing')) {
        payload.writingSection = {
            isEnabled: true,
            timeLimitMinutes: 60,
            tasks: writingTasks,
        };
    }
    if (required.includes('speaking')) {
        payload.speakingSection = {
            isEnabled: true,
            timeLimitMinutes: 14,
            requiresRecording: true,
            allowRetakes: false,
            parts: speakingParts,
        };
    }

    return payload;
}

// ─── Validator ────────────────────────────────────────────────

export function validateExam(basic: BasicInfoFormData, passages: ReadingPassage[], listeningParts: ListeningPart[], writingTasks: WritingTask[], speakingParts: SpeakingPart[]): ValidationError[] {
    const errs: ValidationError[] = [];
    const required = REQUIRED_SECTIONS[basic.examType] ?? [];

    if (!basic.title.trim()) errs.push({ field: 'title', msg: 'Title majburiy' });
    if (!basic.examType) errs.push({ field: 'examType', msg: 'Exam type is required' });
    if (!basic.module) errs.push({ field: 'module', msg: 'Module majburiy' });
    if (!basic.difficulty) errs.push({ field: 'difficulty', msg: 'Difficulty majburiy' });
    if (!basic.totalTimeLimitMinutes || basic.totalTimeLimitMinutes < 1) errs.push({ field: 'totalTimeLimitMinutes', msg: 'Time chegarasi majburiy' });

    if (required.includes('reading')) {
        if (passages.length === 0) errs.push({ field: 'reading_section', msg: 'At least one reading passage is required' });
        passages.forEach((p, i) => {
            if (!p.title.trim()) errs.push({ field: `passage_${i}_title`, msg: `Passage ${i + 1}: title is required` });
            if (!p.content.trim()) errs.push({ field: `passage_${i}_content`, msg: `Passage ${i + 1}: content is required` });
            if (p.questions.length === 0) errs.push({ field: `passage_${i}_questions`, msg: `Passage ${i + 1}: at least one question is required` });
            p.questions.forEach((q, qi) => {
                if (!q.question.trim()) errs.push({ field: `passage_${i}_q${qi}_text`, msg: `Passage ${i + 1}, question ${qi + 1}: question text is required` });
                if (!q.correctAnswer) errs.push({ field: `passage_${i}_q${qi}_answer`, msg: `Passage ${i + 1}, question ${qi + 1}: correct answer is required` });
            });
        });
    }

    if (required.includes('listening')) {
        if (listeningParts.length === 0) errs.push({ field: 'listening_section', msg: 'At least one listening part is required' });
        listeningParts.forEach((p, i) => {
            if (!p.title.trim()) errs.push({ field: `lpart_${i}_title`, msg: `Listening part ${i + 1}: title is required` });
            if (!p.audioUrl.trim()) errs.push({ field: `lpart_${i}_audio`, msg: `Listening part ${i + 1}: audio URL is required` });
            if (p.questions.length === 0) errs.push({ field: `lpart_${i}_questions`, msg: `Listening part ${i + 1}: at least one question is required` });
            p.questions.forEach((q, qi) => {
                if (!q.question.trim()) errs.push({ field: `lpart_${i}_q${qi}_text`, msg: `Listening ${i + 1}, question ${qi + 1}: question text is required` });
                if (!q.correctAnswer) errs.push({ field: `lpart_${i}_q${qi}_answer`, msg: `Listening ${i + 1}, question ${qi + 1}: correct answer is required` });
            });
        });
    }

    if (required.includes('writing')) {
        if (writingTasks.length === 0) errs.push({ field: 'writing_section', msg: 'At least one writing task is required' });
        writingTasks.forEach((t, i) => {
            if (!t.prompt.trim()) errs.push({ field: `wtask_${i}_prompt`, msg: `Writing task ${i + 1}: task prompt is required` });
        });
    }

    if (required.includes('speaking')) {
        if (speakingParts.length === 0) errs.push({ field: 'speaking_section', msg: 'At least one speaking part is required' });
        speakingParts.forEach((p, i) => {
            if (p.questions.length === 0) errs.push({ field: `spart_${i}_questions`, msg: `Speaking part ${i + 1}: at least one question is required` });
            p.questions.forEach((q, qi) => {
                if (!q.question.trim()) errs.push({ field: `spart_${i}_q${qi}_text`, msg: `Speaking ${i + 1}, question ${qi + 1}: question text is required` });
            });
        });
    }

    return errs;
}

// ─── JSON → form state ────────────────────────────────────────

export function parseJsonToFormState(json: Record<string, any>) {
    const basic: BasicInfoFormData = {
        title: json.title ?? '',
        description: json.description ?? '',
        examType: json.examType ?? 'FULL_MOCK_TEST',
        module: json.module ?? 'ACADEMIC',
        difficulty: json.difficulty ?? 'BAND_6_7',
        totalTimeLimitMinutes: json.totalTimeLimitMinutes ?? 170,
        passingScore: json.passingScore ?? 5.5,
        isPremium: json.isPremium ?? false,
        price: json.price ?? 0,
        tags: Array.isArray(json.tags) ? json.tags.join(', ') : (json.tags ?? ''),
        thumbnailUrl: json.thumbnailUrl ?? '',
        availableFrom: fromUTC(json.availableFrom),
        availableUntil: fromUTC(json.availableUntil),
    };

    const passages: ReadingPassage[] = json.readingSection?.passages ?? [];
    const listeningParts: ListeningPart[] = json.listeningSection?.parts ?? [];
    const writingTasks: WritingTask[] = json.writingSection?.tasks ?? [];
    const speakingParts: SpeakingPart[] = json.speakingSection?.parts ?? [];

    return { basic, passages, listeningParts, writingTasks, speakingParts };
}
