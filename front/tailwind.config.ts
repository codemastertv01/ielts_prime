import type { Config } from 'tailwindcss'

const config: Config = {
    // ✅ MUHIM: dark mode 'class' strategiyasi
    darkMode: 'class',

    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],

    plugins: [],
}

export default config
