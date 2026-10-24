import type { AppError } from '../../lib/errors'
import { getErrorCopy } from '../../lib/errors'
import { AlertIcon, RefreshIcon } from '../icons'

interface ErrorStateProps {
  error: AppError
  onRetry: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const copy = getErrorCopy(error.code)

  return (
    <div
      role="alert"
      className="mx-auto max-w-xl rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow)] backdrop-blur-xl md:p-8"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg)] text-[var(--warning)]">
        <AlertIcon className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-lg font-semibold">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        {copy.description}
      </p>

      {error.retryable ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <RefreshIcon className="h-4 w-4" />
          重试
        </button>
      ) : null}
    </div>
  )
}
