import type { ReactNode } from 'react'
import type { CurrentWeather, ForecastDay } from '../api/types'
import {
  formatCityDate,
  formatClock,
  formatHumidity,
  formatPressure,
  formatTemperature,
  formatWindDirection,
  formatWindSpeed,
} from '../lib/format'
import { getWeatherThemeClass } from '../lib/weatherTheme'
import { HumidityIcon, PressureIcon, StarIcon, ThermometerIcon, WindIcon } from './icons'
import { WeatherIcon } from './WeatherIcon'

interface CurrentWeatherCardProps {
  current: CurrentWeather
  today?: ForecastDay
  isFavorite: boolean
  onToggleFavorite: () => void
}

interface MetricProps {
  icon: ReactNode
  label: string
  value: string
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="rounded-2xl bg-[var(--hero-overlay)] p-3 backdrop-blur-sm">
      <dt className="flex items-center gap-1.5 text-xs text-white/75">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="mt-1 text-sm font-semibold sm:text-base">{value}</dd>
    </div>
  )
}

export function CurrentWeatherCard({
  current,
  today,
  isFavorite,
  onToggleFavorite,
}: CurrentWeatherCardProps) {
  const themeClass = getWeatherThemeClass(current.condition.id, !current.isDay)

  return (
    <section
      aria-label={`${current.cityName} 当前天气`}
      className={`weather-theme ${themeClass} relative overflow-hidden rounded-[28px] p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] md:p-7`}
    >
      <div className="weather-theme__glow" aria-hidden="true" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
              {current.cityName}
            </p>
            <p className="mt-1 text-sm text-white/80">
              {formatCityDate(current.dt, current.timezoneOffset)} ·{' '}
              {formatClock(current.dt, current.timezoneOffset)} 更新
              {current.country ? ` · ${current.country}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? '取消收藏当前城市' : '收藏当前城市'}
            aria-pressed={isFavorite}
            title={isFavorite ? '取消收藏' : '收藏城市'}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <StarIcon
              filled={isFavorite}
              className={`h-6 w-6 ${isFavorite ? 'text-amber-300' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[64px] font-semibold leading-none tracking-[-0.06em] md:text-[88px]">
              {formatTemperature(current.temperature)}
            </p>
            <p className="mt-2 text-lg font-medium">
              {current.condition.description}
            </p>
            <p className="mt-1 text-sm text-white/80">
              体感 {formatTemperature(current.feelsLike)}
              {today
                ? ` · 最高 ${formatTemperature(today.tempMax)} / 最低 ${formatTemperature(today.tempMin)}`
                : ''}
            </p>
          </div>

          <WeatherIcon
            code={current.condition.id}
            isNight={!current.isDay}
            size={120}
            className="h-28 w-28 shrink-0 drop-shadow-xl md:h-36 md:w-36"
          />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <Metric
            icon={<HumidityIcon className="h-4 w-4" />}
            label="湿度"
            value={formatHumidity(current.humidity)}
          />
          <Metric
            icon={<WindIcon className="h-4 w-4" />}
            label="风速"
            value={`${formatWindDirection(current.windDirection)} ${formatWindSpeed(current.windSpeed)}`}
          />
          <Metric
            icon={<ThermometerIcon className="h-4 w-4" />}
            label="体感温度"
            value={formatTemperature(current.feelsLike)}
          />
          <Metric
            icon={<PressureIcon className="h-4 w-4" />}
            label="气压"
            value={formatPressure(current.pressure)}
          />
        </dl>
      </div>
    </section>
  )
}
