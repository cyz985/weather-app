import { useCallback, useEffect, useState } from 'react'
import type { FavoriteCity } from '../api/types'
import { readFavorites, writeFavorites } from '../lib/storage'

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => readFavorites())

  useEffect(() => {
    writeFavorites(favorites)
  }, [favorites])

  const toggleFavorite = useCallback((city: FavoriteCity) => {
    setFavorites((previous) => {
      const exists = previous.some((item) => item.id === city.id)
      return exists
        ? previous.filter((item) => item.id !== city.id)
        : [city, ...previous]
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((previous) => previous.filter((item) => item.id !== id))
  }, [])

  return { favorites, toggleFavorite, removeFavorite }
}
