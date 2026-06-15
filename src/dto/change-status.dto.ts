import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EntityStatus } from './entity-status.dto';

export class ChangeStatusDto {
    @IsEnum(EntityStatus, { message: "Status noto'g'ri" })
    status: EntityStatus;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
