// attempts/dto/submit-reading.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class SubmitReadingAnswerDto {
    @ApiProperty({ description: 'Passage raqami (1–3)', example: 1 })
    @IsInt()
    @Min(1)
    @Max(3)
    passageNumber: number;

    @ApiProperty({ description: 'Savol raqami (1–40)', example: 5 })
    @IsInt()
    @Min(1)
    @Max(40)
    questionNumber: number;

    @ApiPropertyOptional({ description: 'Bitta javob (FILL_IN, T/F/NG uchun)', example: 'TRUE' })
    @IsOptional()
    @IsString()
    answer?: string;

    @ApiPropertyOptional({ description: 'Bir nechta javob (MULTIPLE_CHOICE_MULTIPLE uchun)', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    multipleAnswers?: string[];
}

export class SubmitReadingSectionDto {
    @ApiProperty({ type: [SubmitReadingAnswerDto], description: 'Barcha reading javoblari' })
    @IsArray()
    @ArrayMinSize(1, { message: 'Kamida 1 ta javob kerak' })
    @ValidateNested({ each: true })
    @Type(() => SubmitReadingAnswerDto)
    answers: SubmitReadingAnswerDto[];
}

// attempts/dto/submit-listening.dto.ts
export class SubmitListeningAnswerDto {
    @ApiProperty({ description: 'Part raqami (1–4)', example: 1 })
    @IsInt()
    @Min(1)
    @Max(4)
    partNumber: number;

    @ApiProperty({ description: 'Savol raqami (1–40)', example: 3 })
    @IsInt()
    @Min(1)
    @Max(40)
    questionNumber: number;

    @ApiPropertyOptional({ description: 'Bitta javob', example: 'London' })
    @IsOptional()
    @IsString()
    answer?: string;

    @ApiPropertyOptional({ description: 'Bir nechta javob', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    multipleAnswers?: string[];
}

export class SubmitListeningSectionDto {
    @ApiProperty({ type: [SubmitListeningAnswerDto] })
    @IsArray()
    @ArrayMinSize(1, { message: 'Kamida 1 ta javob kerak' })
    @ValidateNested({ each: true })
    @Type(() => SubmitListeningAnswerDto)
    answers: SubmitListeningAnswerDto[];
}

// attempts/dto/submit-writing.dto.ts
export class SubmitWritingTaskDto {
    @ApiProperty({ description: 'Task raqami (1 yoki 2)', example: 1 })
    @IsNumber()
    @Min(1)
    @Max(2)
    taskNumber: number;

    @ApiProperty({ description: 'Essay / letter matni', example: 'The chart shows...' })
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class SubmitWritingSectionDto {
    @ApiProperty({ type: [SubmitWritingTaskDto], description: '1 yoki 2 ta writing task' })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(2)
    @ValidateNested({ each: true })
    @Type(() => SubmitWritingTaskDto)
    tasks: SubmitWritingTaskDto[];
}

// attempts/dto/submit-speaking.dto.ts
export class SubmitSpeakingPartDto {
    @ApiProperty({ description: 'Part raqami (1–3)', example: 1 })
    @IsInt()
    @Min(1)
    @Max(3)
    partNumber: number;

    @ApiProperty({ description: 'Firebase / S3 recording URL', example: 'https://storage.example.com/rec.webm' })
    @IsString()
    recordingUrl: string;

    @ApiProperty({ description: 'Recording davomiyligi (soniya)', example: 120 })
    @IsNumber()
    @Min(1)
    durationSeconds: number;
}

export class SubmitSpeakingSectionDto {
    @ApiProperty({ type: [SubmitSpeakingPartDto], description: '1–3 ta speaking part' })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    @ValidateNested({ each: true })
    @Type(() => SubmitSpeakingPartDto)
    parts: SubmitSpeakingPartDto[];
}
