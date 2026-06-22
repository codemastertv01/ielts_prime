// decorators/require-api-path.decorator.ts
//
// Bu decorator endi faqat Swagger UI'da "access-token" belgisini ko'rsatish
// uchun ishlatiladi. Guard endi GLOBAL ishlaydi — har bir himoyalangan route
// avtomatik ravishda permission tekshiruvidan o'tadi.
//
// @Public() bilan belgilangan routelar bundan mustasno.

import { applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export const REQUIRE_API_PATH_KEY = 'require_api_path';

export interface ApiPathMeta {
    permissions?: string[];
}

/**
 * Ixtiyoriy: Swagger'da "access-token" lock ikonkasini ko'rsatish uchun
 * controller yoki handlerga qo'ying.
 *
 * Guard avtomatik ishlagani sababli bu decorator permission tekshiruviga
 * ta'sir qilmaydi — faqat hujjatlash uchun.
 */
export const RequireApiPath = (_meta: ApiPathMeta = {}): ClassDecorator & MethodDecorator =>
    applyDecorators(ApiSecurity('access-token'));
