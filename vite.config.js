import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/MaLan-Ai/",
  build: {
    outDir: 'build',
  }
});
