// vocabulary/vocabulary.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Vocabulary, VocabularySchema } from './schemas/vocabulary.schema';
import { VocabularyService } from './vocabulary.service';
import { VocabularyAdminController, VocabularyUserController } from './vocabulary.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Vocabulary.name, schema: VocabularySchema },
        ]),
    ],
    controllers: [
        VocabularyUserController,  // GET /api/v1/vocabulary
        VocabularyAdminController, // GET /api/v1/admin/vocabulary
    ],
    providers: [VocabularyService],
    exports: [VocabularyService],
})
export class VocabularyModule {}
