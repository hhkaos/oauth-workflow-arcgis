import { defineConfig } from 'vite'

export default defineConfig({
  // Slidev 53's lightningcss minifier chokes on its own core styles (fails even on an empty deck)
  build: { cssMinify: false },
})
