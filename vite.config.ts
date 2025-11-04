import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'fs';

const updateSW = () => {
    return {
        name: 'update-sw',
        writeBundle: () => {
            const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
            const version = packageJson.version;
            const cacheName = `pats-memo-cache-v${version}`;
            const assets = readdirSync('./dist', { recursive: true })
                .filter(file => lstatSync(`./dist/${file}`).isFile())
                .map(file => `/${file.replace(/\\/g, '/')}`);
            let swContent = readFileSync('./dist/sw.js', 'utf-8');
            swContent = swContent.replace('__CACHE_VERSION__', cacheName);
            swContent = swContent.replace('__ASSETS__', JSON.stringify(assets));
            writeFileSync('./dist/sw.js', swContent);
        }
    }
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        updateSW()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
