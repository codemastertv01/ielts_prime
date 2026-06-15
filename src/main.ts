import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '1.0.0.1']);

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    // https://ielts-prime.vercel.app/

    app.enableCors({
        origin: ['http://localhost:3000', 'https://ielts-prime.vercel.app'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const config = new DocumentBuilder()
        .setTitle('IELTS API')
        .setDescription('Barcha xususiyatlar, xavfsizlik va validation bilan mukammal API hujjatlari.')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Bearer formatidagi kirish tokenini kiriting',
                in: 'header',
            },
            'access-token'
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        customSiteTitle: 'Mukammal API Hujjatlari',
    });

    const PORT = process.env.PORT || 8000;
    await app.listen(PORT);
    console.log(`Ilova ishga tushdi: http://localhost:${PORT}/api/v1`);
}
bootstrap();
