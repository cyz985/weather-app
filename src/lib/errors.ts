export type AppErrorCode =
  | 'MISSING_KEY'
  | 'INVALID_KEY'
  | 'CITY_NOT_FOUND'
  | 'BAD_REQUEST'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'SERVER'
  | 'INVALID_DATA'
  | 'GEO_DENIED'
  | 'GEO_UNAVAILABLE'
  | 'UNKNOWN'

interface ErrorCopy {
  title: string
  description: string
}

const ERROR_COPY: Record<AppErrorCode, ErrorCopy> = {
  MISSING_KEY: {
    title: '未配置 API 密钥',
    description:
      '请在项目根目录的 .env.local 中添加 VITE_OPENWEATHER_API_KEY，然后重启开发服务器。',
  },
  INVALID_KEY: {
    title: 'API 密钥无效',
    description:
      'OpenWeatherMap 拒绝了当前密钥，请检查 .env.local 中的 VITE_OPENWEATHER_API_KEY 是否正确。',
  },
  CITY_NOT_FOUND: {
    title: '未找到该城市',
    description: '请检查城市名称拼写，支持中英文城市名，例如 北京、Shanghai。',
  },
  BAD_REQUEST: {
    title: '请求参数有误',
    description: '请检查城市名称或定位结果后重试。',
  },
  NETWORK: {
    title: '网络连接失败',
    description: '请检查网络连接，确认可以访问 OpenWeatherMap 后重试。',
  },
  TIMEOUT: {
    title: '请求超时',
    description: '天气服务响应较慢，请稍后重试。',
  },
  RATE_LIMIT: {
    title: '请求过于频繁',
    description: '免费接口有调用频率限制，请稍候再试。',
  },
  SERVER: {
    title: '天气服务暂时不可用',
    description: 'OpenWeatherMap 服务异常，请稍后重试。',
  },
  INVALID_DATA: {
    title: '天气数据异常',
    description: '接口返回的数据不完整，请稍后重试。',
  },
  GEO_DENIED: {
    title: '定位权限被拒绝',
    description: '请在浏览器地址栏的权限设置中允许定位，或直接搜索城市。',
  },
  GEO_UNAVAILABLE: {
    title: '无法获取当前位置',
    description: '当前浏览器或网络环境不支持定位，请手动搜索城市。',
  },
  UNKNOWN: {
    title: '加载失败',
    description: '发生了未知错误，请稍后重试。',
  },
}

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly retryable: boolean

  constructor(code: AppErrorCode, message?: string, retryable = false) {
    super(message ?? ERROR_COPY[code].title)
    this.name = 'AppError'
    this.code = code
    this.retryable = retryable
  }
}

export function getErrorCopy(code: AppErrorCode): ErrorCopy {
  return ERROR_COPY[code]
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  return new AppError(
    'UNKNOWN',
    error instanceof Error ? error.message : undefined,
    true,
  )
}
