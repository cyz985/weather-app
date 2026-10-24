import { useCallback, useEffect, useRef, useState } from 'react'
import { getCurrentWeather, getForecast } from '../api/openWeather'
import type { WeatherData, WeatherQuery } from '../api/types'
import { toAppError, type AppError } from '../lib/errors'

interface WeatherState {
  data: WeatherData | null
  isLoading: boolean
  error: AppError | null
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    data: null,
    isLoading: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)
  const lastQueryRef = useRef<WeatherQuery | null>(null)

  const load = useCallback(async (query: WeatherQuery) => {
    lastQueryRef.current = query
    abortRef.current?.abort()

    const controller = new AbortController()
    abortRef.current = controller

    // 保留旧数据，查询失败时页面不会突然变空。
    setState((previous) => ({ ...previous, isLoading: true, error: null }))

    try {
      const [current, forecast] = await Promise.all([
        getCurrentWeather(query, controller.signal),
        getForecast(query, controller.signal),
      ])

      if (controller.signal.aborted) return

      setState({
        data: { current, forecast },
        isLoading: false,
        error: null,
      })
    } catch (error) {
      if (controller.signal.aborted) return

      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: toAppError(error),
      }))
    }
  }, [])

  const retry = useCallback(() => {
    const query = lastQueryRef.current
    if (query) {
      void load(query)
    }
  }, [load])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  return { ...state, load, retry }
}
