import { computed, ref } from 'vue'
import { matchesTagFilter } from '@/lib/tags'
import { useLibraryStore } from '@/stores/library'
import type { MediaItem, SortMode, TagFilterMode } from '@/types'

// Module-scoped so the toolbar (which sets the controls) and the grid (which
// reads the result) share one instance without prop-drilling.
const search = ref('')
const selectedLibraryId = ref<string>('all')
const selectedRating = ref<string>('all')
const sort = ref<SortMode>('date-desc')
const selectedFilterTags = ref<string[]>([])
const tagFilterMode = ref<TagFilterMode>('has')

export function useLibraryFilters() {
  const library = useLibraryStore()

  // Distinct tags/ratings present across the loaded library, for the pickers.
  const availableTags = computed(() =>
    Array.from(new Set(library.items.flatMap((i) => i.Tags ?? []))).sort((a, b) =>
      a.localeCompare(b),
    ),
  )

  const parentalRatings = computed(() =>
    Array.from(
      new Set(
        library.items.map((i) => i.OfficialRating?.trim()).filter((r): r is string => Boolean(r)),
      ),
    ).sort((a, b) => a.localeCompare(b)),
  )

  const filteredItems = computed<MediaItem[]>(() => {
    const q = search.value.toLowerCase()
    const lib = selectedLibraryId.value
    const rating = selectedRating.value
    const tags = selectedFilterTags.value
    const mode = tagFilterMode.value

    const result = library.items.filter(
      (i) =>
        (lib === 'all' || i.SourceLibraryId === lib) &&
        (rating === 'all' || (i.OfficialRating ?? '').trim() === rating) &&
        matchesTagFilter(i, tags, mode) &&
        ((i.Name ?? '').toLowerCase().includes(q) ||
          (i.Tags ?? []).some((t) => t.toLowerCase().includes(q))),
    )

    const s = sort.value
    // filter() returned a fresh array, so this sort doesn't mutate the store.
    return result.sort((a, b) => {
      if (s === 'name-asc') return (a.Name ?? '').localeCompare(b.Name ?? '')
      if (s === 'name-desc') return (b.Name ?? '').localeCompare(a.Name ?? '')
      const da = new Date(a.DateCreated ?? 0).getTime()
      const db = new Date(b.DateCreated ?? 0).getTime()
      return s === 'date-asc' ? da - db : db - da
    })
  })

  /** Drop selected filter tags no longer present after a refresh, so the filter
   *  can't silently pin the grid to zero results. */
  function pruneTags() {
    const present = new Set(availableTags.value)
    selectedFilterTags.value = selectedFilterTags.value.filter((t) => present.has(t))
  }

  return {
    search,
    selectedLibraryId,
    selectedRating,
    sort,
    selectedFilterTags,
    tagFilterMode,
    availableTags,
    parentalRatings,
    filteredItems,
    pruneTags,
  }
}
