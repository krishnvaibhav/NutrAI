import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate static HTML for the landing and contact pages
    // so Google sees real content without executing JS
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
