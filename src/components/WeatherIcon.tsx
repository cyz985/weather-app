import { useId } from 'react'
import { getWeatherKind, type WeatherKind } from '../lib/weatherTheme'

interface WeatherIconProps {
  code: number
  isNight?: boolean
  size?: number
  className?: string
}

interface ArtProps {
  uid: string
}

interface ArtWithNightProps extends ArtProps {
  isNight: boolean
}

function Defs({ uid }: ArtProps) {
  return (
    <defs>
      <linearGradient id={`sun-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE39A" />
        <stop offset="100%" stopColor="#FFA32B" />
      </linearGradient>
      <linearGradient id={`moon-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFF8CC" />
        <stop offset="100%" stopColor="#F4D77A" />
      </linearGradient>
      <linearGradient id={`cloud-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#D5E4F3" />
      </linearGradient>
      <linearGradient id={`cloud-soft-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F4F9FF" />
        <stop offset="100%" stopColor="#B9CFE2" />
      </linearGradient>
      <linearGradient id={`rain-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9AD6FF" />
        <stop offset="100%" stopColor="#3D8FDE" />
      </linearGradient>
    </defs>
  )
}

function Cloud({ uid, opacity = 1 }: ArtProps & { opacity?: number }) {
  return (
    <g className="weather-icon__cloud" opacity={opacity}>
      <path
        d="M18.5 45h26.8a8.2 8.2 0 0 0 .8-16.3A12.8 12.8 0 0 0 21.8 27 9.2 9.2 0 0 0 18.5 45Z"
        fill={`url(#cloud-${uid})`}
      />
    </g>
  )
}

function Sun({ uid }: ArtProps) {
  return (
    <g>
      <g
        className="weather-icon__rays"
        stroke={`url(#sun-${uid})`}
        strokeWidth="2.6"
        strokeLinecap="round"
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="32"
            y1="8.5"
            x2="32"
            y2="14"
            transform={`rotate(${angle} 32 32)`}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="12.5" fill={`url(#sun-${uid})`} />
      <circle cx="27.5" cy="27.5" r="4" fill="#FFF6C9" opacity="0.55" />
    </g>
  )
}

function Moon({ uid }: ArtProps) {
  return (
    <g>
      <path
        d="M40.5 9.5a17.5 17.5 0 1 0 10.2 30.2 14.2 14.2 0 0 1-10.2-30.2Z"
        fill={`url(#moon-${uid})`}
      />
      <circle cx="17" cy="18" r="1.6" fill="#FFF8CC" opacity="0.9" />
      <circle cx="23" cy="28" r="1" fill="#FFF8CC" opacity="0.75" />
      <circle cx="47" cy="45" r="1.3" fill="#FFF8CC" opacity="0.8" />
    </g>
  )
}

function SunCloud({ uid }: ArtProps) {
  return (
    <g>
      <g
        transform="translate(-4 -5) scale(0.78)"
        style={{ transformOrigin: '32px 32px' }}
      >
        <Sun uid={uid} />
      </g>
      <g transform="translate(3 5)">
        <Cloud uid={uid} />
      </g>
    </g>
  )
}

function MoonCloud({ uid }: ArtProps) {
  return (
    <g>
      <g
        transform="translate(-3 -6) scale(0.72)"
        style={{ transformOrigin: '32px 32px' }}
      >
        <Moon uid={uid} />
      </g>
      <g transform="translate(3 5)">
        <Cloud uid={uid} />
      </g>
    </g>
  )
}

function Rain({ uid, drizzle = false }: ArtProps & { drizzle?: boolean }) {
  return (
    <g>
      <Cloud uid={uid} />
      <g
        className="weather-icon__rain"
        stroke={`url(#rain-${uid})`}
        strokeWidth={drizzle ? 2.4 : 3}
        strokeLinecap="round"
      >
        <line x1="24" y1="48" x2={drizzle ? '22' : '21'} y2={drizzle ? '53' : '55'} />
        <line
          x1="32"
          y1="48"
          x2={drizzle ? '30' : '29'}
          y2={drizzle ? '53' : '56'}
          style={{ animationDelay: '0.25s' }}
        />
        <line
          x1="40"
          y1="48"
          x2={drizzle ? '38' : '37'}
          y2={drizzle ? '53' : '55'}
          style={{ animationDelay: '0.5s' }}
        />
      </g>
    </g>
  )
}

function Thunder({ uid }: ArtProps) {
  return (
    <g>
      <Cloud uid={uid} />
      <path
        d="M34.5 43 25 55h6l-2.2 7L40 49h-6.2l3.2-6Z"
        fill="#FFD166"
        stroke="#FFB703"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </g>
  )
}

function Snow({ uid }: ArtProps) {
  return (
    <g>
      <Cloud uid={uid} />
      <g
        className="weather-icon__snow"
        stroke="#CBE8FF"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M24 48v8M20.5 50l7 4M27.5 50l-7 4" />
        <path d="M34 48v8M30.5 50l7 4M37.5 50l-7 4" style={{ animationDelay: '0.4s' }} />
        <path d="M44 48v8M40.5 50l7 4M47.5 50l-7 4" style={{ animationDelay: '0.8s' }} />
      </g>
    </g>
  )
}

function Mist({ uid }: ArtProps) {
  return (
    <g>
      <Cloud uid={uid} opacity={0.72} />
      <g stroke="#DCE9F5" strokeWidth="2.6" strokeLinecap="round" opacity="0.9">
        <line x1="18" y1="49" x2="44" y2="49" />
        <line x1="22" y1="54" x2="48" y2="54" />
        <line x1="16" y1="59" x2="38" y2="59" />
      </g>
    </g>
  )
}

function Clouds({ uid }: ArtProps) {
  return (
    <g>
      <g transform="translate(-7 -6) scale(0.78)" opacity="0.75">
        <Cloud uid={uid} />
      </g>
      <g transform="translate(3 4)">
        <Cloud uid={uid} />
      </g>
    </g>
  )
}

function Art({ kind, isNight, uid }: ArtWithNightProps & { kind: WeatherKind }) {
  if (kind === 'clear') {
    return isNight ? <Moon uid={uid} /> : <Sun uid={uid} />
  }
  if (kind === 'partly') {
    return isNight ? <MoonCloud uid={uid} /> : <SunCloud uid={uid} />
  }
  if (kind === 'cloudy') return <Clouds uid={uid} />
  if (kind === 'rain') return <Rain uid={uid} drizzle={false} />
  if (kind === 'thunder') return <Thunder uid={uid} />
  if (kind === 'snow') return <Snow uid={uid} />
  return <Mist uid={uid} />
}

export function WeatherIcon({
  code,
  isNight = false,
  size = 96,
  className = '',
}: WeatherIconProps) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <Defs uid={uid} />
      <Art kind={getWeatherKind(code)} isNight={isNight} uid={uid} />
    </svg>
  )
}
