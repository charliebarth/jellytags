import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/** Multi-select state for the media grid. Holds only the set of selected item
 *  ids so any component (grid, toolbar, editor drawer) can read the selection;
 *  the ordered list it ranges over lives in the grid. */
export const useSelectionStore = defineStore('selection', () => {
  const ids = ref<Set<string>>(new Set())

  const count = computed(() => ids.value.size)
  const selectedIds = computed(() => [...ids.value])

  function isSelected(id: string): boolean {
    return ids.value.has(id)
  }

  function toggle(id: string) {
    const next = new Set(ids.value)
    next.has(id) ? next.delete(id) : next.add(id)
    ids.value = next
  }

  function deselect(id: string) {
    const next = new Set(ids.value)
    next.delete(id)
    ids.value = next
  }

  function clear() {
    ids.value = new Set()
  }

  /** Add every id in `order` (the currently filtered list) to the selection. */
  function selectAll(order: string[]) {
    ids.value = new Set([...ids.value, ...order])
  }

  /** Drop ids no longer present (e.g. after a refresh reloads the library). */
  function retain(order: string[]) {
    const present = new Set(order)
    ids.value = new Set([...ids.value].filter((id) => present.has(id)))
  }

  return { ids, count, selectedIds, isSelected, toggle, deselect, clear, selectAll, retain }
})
