import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

// The app's own version comes from package.json, so there is one number to raise for each release.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
    plugins: [react()],
    define: { __APP_VERSION__: JSON.stringify(pkg.version) },
    base: './',
    build: {
        outDir: process.env.APPDEPLOY_VITE_OUT_DIR || 'dist',
        sourcemap: process.env.APPDEPLOY_VITE_SOURCEMAP === 'hidden' ? 'hidden' : false,
        target: ['chrome87', 'edge88', 'firefox78', 'safari14'],
    },
});
