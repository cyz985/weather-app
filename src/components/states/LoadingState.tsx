export function LoadingState() {
  return (
    <div
      className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"
      aria-busy="true"
      role="status"
    >
      <div className="animate-pulse rounded-[28px] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="h-5 w-28 rounded bg-[var(--border)]" />
        <div className="mt-3 h-3 w-44 rounded bg-[var(--border)]" />
        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="h-24 w-32 rounded-2xl bg-[var(--border)]" />
          <div className="h-28 w-28 rounded-full bg-[var(--border)]" />
        </div>
        <div className="mt-8 h-4 w-40 rounded bg-[var(--border)]" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-16 rounded-2xl bg-[var(--border)]" />
          ))}
        </div>
      </div>

      <div className="rounded-[28px] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--border)]" />
        {[0, 1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="mt-4 h-11 animate-pulse rounded-xl bg-[var(--border)]"
          />
        ))}
      </div>

      <span className="sr-only">正在加载天气数据</span>
    </div>
  )
}
