<script setup lang="ts">
import MediaCard from '@/components/MediaCard.vue'
import { useLibraryFilters } from '@/composables/useLibraryFilters'
import { useLibraryStore } from '@/stores/library'

const library = useLibraryStore()
const { filteredItems } = useLibraryFilters()
</script>

<template>
  <div v-if="library.loading" class="state">
    <v-progress-circular indeterminate color="primary" size="48" />
    <p class="mt-4 text-medium-emphasis">Loading your library…</p>
  </div>
  <div v-else-if="library.error" class="state">
    <v-icon icon="mdi-alert-circle-outline" color="error" size="48" />
    <p class="mt-4 text-error">{{ library.error }}</p>
  </div>
  <div v-else-if="filteredItems.length === 0" class="state">
    <v-icon icon="mdi-magnify" size="48" class="text-medium-emphasis" />
    <p class="mt-4 text-medium-emphasis">No items found.</p>
  </div>
  <div v-else class="grid">
    <MediaCard v-for="item in filteredItems" :key="item.Id" :item="item" />
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 16px;
  text-align: center;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 16px;
}
</style>
