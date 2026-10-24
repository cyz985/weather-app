export type WeatherQuery = { city: string } | { lat: number; lon: number }

export interface Coordinates {
  lat: number
  lon: number
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
  icon: string
}

export interface CurrentWeather {
  cityName: string
  country: string
  coordinates: Coordinates
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  condition: WeatherCondition
  isDay: boolean
  dt: number
  timezoneOffset: number
}

export interface ForecastDay {
  date: string
  condition: WeatherCondition
  tempMin: number
  tempMax: number
  humidity: number
  windSpeed: number
  precipitationProbability: number
}

export interface WeatherData {
  current: CurrentWeather
  forecast: ForecastDay[]
}

export interface FavoriteCity {
  id: string
  name: string
  country: string
  lat: number
  lon: number
}
