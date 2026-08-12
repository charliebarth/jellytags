import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchLibrary, resolveAdminUserId } from '@/services/jellyfin'
import type { EditField, MediaItem, SourceLibrary } from '@/types'

/** Owns the loaded library: the admin user, all items, source libraries, and
 *  the async load lifecycle. Filtering lives in useLibraryFilters; selection in
 *  the selection store. */
export const useLibraryStore = defineStore('library', () => {
  const items = ref<MediaItem[]>([])
  const libraries = ref<SourceLibrary[]>([])
  const userId = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      if (!userId.value) userId.value = await resolveAdminUserId()
      const { items: fetched, libraries: libs } = await fetchLibrary(userId.value)
      items.value = fetched
      libraries.value = libs
    } catch (e) {
      console.error(e)
      error.value =
        e instanceof Error
          ? e.message
          : 'Connection failed. Check the Jellyfin URL/token and that the server is running.'
    } finally {
      loading.value = false
    }
  }

  /** Patch a single item's Tags/Genres in place after a successful edit, so the
   *  grid reflects the change without a full refetch. */
  function patchItem(id: string, field: EditField, values: string[]) {
    const item = items.value.find((i) => i.Id === id)
    if (item) item[field] = [...values]
  }

  return { items, libraries, userId, loading, error, load, refresh: load, patchItem }
})
