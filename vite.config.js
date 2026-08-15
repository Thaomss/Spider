import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Spider/',
  plugins: [react()],
  server: { open: true }
});
