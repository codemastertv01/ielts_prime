import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsString, IsOptional, MaxLength } from 'class-validator';

export class BulkDeleteDto {
    @ApiPropertyOptional({ type: [String] })
    @IsArray({ message: "IDs array bo'lishi kerak" })
    @ArrayMinSize(1, { message: "Kamida 1 ta ID bo'lishi kerak" })
    @IsString({ each: true, message: "Har bir ID matn bo'lishi kerak" })
    ids: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
