<script setup lang="ts">
import { onMounted } from 'vue'
import LibraryToolbar from '@/components/LibraryToolbar.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import TagEditorDrawer from '@/components/TagEditorDrawer.vue'
import { useLibraryFilters } from '@/composables/useLibraryFilters'
import { useLibraryStore } from '@/stores/library'
import { useSelectionStore } from '@/stores/selection'

const library = useLibraryStore()
const selection = useSelectionStore()
const { pruneTags } = useLibraryFilters()

async function reload() {
  await library.refresh()
  // Keep the selection/tag-filter valid against the freshly loaded set.
  selection.retain(library.items.map((i) => i.Id))
  pruneTags()
}

onMounted(reload)
</script>

<template>
  <v-app>
    <LibraryToolbar @refresh="reload" />
    <TagEditorDrawer />
    <v-main>
      <MediaGrid />
    </v-main>
  </v-app>
</template>
