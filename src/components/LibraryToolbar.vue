<script setup lang="ts">
import { computed } from 'vue'
import TagFilter from '@/components/TagFilter.vue'
import { useLibraryFilters } from '@/composables/useLibraryFilters'
import { useLibraryStore } from '@/stores/library'
import { useSelectionStore } from '@/stores/selection'

const emit = defineEmits<{ refresh: [] }>()

const library = useLibraryStore()
const selection = useSelectionStore()
const { search, selectedLibraryId, selectedRating, sort, filteredItems, parentalRatings } =
  useLibraryFilters()

const libraryOptions = computed(() => [
  { title: 'All Libraries', value: 'all' },
  ...library.libraries.map((l) => ({ title: l.name, value: l.id })),
])

const ratingOptions = computed(() => [
  { title: 'All Parental Ratings', value: 'all' },
  ...parentalRatings.value.map((r) => ({ title: r, value: r })),
])

const sortOptions = [
  { title: 'Alphabetical (A–Z)', value: 'name-asc' },
  { title: 'Alphabetical (Z–A)', value: 'name-desc' },
  { title: 'Date Added (Newest)', value: 'date-desc' },
  { title: 'Date Added (Oldest)', value: 'date-asc' },
]

function selectAll() {
  selection.selectAll(filteredItems.value.map((i) => i.Id))
}
</script>

<template>
  <v-app-bar class="glass" flat :height="64" :extension-height="64">
    <div class="bar-row d-flex align-center ga-3 px-4">
      <span class="text-h5 font-weight-bold brand">JellyTags</span>
      <v-text-field
        v-model="search"
        placeholder="Search by name or tag…"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="solo-filled"
        flat
        hide-details
        clearable
        class="search"
      />
      <v-spacer />
      <v-btn variant="tonal" prepend-icon="mdi-select-all" @click="selectAll">Select All</v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-selection-remove" @click="selection.clear()">
        Deselect All
      </v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="library.loading" @click="emit('refresh')">
        Refresh
      </v-btn>
    </div>

    <template #extension>
      <div class="bar-row d-flex align-center ga-3 px-4">
        <v-select
          v-model="selectedLibraryId"
          :items="libraryOptions"
          density="compact"
          variant="solo-filled"
          flat
          hide-details
          class="filter-select"
        />
        <v-select
          v-model="selectedRating"
          :items="ratingOptions"
          density="compact"
          variant="solo-filled"
          flat
          hide-details
          class="filter-select"
        />
        <v-select
          v-model="sort"
          :items="sortOptions"
          density="compact"
          variant="solo-filled"
          flat
          hide-details
          class="filter-select"
        />
        <TagFilter />
      </div>
    </template>
  </v-app-bar>
</template>

<style scoped>
/* Both rows stay one line and scroll horizontally rather than wrapping/clipping
   the fixed app-bar height on narrow screens. */
.bar-row {
  width: 100%;
  flex-wrap: nowrap;
  overflow-x: auto;
}
.brand {
  flex-shrink: 0;
  background: linear-gradient(90deg, #00a4dc, #aa5cc3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.search {
  min-width: 200px;
  max-width: 360px;
}
.filter-select {
  min-width: 160px;
  max-width: 220px;
  flex-shrink: 0;
}
</style>
