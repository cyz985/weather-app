import { useCallback, useState } from 'react'
import type { Coordinates } from '../api/types'
import { AppError } from '../lib/errors'

function mapGeolocationError(error: GeolocationPositionError): AppError {
  if (error.code === error.PERMISSION_DENIED) {
    return new AppError('GEO_DENIED')
  }

  return new AppError('GEO_UNAVAILABLE', undefined, true)
}

export function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const locate = useCallback((): Promise<Coordinates | null> => {
    setError(null)

    if (!('geolocation' in navigator)) {
      setError(new AppError('GEO_UNAVAILABLE'))
      return Promise.resolve(null)
    }

    setIsLocating(true)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false)
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (geoError) => {
          setIsLocating(false)
          setError(mapGeolocationError(geoError))
          resolve(null)
        },
        {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 300_000,
        },
      )
    })
  }, [])

  return { isLocating, error, locate, clearError }
}
