import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { dark } from '@/styles/themes'

// JellyTags is dark-only — the original app had no light theme.
export default createVuetify({
  icons: { defaultSet: 'mdi' },
  theme: {
    defaultTheme: 'dark',
    themes: { dark },
  },
})
