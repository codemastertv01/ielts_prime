import { ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from './entity-status.dto';
import { MetadataInfo } from './metadata-info.dto';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export interface StatusSchedule {
    scheduledStatus: EntityStatus;
    scheduledAt: Date;
    reason?: string;
    setBy: MetadataInfo;
}

export class ScheduleStatusDto {
    @ApiPropertyOptional({ enum: EntityStatus })
    @IsNotEmpty()
    @IsEnum(EntityStatus)
    status: EntityStatus;

    @ApiPropertyOptional({ example: '2025-12-01T09:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    scheduledAt: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    reason?: string;
}
