import { Jellyfin } from '@jellyfin/sdk'
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api'
import { getItemUpdateApi } from '@jellyfin/sdk/lib/utils/api/item-update-api'
import { getSystemApi } from '@jellyfin/sdk/lib/utils/api/system-api'
import { getUserApi } from '@jellyfin/sdk/lib/utils/api/user-api'
import { getUserViewsApi } from '@jellyfin/sdk/lib/utils/api/user-views-api'
import { BaseItemKind, ItemFields } from '@jellyfin/sdk/lib/generated-client/models'
import { mergeValues, pickAdminUser } from '@/lib/tags'
import type { ApplyMode, EditField, MediaItem, SourceLibrary } from '@/types'

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

const api = jellyfin.createApi(serverUrl)
api.accessToken = token

const itemsApi = getItemsApi(api)
const updateApi = getItemUpdateApi(api)
const systemApi = getSystemApi(api)
const userApi = getUserApi(api)
const userViewsApi = getUserViewsApi(api)

/** Base Jellyfin URL, used to build image URLs in the grid. */
export function getServerUrl(): string {
  return serverUrl
}

/** Verify connectivity and resolve the admin user id. Throws on failure. */
export async function resolveAdminUserId(): Promise<string> {
  await systemApi.getPublicSystemInfo()

  const usersRes = await userApi.getUsers()
  const users = usersRes.data ?? []
  if (users.length === 0) {
    throw new Error('No users found. Ensure your API Token has admin permissions.')
  }

  const id = pickAdminUser(users)?.Id
  if (!id) throw new Error('Could not resolve a user id.')
  return id
}

const LIBRARY_FIELDS = [ItemFields.Tags, ItemFields.Genres, ItemFields.DateCreated]
const LIBRARY_TYPES = [BaseItemKind.Movie, BaseItemKind.Series]

/** Fetch every Movie/Series across the user's libraries, deduped by Id (first
 *  wins) and tagged with their source library. Falls back to a flat recursive
 *  fetch when the server returns no views. */
export async function fetchLibrary(
  userId: string,
): Promise<{ items: MediaItem[]; libraries: SourceLibrary[] }> {
  const viewsRes = await userViewsApi.getUserViews({ userId })
  const views = (viewsRes.data.Items ?? []).filter((v) => v.Id && v.Name)
  const libraries: SourceLibrary[] = views.map((v) => ({
    id: v.Id as string,
    name: v.Name as string,
  }))

  const byId = new Map<string, MediaItem>()

  if (libraries.length === 0) {
    const res = await itemsApi.getItems({
      userId,
      recursive: true,
      includeItemTypes: LIBRARY_TYPES,
      fields: LIBRARY_FIELDS,
    })
    for (const item of res.data.Items ?? []) {
      if (item.Id) byId.set(item.Id, item as MediaItem)
    }
  } else {
    const perLibrary = await Promise.all(
      libraries.map(async (library) => {
        const res = await itemsApi.getItems({
          userId,
          parentId: library.id,
          recursive: true,
          includeItemTypes: LIBRARY_TYPES,
          fields: LIBRARY_FIELDS,
        })
        return (res.data.Items ?? []).map((item) => ({
          ...(item as MediaItem),
          SourceLibraryId: library.id,
          SourceLibraryName: library.name,
        }))
      }),
    )
    for (const item of perLibrary.flat()) {
      if (item.Id && !byId.has(item.Id)) byId.set(item.Id, item)
    }
  }

  return { items: Array.from(byId.values()), libraries }
}

// Full field set fetched before an update so the round-tripped DTO doesn't drop
// data the server would otherwise wipe.
const UPDATE_FIELDS = [
  ItemFields.Tags,
  ItemFields.Genres,
  ItemFields.Overview,
  ItemFields.ProviderIds,
  ItemFields.Studios,
  ItemFields.People,
  ItemFields.Taglines,
  ItemFields.ProductionLocations,
  ItemFields.OriginalTitle,
  ItemFields.SortName,
  ItemFields.CustomRating,
  ItemFields.DateCreated,
  ItemFields.RemoteTrailers,
  ItemFields.ExternalUrls,
]

/** Apply a tag/genre edit to one item and return the new value list for the
 *  active field (so the caller can patch its local copy). Fetches the full
 *  server DTO, merges per mode, and — critically — strips the Trickplay map,
 *  which the server fails to deserialize on a round-trip. */
export async function applyEdit(opts: {
  id: string
  userId: string
  editTarget: EditField
  proposed: string[]
  mode: ApplyMode
  localName?: string
}): Promise<string[]> {
  const { id, userId, editTarget, proposed, mode, localName } = opts

  const itemRes = await itemsApi.getItems({ ids: [id], userId, fields: UPDATE_FIELDS })
  const serverItem = itemRes.data.Items?.[0]
  if (!serverItem) throw new Error(`Item ${id} not found on server.`)

  const itemName = serverItem.Name || localName || ''
  if (!itemName) throw new Error('Cannot update item without a Name field.')

  const currentValues = (editTarget === 'Genres' ? serverItem.Genres : serverItem.Tags) ?? []
  const updatedValues = mergeValues(currentValues, proposed, mode)

  // Jellyfin rejects the round-tripped DTO when it carries a Trickplay map:
  // TrickplayInfoDto fails to deserialize on the server and the whole update
  // fails. Strip it before sending.
  const { Trickplay: _trickplay, ...sanitizedItem } = serverItem

  await updateApi.updateItem({
    itemId: id,
    baseItemDto: {
      ...sanitizedItem,
      Id: id,
      Name: itemName,
      Tags: editTarget === 'Tags' ? updatedValues : (serverItem.Tags ?? []),
      Genres: editTarget === 'Genres' ? updatedValues : (serverItem.Genres ?? []),
      ProviderIds: serverItem.ProviderIds ?? {},
    },
  })

  return updatedValues
}
