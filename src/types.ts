// Shape of a media item as JellyTags uses it (a subset of Jellyfin's BaseItemDto
// plus two fields we attach client-side to record which library it came from).
export type MediaItem = {
  Id: string
  Name?: string
  Type?: string
  Tags?: string[]
  Genres?: string[]
  DateCreated?: string
  OfficialRating?: string | null
  CustomRating?: string | null
  ImageTags?: { Primary?: string }
  SourceLibraryId?: string
  SourceLibraryName?: string
}

export type SourceLibrary = {
  id: string
  name: string
}

// Which metadata field the sidebar editor targets. Tags and genres share it.
export type EditField = 'Tags' | 'Genres'

// Bulk-apply mode for the editor.
export type ApplyMode = 'append' | 'replace' | 'remove'

// Tag-filter mode: keep items that have ALL selected tags, or NONE of them.
export type TagFilterMode = 'has' | 'missing'

export type SortMode = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc'
