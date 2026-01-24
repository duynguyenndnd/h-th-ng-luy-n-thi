import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', ['VITE_']);
    
    // Log environment variables for debugging
    console.log('Vite Build Mode:', mode);
    console.log('VITE_GEMINI_API_KEY available:', !!env.VITE_GEMINI_API_KEY);
    console.log('VITE_DEEPSEEK_API_KEY available:', !!env.VITE_DEEPSEEK_API_KEY);
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: false,
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
        'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(env.VITE_DEEPSEEK_API_KEY || ''),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
        'process.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(env.VITE_DEEPSEEK_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
