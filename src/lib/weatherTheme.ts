export type WeatherKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'rain'
  | 'thunder'
  | 'snow'
  | 'mist'

/** 根据 WMO/OpenWeatherMap 天气代码归并出用于图标与配色的类型。 */
export function getWeatherKind(code: number): WeatherKind {
  if (code >= 200 && code < 300) return 'thunder'
  if (code >= 300 && code < 600) return 'rain'
  if (code >= 600 && code < 700) return 'snow'
  if (code >= 700 && code < 800) return 'mist'
  if (code === 800) return 'clear'
  if (code === 801) return 'partly'
  return 'cloudy'
}

export function getWeatherThemeClass(code: number, isNight: boolean): string {
  return `weather-theme--${getWeatherKind(code)}-${isNight ? 'night' : 'day'}`
}
