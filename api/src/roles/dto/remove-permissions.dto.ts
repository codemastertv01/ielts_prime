import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsString } from 'class-validator';

export class RemovePermissionsDto {
    @ApiProperty({
        type: [String],
        example: ['64f1a2b3c4d5e6f7a8b9c0d1'],
        description: "Olib tashlanishi kerak bo'lgan permission ObjectId-lar",
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Kamida 1 ta permission ID kerak' })
    @ArrayUnique({ message: 'Permission ID-lar takrorlanmasligi kerak' })
    @IsString({ each: true })
    permissionIds: string[];
}
