import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import path from 'path'

const manifest = {
  manifest_version: 3,
  name: 'TeraLead - Business Data Scraper',
  version: '1.0.0',
  description: 'Extract business data from Google Maps and enrich with email addresses',
  permissions: ['storage', 'scripting', 'activeTab'],
  host_permissions: ['https://www.google.com/*', 'https://*/*', 'http://*/*'],
  background: {
    service_worker: 'src/background/service-worker.ts',
  },
  content_scripts: [
    {
      matches: ['https://www.google.com/maps/*'],
      js: ['src/content/content.ts'],
      run_at: 'document_end',
    },
  ],
  action: {
    default_popup: 'popup.html',
    default_title: 'TeraLead Business Scraper',
  },
} as any;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    crx({ manifest })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        results: path.resolve(__dirname, 'src/results/results.html')
      }
    }
  }
})
