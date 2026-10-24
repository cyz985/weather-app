/**
 * OpenWeatherMap 对中文城市名查询支持不稳定，常见城市先映射为英文名，
 * 避免用户输入中文时出现“城市不存在”的误报。
 */
const CITY_ALIASES: Record<string, string> = {
  北京: 'Beijing',
  上海: 'Shanghai',
  广州: 'Guangzhou',
  深圳: 'Shenzhen',
  杭州: 'Hangzhou',
  南京: 'Nanjing',
  苏州: 'Suzhou',
  成都: 'Chengdu',
  重庆: 'Chongqing',
  天津: 'Tianjin',
  武汉: 'Wuhan',
  西安: 'Xian',
  长沙: 'Changsha',
  郑州: 'Zhengzhou',
  青岛: 'Qingdao',
  大连: 'Dalian',
  厦门: 'Xiamen',
  福州: 'Fuzhou',
  昆明: 'Kunming',
  哈尔滨: 'Harbin',
  沈阳: 'Shenyang',
  济南: 'Jinan',
  合肥: 'Hefei',
  南昌: 'Nanchang',
  贵阳: 'Guiyang',
  南宁: 'Nanning',
  海口: 'Haikou',
  三亚: 'Sanya',
  拉萨: 'Lhasa',
  乌鲁木齐: 'Urumqi',
  呼和浩特: 'Hohhot',
  兰州: 'Lanzhou',
  银川: 'Yinchuan',
  西宁: 'Xining',
  石家庄: 'Shijiazhuang',
  太原: 'Taiyuan',
  长春: 'Changchun',
  香港: 'Hong Kong',
  澳门: 'Macau',
  台北: 'Taipei',
}

const ENGLISH_TO_CHINESE = new Map(
  Object.entries(CITY_ALIASES).map(([chinese, english]) => [
    english.toLowerCase(),
    chinese,
  ]),
)

export function resolveApiCityName(input: string): string {
  const trimmed = input.trim()
  const normalized = trimmed.replace(/市$/, '')
  return CITY_ALIASES[normalized] ?? trimmed
}

export function resolveDisplayCityName(name: string): string {
  return ENGLISH_TO_CHINESE.get(name.trim().toLowerCase()) ?? name
}
