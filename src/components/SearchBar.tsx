import { useState, type FormEvent } from 'react'
import { LocationIcon, SearchIcon } from './icons'

interface SearchBarProps {
  onSearch: (city: string) => void
  onLocate: () => void
  isSearching: boolean
  isLocating: boolean
}

function ButtonSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  )
}

export function SearchBar({
  onSearch,
  onLocate,
  isSearching,
  isLocating,
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const [hint, setHint] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const city = value.trim()

    if (!city) {
      setHint('请输入城市名称，例如 北京 或 London')
      return
    }

    setHint('')
    onSearch(city)
  }

  return (
    <div>
      <form
        role="search"
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow)] backdrop-blur-xl"
      >
        <span className="pl-2.5 text-[var(--text-muted)]">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="搜索城市，如 北京 / London"
          aria-label="城市名称"
          aria-describedby={hint ? 'search-hint' : undefined}
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={isSearching}
          aria-busy={isSearching}
          className="flex min-h-11 min-w-[72px] items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? <ButtonSpinner /> : '查询'}
        </button>
        <button
          type="button"
          onClick={onLocate}
          disabled={isLocating}
          aria-label="定位到当前位置"
          aria-busy={isLocating}
          title="定位到当前位置"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] text-[var(--text)] transition hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLocating ? <ButtonSpinner /> : <LocationIcon />}
        </button>
      </form>

      {hint ? (
        <p
          id="search-hint"
          role="alert"
          className="mt-2 pl-2 text-sm text-[var(--danger)]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  )
}
