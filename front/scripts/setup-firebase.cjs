#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const ENV_PATH = path.join(__dirname, '..', '.env.local');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

function openBrowser(url) {
    try { execSync(`start "" "${url}"`, { stdio: 'ignore' }); } catch {}
}

function parseConfig(raw) {
    try {
        const m = raw.match(/\{[\s\S]*\}/);
        if (!m) return null;
        const cfg = {};
        for (const k of ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId']) {
            const match = m[0].match(new RegExp(`["']?${k}["']?\\s*:\\s*["']([^"']+)["']`));
            if (match) cfg[k] = match[1];
        }
        return cfg.apiKey ? cfg : null;
    } catch { return null; }
}

async function main() {
    console.log('\n🔥 Firebase Setup — IELTS PRIME\n');
    console.log('Brauzer ochilmoqda: console.firebase.google.com\n');
    openBrowser('https://console.firebase.google.com');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Quyidagi qadamlarni bajaring:\n');
    console.log('  1. "Add project" → loyiha nomi: ielts-prime → yarating');
    console.log('  2. Loyiha ochilgach: "</>" (Web app) ikonkasini bosing');
    console.log('  3. App nickname: ielts-prime → "Register app"');
    console.log('  4. Ochilgan "firebaseConfig = { ... }" kodni nusxa oling');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await ask('  Bajarib bo\'ldingizmi? Enter bosing...');

    console.log('\n  firebaseConfig kodini paste qiling (Enter, keyin Ctrl+Z, keyin yana Enter):');
    console.log('  Misol: { apiKey: "AIza...", authDomain: "...", ... }\n  > ');

    // Multi-line input
    let raw = '';
    const inputRl = readline.createInterface({ input: process.stdin });
    for await (const line of inputRl) {
        raw += line + '\n';
        if (raw.includes('}')) break;
    }

    const cfg = parseConfig(raw);
    if (!cfg) {
        console.error('\n❌ Config noto\'g\'ri. Qaytadan urining.');
        rl.close();
        process.exit(1);
    }

    const envContent = `# Firebase (${new Date().toLocaleString()})
NEXT_PUBLIC_FIREBASE_API_KEY=${cfg.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${cfg.authDomain || ''}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${cfg.projectId || ''}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${cfg.storageBucket || ''}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${cfg.messagingSenderId || ''}
NEXT_PUBLIC_FIREBASE_APP_ID=${cfg.appId || ''}
`;
    fs.writeFileSync(ENV_PATH, envContent);

    console.log('\n✅ .env.local yozildi!\n');
    console.log(envContent);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Oxirgi qadam — Google Sign-in yoqing:');
    console.log(`  Authentication → Sign-in method → Google → Enable → Save`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    openBrowser(`https://console.firebase.google.com/project/${cfg.projectId}/authentication/providers`);

    console.log('  Keyin: npm run dev\n');
    rl.close();
}

main().catch(e => { console.error('❌', e.message); rl.close(); process.exit(1); });
