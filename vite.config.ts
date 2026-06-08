import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  server: {
    host: '0.0.0.0',
    port: 8181
  },
  // For production builds the values are baked as placeholders and swapped in at
  // container start by docker-entrypoint.sh. In dev we let Vite load the real
  // values from .env so `npm run dev` can actually connect to Jellyfin.
  ...(command === 'build' ? {
    define: {
      'import.meta.env.VITE_JELLYFIN_URL': '"__JELLYFIN_URL__"',
      'import.meta.env.VITE_JELLYFIN_TOKEN': '"__JELLYFIN_TOKEN__"',
    },
  } : {}),
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
}))
