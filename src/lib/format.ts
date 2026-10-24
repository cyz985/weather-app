const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`
}

export function formatWindSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`
}

export function formatHumidity(value: number): string {
  return `${Math.round(value)}%`
}

const WIND_DIRECTIONS = [
  '北风',
  '东北风',
  '东风',
  '东南风',
  '南风',
  '西南风',
  '西风',
  '西北风',
]

export function formatWindDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  return WIND_DIRECTIONS[Math.round(normalized / 45) % 8]
}

export function formatPressure(value: number): string {
  return `${Math.round(value)} hPa`
}

export function formatVisibility(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`
}

/** 把 UTC 秒加上城市时区偏移后，按 UTC 格式化，避免受浏览器本地时区影响。 */
function toCityDate(unixSeconds: number, offsetSeconds: number): Date {
  return new Date((unixSeconds + offsetSeconds) * 1000)
}

export function formatCityDate(unixSeconds: number, offsetSeconds: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'UTC',
  }).format(toCityDate(unixSeconds, offsetSeconds))
}

export function formatClock(unixSeconds: number, offsetSeconds: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(toCityDate(unixSeconds, offsetSeconds))
}

export function formatForecastDay(date: string, index: number): string {
  if (index === 0) return '今天'
  if (index === 1) return '明天'

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
  return WEEKDAY_NAMES[weekday]
}

export function formatPrecipitation(probability: number): string {
  return `${Math.round(probability * 100)}%`
}
