import type { ForecastDay } from '../api/types'
import {
  formatForecastDay,
  formatPrecipitation,
  formatTemperature,
} from '../lib/format'
import { WeatherIcon } from './WeatherIcon'

interface ForecastListProps {
  days: ForecastDay[]
}

export function ForecastList({ days }: ForecastListProps) {
  if (days.length === 0) return null

  const globalMin = Math.min(...days.map((day) => day.tempMin))
  const globalMax = Math.max(...days.map((day) => day.tempMax))
  const span = Math.max(globalMax - globalMin, 1)

  return (
    <section
      aria-labelledby="forecast-title"
      className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl md:p-5"
    >
      <div className="flex items-center justify-between">
        <h2 id="forecast-title" className="text-base font-semibold">
          未来 {days.length} 天
        </h2>
        <span className="text-xs text-[var(--text-muted)]">每日预报</span>
      </div>

      <ul className="mt-3">
        {days.map((day, index) => {
          const left = ((day.tempMin - globalMin) / span) * 100
          const width = ((day.tempMax - day.tempMin) / span) * 100
          const barLeft = Math.min(left, 92)
          const barWidth = Math.max(Math.min(width, 100 - barLeft), 8)

          return (
            <li
              key={day.date}
              className="flex items-center gap-2 border-t border-[var(--border)] py-3 first:border-t-0"
            >
              <span className="w-10 shrink-0 text-sm">
                {formatForecastDay(day.date, index)}
              </span>

              <WeatherIcon
                code={day.condition.id}
                isNight={day.condition.icon.endsWith('n')}
                size={32}
                className="shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{day.condition.description}</p>
                {day.precipitationProbability > 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">
                    降水 {formatPrecipitation(day.precipitationProbability)}
                  </p>
                ) : null}
              </div>

              <span className="w-9 text-right text-sm text-[var(--text-muted)]">
                {formatTemperature(day.tempMin)}
              </span>

              <div className="relative hidden h-1.5 w-20 overflow-hidden rounded-full bg-[var(--border)] sm:block">
                <div
                  className="absolute inset-y-0 rounded-full bg-[linear-gradient(90deg,var(--temp-low),var(--temp-high))]"
                  style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                />
              </div>

              <span className="w-9 text-right text-sm font-medium">
                {formatTemperature(day.tempMax)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
