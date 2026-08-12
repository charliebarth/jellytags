<script setup lang="ts">
import { useLibraryFilters } from '@/composables/useLibraryFilters'

// v-autocomplete virtualizes its menu and filters by typed text, so this scales
// to the hundreds/thousands of auto-imported tags a real Jellyfin library has —
// unlike the old render-every-tag-as-a-checkbox panel.
const { availableTags, selectedFilterTags, tagFilterMode } = useLibraryFilters()
</script>

<template>
  <div class="d-flex align-center ga-2 tag-filter">
    <v-autocomplete
      v-model="selectedFilterTags"
      :items="availableTags"
      label="Filter by tags"
      multiple
      chips
      closable-chips
      clearable
      hide-details
      density="compact"
      variant="solo-filled"
      flat
      class="tag-autocomplete"
    />
    <v-btn-toggle
      v-model="tagFilterMode"
      mandatory
      divided
      density="compact"
      variant="outlined"
      class="mode-toggle"
    >
      <v-btn value="has" size="small">Has all</v-btn>
      <v-btn value="missing" size="small">Missing all</v-btn>
    </v-btn-toggle>
  </div>
</template>

<style scoped>
.tag-autocomplete {
  min-width: 240px;
  max-width: 340px;
}
.mode-toggle {
  flex-shrink: 0;
}
</style>
