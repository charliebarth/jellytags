<script setup lang="ts">
import { computed } from 'vue'
import { getServerUrl } from '@/services/jellyfin'
import { useSelectionStore } from '@/stores/selection'
import type { MediaItem } from '@/types'

const props = defineProps<{ item: MediaItem }>()
const selection = useSelectionStore()

const MAX_TAGS = 6

const selected = computed(() => selection.isSelected(props.item.Id))

const imageUrl = computed(() => {
  const primary = props.item.ImageTags?.Primary
  if (!primary) return null
  return `${getServerUrl()}/Items/${props.item.Id}/Images/Primary?tag=${primary}&maxWidth=400`
})

const subtitle = computed(() =>
  [props.item.Type, props.item.SourceLibraryName].filter(Boolean).join(' • '),
)

const shownTags = computed(() => (props.item.Tags ?? []).slice(0, MAX_TAGS))
const extraTags = computed(() => Math.max(0, (props.item.Tags?.length ?? 0) - MAX_TAGS))
</script>

<template>
  <v-card
    class="glass media-card"
    :class="{ selected }"
    variant="flat"
    @click="selection.toggle(item.Id)"
  >
    <div class="poster">
      <v-img v-if="imageUrl" :src="imageUrl" :aspect-ratio="2 / 3" cover />
      <div v-else class="no-image text-medium-emphasis">No Image</div>
      <v-icon v-if="selected" class="check" icon="mdi-check-circle" color="primary" />
    </div>
    <v-card-item class="py-2">
      <div class="text-body-2 font-weight-medium text-truncate">{{ item.Name }}</div>
      <div class="text-caption text-medium-emphasis text-truncate">{{ subtitle }}</div>
      <div v-if="shownTags.length" class="tags mt-1">
        <v-chip v-for="t in shownTags" :key="t" size="x-small" class="mr-1 mb-1">{{ t }}</v-chip>
        <v-chip v-if="extraTags" size="x-small" variant="text" class="mb-1">+{{ extraTags }}</v-chip>
      </div>
    </v-card-item>
  </v-card>
</template>

<style scoped>
.media-card {
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.15s;
}
.media-card.selected {
  border-color: rgb(var(--v-theme-primary)) !important;
}
.poster {
  position: relative;
}
.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 2 / 3;
  background: rgba(0, 0, 0, 0.2);
}
.check {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 50%;
}
.tags {
  display: flex;
  flex-wrap: wrap;
}
</style>
