import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { prerenderPreview } from './scripts/preview-prerender.mjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), prerenderPreview()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react'
          }
          if (id.includes('node_modules/@supabase/supabase-js')) {
            return 'supabase'
          }
          return undefined
        },
      },
    },
  },
})
