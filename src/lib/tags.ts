import type { ApplyMode, MediaItem, TagFilterMode } from '@/types'

/** Pick an administrator account. The first user the API returns may be a
 *  restricted account whose limited library access would hide most items, so
 *  prefer one flagged administrator; fall back to the first user otherwise.
 *  Returns undefined for an empty list (the caller treats that as an error). */
export function pickAdminUser<
  T extends { Policy?: { IsAdministrator?: boolean | null } | null },
>(users: T[]): T | undefined {
  return users.find((u) => u.Policy?.IsAdministrator) ?? users[0]
}

/** Compute the new value list for a bulk edit against an item's current values.
 *  - append  → union of current + proposed (deduped)
 *  - remove  → current minus the proposed values
 *  - replace → exactly the proposed values */
export function mergeValues(
  current: string[],
  proposed: string[],
  mode: ApplyMode,
): string[] {
  if (mode === 'append') return Array.from(new Set([...current, ...proposed]))
  if (mode === 'remove') return current.filter((v) => !proposed.includes(v))
  return [...proposed]
}

/** Tag-filter predicate. An empty selection matches everything. 'has' keeps
 *  items carrying every selected tag; 'missing' keeps items carrying none of
 *  them. Matching is exact (whole tag values, not substrings). */
export function matchesTagFilter(
  item: MediaItem,
  selected: string[],
  mode: TagFilterMode,
): boolean {
  if (selected.length === 0) return true
  const itemTags = new Set(item.Tags ?? [])
  if (mode === 'missing') return selected.every((t) => !itemTags.has(t))
  return selected.every((t) => itemTags.has(t))
}
