import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8181,
  },
  // For production builds the Jellyfin URL/token are baked as placeholders and
  // swapped in at container start by docker-entrypoint.sh. In dev we let Vite
  // load the real values from .env so `npm run dev` can connect to Jellyfin.
  // NOTE: keep both vars referenced from exactly one statically-imported module
  // (src/services/jellyfin.ts) so the literals land predictably in assets/*.js.
  ...(command === 'build'
    ? {
        define: {
          'import.meta.env.VITE_JELLYFIN_URL': '"__JELLYFIN_URL__"',
          'import.meta.env.VITE_JELLYFIN_TOKEN': '"__JELLYFIN_TOKEN__"',
        },
      }
    : {}),
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        // Every JS chunk must live under assets/ (with a .js extension) so the
        // entrypoint's `sed` over assets/*.js catches the placeholder wherever
        // Rollup lands it. Hashed for cache-busting.
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
}))
