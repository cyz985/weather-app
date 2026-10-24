import type { FavoriteCity } from '../api/types'
import { XIcon } from './icons'

interface FavoriteCitiesProps {
  cities: FavoriteCity[]
  activeId: string | null
  onSelect: (city: FavoriteCity) => void
  onRemove: (id: string) => void
}

export function FavoriteCities({
  cities,
  activeId,
  onSelect,
  onRemove,
}: FavoriteCitiesProps) {
  return (
    <section aria-labelledby="favorites-title" className="mt-4">
      <div className="flex items-end justify-between gap-3">
        <h2 id="favorites-title" className="text-sm font-medium text-[var(--text)]">
          我的城市
        </h2>
        <span className="text-xs text-[var(--text-muted)]">
          {cities.length > 0 ? '点击快速查询' : '收藏后刷新页面也不会丢失'}
        </span>
      </div>

      {cities.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]">
          还没有收藏城市，查询后点击天气卡片右上角的星标即可收藏。
        </p>
      ) : (
        <ul className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
          {cities.map((city) => {
            const isActive = city.id === activeId

            return (
              <li key={city.id} className="shrink-0">
                <div
                  className={`flex items-center rounded-full border transition ${
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(city)}
                    aria-current={isActive ? 'true' : undefined}
                    className="flex min-h-11 items-center gap-1.5 rounded-l-full pl-4 pr-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <span>{city.name}</span>
                    {city.country ? (
                      <span
                        className={`text-xs ${
                          isActive ? 'text-white/70' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {city.country}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(city.id)}
                    aria-label={`删除收藏 ${city.name}`}
                    className={`flex min-h-11 min-w-10 items-center justify-center rounded-r-full pr-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                      isActive
                        ? 'text-white/70 hover:text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--danger)]'
                    }`}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
