import { useCallback, useEffect } from 'react'
import type { FavoriteCity } from './api/types'
import { CurrentWeatherCard } from './components/CurrentWeatherCard'
import { FavoriteCities } from './components/FavoriteCities'
import { ForecastList } from './components/ForecastList'
import { SearchBar } from './components/SearchBar'
import { WeatherIcon } from './components/WeatherIcon'
import { ErrorBanner } from './components/states/ErrorBanner'
import { ErrorState } from './components/states/ErrorState'
import { LoadingState } from './components/states/LoadingState'
import { useFavorites } from './hooks/useFavorites'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeather } from './hooks/useWeather'
import { getCityKey } from './lib/storage'

const DEFAULT_CITY = '北京'

export function App() {
  const { data, isLoading, error, load, retry } = useWeather()
  const { favorites, toggleFavorite, removeFavorite } = useFavorites()
  const {
    isLocating,
    error: geoError,
    locate,
    clearError: clearGeoError,
  } = useGeolocation()

  useEffect(() => {
    void load({ city: DEFAULT_CITY })
  }, [load])

  const handleSearch = useCallback(
    (city: string) => {
      clearGeoError()
      void load({ city })
    },
    [clearGeoError, load],
  )

  const handleLocate = useCallback(() => {
    clearGeoError()
    void locate().then((coordinates) => {
      if (coordinates) {
        void load(coordinates)
      }
    })
  }, [clearGeoError, load, locate])

  const handleSelectFavorite = useCallback(
    (city: FavoriteCity) => {
      clearGeoError()
      void load({ lat: city.lat, lon: city.lon })
    },
    [clearGeoError, load],
  )

  const current = data?.current
  const activeFavoriteId = current
    ? getCityKey(current.coordinates.lat, current.coordinates.lon)
    : null
  const isFavorite = activeFavoriteId
    ? favorites.some((city) => city.id === activeFavoriteId)
    : false

  function handleToggleFavorite() {
    if (!current || !activeFavoriteId) return

    toggleFavorite({
      id: activeFavoriteId,
      name: current.cityName,
      country: current.country,
      lat: current.coordinates.lat,
      lon: current.coordinates.lon,
    })
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-10">
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-[var(--shadow)]">
              <WeatherIcon code={800} size={34} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">天气</h1>
              <p className="text-sm text-[var(--text-muted)]">
                实时天气与未来多日预报
              </p>
            </div>
          </div>

          <div className="w-full lg:max-w-xl">
            <SearchBar
              onSearch={handleSearch}
              onLocate={handleLocate}
              isSearching={isLoading}
              isLocating={isLocating}
            />
          </div>
        </header>

        {geoError ? (
          <ErrorBanner
            error={geoError}
            onRetry={handleLocate}
            onDismiss={clearGeoError}
          />
        ) : null}

        {error && data ? <ErrorBanner error={error} onRetry={retry} /> : null}

        <FavoriteCities
          cities={favorites}
          activeId={activeFavoriteId}
          onSelect={handleSelectFavorite}
          onRemove={removeFavorite}
        />

        <main className="mt-4">
          {data && isLoading ? (
            <div
              className="mb-3 h-1 overflow-hidden rounded-full bg-[var(--border)]"
              role="progressbar"
              aria-label="正在更新天气数据"
            >
              <div className="loading-bar h-full w-1/3 rounded-full bg-[var(--accent)]" />
            </div>
          ) : null}

          {data ? (
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <CurrentWeatherCard
                current={data.current}
                today={data.forecast[0]}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
              <ForecastList days={data.forecast} />
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={retry} />
          ) : (
            <LoadingState />
          )}
        </main>

        <footer className="py-8 text-center text-xs text-[var(--text-muted)]">
          天气数据由{' '}
          <a
            href="https://openweathermap.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-[var(--text)]"
          >
            OpenWeatherMap
          </a>{' '}
          提供 · 数据仅供参考
        </footer>
      </div>
    </div>
  )
}
