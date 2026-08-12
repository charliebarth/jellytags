import { Jellyfin } from '@jellyfin/sdk'

// The ONLY module that reads the env vars. In production these two
// `import.meta.env` references are replaced by the literals `__JELLYFIN_URL__`
// / `__JELLYFIN_TOKEN__` (via the build-only `define` in vite.config.ts), which
// docker-entrypoint.sh then swaps for the real values at container start. Keep
// this module statically imported so the placeholders land in assets/*.js.
const serverUrl = import.meta.env.VITE_JELLYFIN_URL
const token = import.meta.env.VITE_JELLYFIN_TOKEN

const jellyfin = new Jellyfin({
  clientInfo: { name: 'JellyTags', version: '1.0.0' },
  deviceInfo: { name: 'Browser', id: 'browser-uuid' },
})

export const api = jellyfin.createApi(serverUrl)
api.accessToken = token

/** Base Jellyfin URL, used to build image URLs in the grid. */
export function getServerUrl(): string {
  return serverUrl
}
