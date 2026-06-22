'use client';
import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { createClient } from '@supabase/supabase-js';


// ─── Supabase Storage ─────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'ielts-media';

export type UploadType = 'audio' | 'image';

export interface UploadProgress {
    percent: number;
    state: 'running' | 'paused' | 'error' | 'success';
}

/** Supabase Storage ga fayl yuklash */
// export async function uploadFile(file: File, type: UploadType, onProgress?: (p: UploadProgress) => void): Promise<string> {
//     const folder = type === 'audio' ? 'audio' : 'images';
//     const ext = file.name.split('.').pop();
//     const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

//     onProgress?.({ percent: 10, state: 'running' });

//     const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
//         cacheControl: '3600',
//         upsert: false,
//     });

//     if (error) throw new Error(error.message);

//     onProgress?.({ percent: 100, state: 'success' });

//     const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
//     return data.publicUrl;
// }

export async function uploadFile(file: File, type: UploadType, onProgress?: (p: UploadProgress) => void): Promise<string> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    // 🔥 folderni boshqaramiz
    formData.append('folder', type === 'audio' ? 'ielts/audio' : 'ielts/images');

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded * 100) / event.total);
                onProgress?.({ percent, state: 'running' });
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                onProgress?.({ percent: 100, state: 'success' });
                resolve(data.secure_url); // 🔥 URL qaytadi
            } else {
                reject('Upload failed');
            }
        };

        xhr.onerror = () => reject('Upload error');

        xhr.send(formData);
    });
}

/** Supabase Storage dan fayl o'chirish */
export async function deleteFile(url: string): Promise<void> {
    try {
        const path = url.split(`/${BUCKET}/`)[1];
        if (path) await supabase.storage.from(BUCKET).remove([path]);
    } catch {
        // ignore
    }
}
