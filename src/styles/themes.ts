import type { ThemeDefinition } from 'vuetify'

// Dark glassmorphism palette carried over from the original JellyTags CSS
// (--bg-color, --jelly-blue, --jelly-purple, --primary-hover).
export const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#0d1117',
    surface: '#161b22',
    primary: '#00a4dc', // jelly-blue
    secondary: '#aa5cc3', // jelly-purple
    error: '#b92b27',
    info: '#00a4dc',
    success: '#3fb950',
    warning: '#d29922',
  },
}
