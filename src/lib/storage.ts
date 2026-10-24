import type { FavoriteCity } from '../api/types'

export const FAVORITES_STORAGE_KEY = 'weather.favorites.v1'

export function getCityKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFavoriteCity(value: unknown): value is FavoriteCity {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.country === 'string' &&
    typeof value.lat === 'number' &&
    Number.isFinite(value.lat) &&
    typeof value.lon === 'number' &&
    Number.isFinite(value.lon)
  )
}

/** 读取收藏；数据损坏或浏览器禁用 localStorage 时返回空数组，避免页面崩溃。 */
export function readFavorites(): FavoriteCity[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const seen = new Set<string>()
    return parsed.filter(isFavoriteCity).filter((city) => {
      if (seen.has(city.id)) return false
      seen.add(city.id)
      return true
    })
  } catch {
    return []
  }
}

export function writeFavorites(favorites: FavoriteCity[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // 隐私模式或存储空间不足时静默失败，收藏仅在本次会话有效。
  }
}
