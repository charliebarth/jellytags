import { describe, expect, it } from 'vitest'
import { matchesTagFilter, mergeValues, pickAdminUser } from '@/lib/tags'
import type { MediaItem } from '@/types'

function item(tags: string[] | undefined): MediaItem {
  return { Id: 'x', Tags: tags }
}

describe('mergeValues', () => {
  it('append unions and dedupes', () => {
    expect(mergeValues(['a', 'b'], ['b', 'c'], 'append')).toEqual(['a', 'b', 'c'])
  })
  it('remove drops only the listed values', () => {
    expect(mergeValues(['a', 'b', 'c'], ['b'], 'remove')).toEqual(['a', 'c'])
  })
  it('replace returns exactly the proposed values, ignoring current', () => {
    expect(mergeValues(['a', 'b'], ['x'], 'replace')).toEqual(['x'])
  })
})

describe('matchesTagFilter', () => {
  it('empty selection matches everything', () => {
    expect(matchesTagFilter(item(['a']), [], 'has')).toBe(true)
    expect(matchesTagFilter(item(undefined), [], 'missing')).toBe(true)
  })
  it('has: true only when the item has ALL selected tags', () => {
    expect(matchesTagFilter(item(['a', 'b']), ['a', 'b'], 'has')).toBe(true)
    expect(matchesTagFilter(item(['a']), ['a', 'b'], 'has')).toBe(false)
  })
  it('missing: true only when the item has NONE of the selected tags', () => {
    expect(matchesTagFilter(item(['c']), ['a', 'b'], 'missing')).toBe(true)
    expect(matchesTagFilter(item(['a']), ['a', 'b'], 'missing')).toBe(false)
  })
  it('item with no Tags array: has is false, missing is true', () => {
    expect(matchesTagFilter(item(undefined), ['a'], 'has')).toBe(false)
    expect(matchesTagFilter(item(undefined), ['a'], 'missing')).toBe(true)
  })
})

describe('pickAdminUser', () => {
  it('returns the administrator even when it is not first', () => {
    const users = [
      { Id: '1', Policy: { IsAdministrator: false } },
      { Id: '2', Policy: { IsAdministrator: true } },
    ]
    expect(pickAdminUser(users)?.Id).toBe('2')
  })
  it('falls back to the first user when none is an administrator', () => {
    const users = [
      { Id: '1', Policy: { IsAdministrator: false } },
      { Id: '2', Policy: { IsAdministrator: false } },
    ]
    expect(pickAdminUser(users)?.Id).toBe('1')
  })
  it('returns undefined for an empty list', () => {
    expect(pickAdminUser([])).toBeUndefined()
  })
})
