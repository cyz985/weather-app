import type { CurrentWeather, ForecastDay, WeatherQuery } from './types'
import { resolveApiCityName, resolveDisplayCityName } from '../lib/cityAliases'
import { AppError } from '../lib/errors'

const API_BASE = 'https://api.openweathermap.org/data/2.5'
const REQUEST_TIMEOUT_MS = 10_000

interface RawCondition {
  id: number
  main: string
  description: string
  icon: string
}

interface RawCurrentResponse {
  coord: { lat: number; lon: number }
  weather: RawCondition[]
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  wind: { speed: number; deg: number }
  dt: number
  sys: { country?: string; sunrise?: number; sunset?: number }
  timezone: number
  name: string
}

interface RawForecastItem {
  dt: number
  main: {
    temp_min: number
    temp_max: number
    humidity: number
  }
  weather: RawCondition[]
  wind: { speed: number }
  pop?: number
}

interface RawForecastResponse {
  list: RawForecastItem[]
  city: { timezone: number }
}

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()
  if (!apiKey) {
    throw new AppError('MISSING_KEY')
  }
  return apiKey
}

function buildLocationParams(query: WeatherQuery): Record<string, string> {
  if ('city' in query) {
    const city = query.city.trim()
    if (!city) {
      throw new AppError('BAD_REQUEST')
    }
    return { q: resolveApiCityName(city) }
  }

  if (
    !Number.isFinite(query.lat) ||
    !Number.isFinite(query.lon) ||
    Math.abs(query.lat) > 90 ||
    Math.abs(query.lon) > 180
  ) {
    throw new AppError('BAD_REQUEST')
  }

  return { lat: String(query.lat), lon: String(query.lon) }
}

function mapHttpError(status: number): AppError {
  if (status === 401) return new AppError('INVALID_KEY')
  if (status === 404) return new AppError('CITY_NOT_FOUND')
  if (status === 400) return new AppError('BAD_REQUEST')
  if (status === 429) return new AppError('RATE_LIMIT', undefined, true)
  if (status >= 500) return new AppError('SERVER', undefined, true)
  return new AppError('UNKNOWN', undefined, true)
}

async function requestJson<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`)
  url.searchParams.set('appid', getApiKey())

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const controller = new AbortController()
  let didTimeout = false

  const timeoutId = window.setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  const abortFromCaller = () => controller.abort()
  if (signal?.aborted) controller.abort()
  signal?.addEventListener('abort', abortFromCaller)

  try {
    const response = await fetch(url.toString(), { signal: controller.signal })

    if (!response.ok) {
      throw mapHttpError(response.status)
    }

    try {
      return (await response.json()) as T
    } catch {
      throw new AppError('INVALID_DATA', undefined, true)
    }
  } catch (error) {
    if (error instanceof AppError) throw error

    if (error instanceof DOMException && error.name === 'AbortError') {
      if (didTimeout) throw new AppError('TIMEOUT', undefined, true)
      throw error
    }

    throw new AppError('NETWORK', undefined, true)
  } finally {
    window.clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}

function ensureCurrentResponse(data: RawCurrentResponse): void {
  const condition = data.weather?.[0]

  if (
    !data.coord ||
    !condition ||
    typeof data.main?.temp !== 'number' ||
    typeof data.main?.feels_like !== 'number' ||
    typeof data.main?.humidity !== 'number' ||
    typeof data.main?.pressure !== 'number' ||
    typeof data.wind?.speed !== 'number' ||
    typeof data.dt !== 'number' ||
    typeof data.timezone !== 'number' ||
    typeof data.name !== 'string'
  ) {
    throw new AppError('INVALID_DATA', undefined, true)
  }
}

function mapCurrent(data: RawCurrentResponse): CurrentWeather {
  const condition = data.weather[0]
  const { sunrise, sunset } = data.sys
  const isDay =
    typeof sunrise === 'number' && typeof sunset === 'number'
      ? data.dt >= sunrise && data.dt < sunset
      : true

  return {
    cityName: resolveDisplayCityName(data.name),
    country: data.sys.country ?? '',
    coordinates: { lat: data.coord.lat, lon: data.coord.lon },
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    // OpenWeatherMap metric 模式返回 m/s，统一换算为 km/h 展示。
    windSpeed: data.wind.speed * 3.6,
    windDirection: data.wind.deg ?? 0,
    pressure: data.main.pressure,
    condition: {
      id: condition.id,
      main: condition.main,
      description: condition.description,
      icon: condition.icon,
    },
    isDay,
    dt: data.dt,
    timezoneOffset: data.timezone,
  }
}

function localDateParts(
  unixSeconds: number,
  offsetSeconds: number,
): { date: string; hour: number } {
  const shifted = new Date((unixSeconds + offsetSeconds) * 1000)
  return {
    date: shifted.toISOString().slice(0, 10),
    hour: shifted.getUTCHours(),
  }
}

/**
 * 免费版 5 天 / 3 小时预报按城市本地日期聚合为每日数据，
 * 取最接近当地中午的时段作为当天代表天气。
 */
function aggregateForecast(
  list: RawForecastItem[],
  timezoneOffset: number,
): ForecastDay[] {
  const groups = new Map<string, RawForecastItem[]>()

  for (const item of list) {
    const { date } = localDateParts(item.dt, timezoneOffset)
    const group = groups.get(date)
    if (group) {
      group.push(item)
    } else {
      groups.set(date, [item])
    }
  }

  return Array.from(groups.values()).map((items) => {
    const representative = items.reduce((closest, item) => {
      const currentDistance = Math.abs(localDateParts(item.dt, timezoneOffset).hour - 12)
      const closestDistance = Math.abs(
        localDateParts(closest.dt, timezoneOffset).hour - 12,
      )
      return currentDistance < closestDistance ? item : closest
    }, items[0])

    const condition = representative.weather[0]
    const { date } = localDateParts(representative.dt, timezoneOffset)

    return {
      date,
      condition: {
        id: condition.id,
        main: condition.main,
        description: condition.description,
        icon: condition.icon,
      },
      tempMin: Math.min(...items.map((item) => item.main.temp_min)),
      tempMax: Math.max(...items.map((item) => item.main.temp_max)),
      humidity: Math.round(
        items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length,
      ),
      windSpeed:
        Math.max(...items.map((item) => item.wind.speed)) * 3.6,
      precipitationProbability: Math.max(
        ...items.map((item) => item.pop ?? 0),
      ),
    }
  })
}

function ensureForecastResponse(data: RawForecastResponse): void {
  if (
    !Array.isArray(data.list) ||
    data.list.length === 0 ||
    typeof data.city?.timezone !== 'number'
  ) {
    throw new AppError('INVALID_DATA', undefined, true)
  }

  const hasInvalidItem = data.list.some(
    (item) =>
      typeof item.dt !== 'number' ||
      !item.weather?.[0] ||
      typeof item.main?.temp_min !== 'number' ||
      typeof item.main?.temp_max !== 'number' ||
      typeof item.main?.humidity !== 'number' ||
      typeof item.wind?.speed !== 'number',
  )

  if (hasInvalidItem) {
    throw new AppError('INVALID_DATA', undefined, true)
  }
}

export async function getCurrentWeather(
  query: WeatherQuery,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const data = await requestJson<RawCurrentResponse>(
    '/weather',
    {
      ...buildLocationParams(query),
      units: 'metric',
      lang: 'zh_cn',
    },
    signal,
  )

  ensureCurrentResponse(data)
  return mapCurrent(data)
}

export async function getForecast(
  query: WeatherQuery,
  signal?: AbortSignal,
): Promise<ForecastDay[]> {
  const data = await requestJson<RawForecastResponse>(
    '/forecast',
    {
      ...buildLocationParams(query),
      units: 'metric',
      lang: 'zh_cn',
      cnt: '40',
    },
    signal,
  )

  ensureForecastResponse(data)
  return aggregateForecast(data.list, data.city.timezone)
}
