import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Served at https://skystate.github.io/examples/syncnote/
  base: '/examples/syncnote/',
  plugins: [react(), tailwindcss()],
})
