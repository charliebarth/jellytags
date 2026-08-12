<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { applyEdit, getServerUrl } from '@/services/jellyfin'
import { useLibraryStore } from '@/stores/library'
import { useSelectionStore } from '@/stores/selection'
import type { ApplyMode, EditField, MediaItem } from '@/types'

const library = useLibraryStore()
const selection = useSelectionStore()
const { mdAndUp } = useDisplay()

// Only used in temporary (mobile) mode; on desktop the drawer is permanent.
const drawerOpen = ref(false)

const editTarget = ref<EditField>('Tags')
// Kept separate so switching the Tags/Genres toggle doesn't lose staged values.
const proposedTags = ref<string[]>([])
const proposedGenres = ref<string[]>([])
const applyMode = ref<ApplyMode>('append')
const newValue = ref('')

const applying = ref(false)
const progress = ref(0)
const snackbar = ref(false)
const snackbarText = ref('')

const noun = computed(() => (editTarget.value === 'Genres' ? 'genre' : 'tag'))

const proposed = computed<string[]>({
  get: () => (editTarget.value === 'Genres' ? proposedGenres.value : proposedTags.value),
  set: (v) => {
    if (editTarget.value === 'Genres') proposedGenres.value = v
    else proposedTags.value = v
  },
})

const selectedItems = computed<MediaItem[]>(() =>
  library.items.filter((i) => selection.isSelected(i.Id)),
)

// Count of each value already present on the selection, for the active field.
const existingEntries = computed<[string, number][]>(() => {
  const counts: Record<string, number> = {}
  for (const item of selectedItems.value) {
    const values = (editTarget.value === 'Genres' ? item.Genres : item.Tags) ?? []
    for (const v of values) counts[v] = (counts[v] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
})

const applyLabel = computed(() => {
  if (applyMode.value === 'replace') return 'Replace on'
  if (applyMode.value === 'remove') return 'Remove from'
  return 'Append to'
})

function onDrawer(v: boolean | null) {
  drawerOpen.value = !!v
}

function addValue() {
  const v = newValue.value.trim()
  if (v && !proposed.value.includes(v)) proposed.value = [...proposed.value, v]
  newValue.value = ''
}

function toggleStaged(value: string) {
  proposed.value = proposed.value.includes(value)
    ? proposed.value.filter((v) => v !== value)
    : [...proposed.value, value]
}

function thumb(item: MediaItem): string | null {
  const primary = item.ImageTags?.Primary
  return primary
    ? `${getServerUrl()}/Items/${item.Id}/Images/Primary?tag=${primary}&maxWidth=80`
    : null
}

async function apply() {
  const ids = selection.selectedIds
  const values = [...proposed.value]
  const target = editTarget.value
  const mode = applyMode.value

  applying.value = true
  progress.value = 0
  let success = 0
  const failed: string[] = []

  // Sequential on purpose: item updates are best serialized, and it drives the
  // Saving i/n progress bar.
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const local = library.items.find((it) => it.Id === id)
    try {
      const updated = await applyEdit({
        id,
        userId: library.userId,
        editTarget: target,
        proposed: values,
        mode,
        localName: local?.Name,
      })
      library.patchItem(id, target, updated)
      success++
    } catch (e) {
      console.error(`Failed to update item ${id}`, e)
      failed.push(local?.Name || id)
    }
    progress.value = Math.round(((i + 1) / ids.length) * 100)
  }

  applying.value = false
  if (success > 0) selection.clear()

  if (failed.length === 0) {
    snackbarText.value = `Successfully updated ${target.toLowerCase()} for ${success} items!`
  } else {
    const preview = failed.slice(0, 10).join(', ')
    const remaining = failed.length > 10 ? ` (+${failed.length - 10} more)` : ''
    snackbarText.value = `Updated ${success}/${ids.length} items. Failed: ${failed.length}. ${preview}${remaining}`
  }
  snackbar.value = true
}
</script>

<template>
  <v-navigation-drawer
    :model-value="mdAndUp ? true : drawerOpen"
    location="right"
    :permanent="mdAndUp"
    :temporary="!mdAndUp"
    width="380"
    @update:model-value="onDrawer"
  >
    <div v-if="selection.count === 0" class="pa-4">
      <h3 class="text-h6 mb-2">Tag Editor</h3>
      <p class="text-medium-emphasis">
        Select items from the grid to edit their tags and genres.
      </p>
    </div>

    <div v-else class="d-flex flex-column fill-height">
      <div class="flex-grow-1 overflow-y-auto pa-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <h3 class="text-h6">Edit {{ editTarget }}</h3>
          <v-chip size="small" color="primary" variant="tonal">{{ selection.count }} selected</v-chip>
        </div>
        <v-btn
          size="small"
          variant="text"
          prepend-icon="mdi-close"
          class="mb-3"
          @click="selection.clear()"
        >
          Clear Selection
        </v-btn>

        <v-btn-toggle v-model="editTarget" mandatory divided density="compact" variant="outlined" class="mb-4 w-100">
          <v-btn value="Tags" class="flex-grow-1">Tags</v-btn>
          <v-btn value="Genres" class="flex-grow-1">Genres</v-btn>
        </v-btn-toggle>

        <div class="text-subtitle-2 mb-1">{{ editTarget }} to apply</div>
        <div class="mb-2">
          <span v-if="proposed.length === 0" class="text-caption text-medium-emphasis">
            No {{ noun }}s staged
          </span>
          <v-chip
            v-for="v in proposed"
            :key="v"
            class="mr-1 mb-1"
            size="small"
            color="primary"
            variant="tonal"
            closable
            @click:close="toggleStaged(v)"
          >
            {{ v }}
          </v-chip>
        </div>

        <v-text-field
          v-model="newValue"
          :placeholder="`Add new ${noun}…`"
          density="compact"
          variant="solo-filled"
          flat
          hide-details
          append-inner-icon="mdi-plus"
          class="mb-4"
          @keydown.enter.prevent="addValue"
          @click:append-inner="addValue"
        />

        <template v-if="existingEntries.length">
          <div class="text-subtitle-2 mb-1">Existing {{ editTarget }} in selection</div>
          <div class="mb-1">
            <v-chip
              v-for="[value, cnt] in existingEntries"
              :key="value"
              class="mr-1 mb-1"
              size="small"
              :color="proposed.includes(value) ? 'primary' : undefined"
              :variant="proposed.includes(value) ? 'flat' : 'outlined'"
              @click="toggleStaged(value)"
            >
              {{ value }} ({{ cnt }})
            </v-chip>
          </div>
          <p class="text-caption text-medium-emphasis">
            Click a {{ noun }} to stage it for all selected items, then Apply. Click again to unstage.
          </p>
        </template>
      </div>

      <div class="pa-4 pt-2">
        <v-radio-group v-model="applyMode" inline hide-details density="compact" class="mb-2">
          <v-radio label="Append" value="append" />
          <v-radio label="Replace" value="replace" />
          <v-radio label="Remove" value="remove" />
        </v-radio-group>
        <v-progress-linear
          v-if="applying"
          :model-value="progress"
          color="primary"
          height="6"
          rounded
          class="mb-2"
        />
        <v-btn
          block
          color="primary"
          :loading="applying"
          :disabled="proposed.length === 0"
          @click="apply"
        >
          {{ applyLabel }} {{ selection.count }} Items
        </v-btn>

        <div class="text-subtitle-2 mb-1 mt-4">Selected items</div>
        <v-list density="compact" class="bg-transparent selected-list">
          <v-list-item
            v-for="item in selectedItems"
            :key="item.Id"
            @click="selection.deselect(item.Id)"
          >
            <template #prepend>
              <v-avatar rounded size="32">
                <v-img v-if="thumb(item)" :src="thumb(item)!" />
                <span v-else class="text-caption">{{ item.Type === 'Movie' ? 'M' : 'S' }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2">{{ item.Name }}</v-list-item-title>
            <template #append>
              <v-icon size="small" icon="mdi-close" />
            </template>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </v-navigation-drawer>

  <v-btn
    v-if="!mdAndUp && selection.count > 0"
    class="edit-fab"
    color="primary"
    icon="mdi-pencil"
    size="large"
    @click="drawerOpen = true"
  />

  <v-snackbar v-model="snackbar" timeout="5000" location="bottom">
    {{ snackbarText }}
    <template #actions>
      <v-btn variant="text" @click="snackbar = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.selected-list {
  max-height: 220px;
  overflow-y: auto;
}
.edit-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1010;
}
</style>
