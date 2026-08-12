<script setup lang="ts">
import { getServerUrl } from '@/services/jellyfin'

// Scaffold shell. Referencing the Jellyfin service pulls the env-placeholder
// module into the build graph so we can verify the seam before building features.
const serverUrl = getServerUrl()
</script>

<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 class="text-h4 mb-2">JellyTags</h1>
        <p class="text-medium-emphasis">Server: {{ serverUrl }}</p>
      </v-container>
    </v-main>
  </v-app>
</template>
