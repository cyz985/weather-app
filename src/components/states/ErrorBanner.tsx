import type { AppError } from '../../lib/errors'
import { getErrorCopy } from '../../lib/errors'
import { AlertIcon, RefreshIcon, XIcon } from '../icons'

interface ErrorBannerProps {
  error: AppError
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps) {
  const copy = getErrorCopy(error.code)

  return (
    <div
      role="alert"
      className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl"
    >
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{copy.title}</p>
        <p className="mt-0.5 text-sm leading-5 text-[var(--text-muted)]">
          {copy.description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {error.retryable && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <RefreshIcon className="h-4 w-4" />
            重试
          </button>
        ) : null}

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="关闭提示"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
