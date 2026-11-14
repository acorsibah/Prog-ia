import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuracao do Vite para o aplicativo ViraCorpus
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
});
