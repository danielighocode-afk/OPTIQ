// Simple SVG stand-ins for the artwork in the design mockups.

export function Wave({ flip = false }: { flip?: boolean }) {
  return (
    <svg className={'wave' + (flip ? ' wave-top' : '')} viewBox='0 0 400 90' preserveAspectRatio='none' aria-hidden='true'>
      <defs>
        <linearGradient id='wv1' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0' stopColor='#0a1a4d' />
          <stop offset='1' stopColor='#1f4fd8' />
        </linearGradient>
        <linearGradient id='wv2' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0' stopColor='#14c8bf' />
          <stop offset='1' stopColor='#1f4fd8' />
        </linearGradient>
      </defs>
      <path d='M0 40 C80 10 150 70 240 45 C310 25 360 20 400 35 L400 90 L0 90 Z' fill='url(#wv2)' opacity='0.55' />
      <path d='M0 58 C90 30 170 85 260 60 C320 44 370 46 400 56 L400 90 L0 90 Z' fill='url(#wv1)' />
    </svg>
  );
}

export function CornerSwoosh() {
  return (
    <svg className='corner-swoosh' viewBox='0 0 200 160' aria-hidden='true'>
      <defs>
        <linearGradient id='cs1' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#14c8bf' />
          <stop offset='1' stopColor='#1f4fd8' />
        </linearGradient>
        <linearGradient id='cs2' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#1f4fd8' />
          <stop offset='1' stopColor='#0a1a4d' />
        </linearGradient>
      </defs>
      <path d='M60 0 C90 50 140 60 200 55 L200 0 Z' fill='url(#cs1)' opacity='0.5' />
      <path d='M110 0 C130 35 160 45 200 40 L200 0 Z' fill='url(#cs2)' />
    </svg>
  );
}

export function StudentAvatar({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 120 120' aria-hidden='true'>
      <defs>
        <linearGradient id='av-bg' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#cfe2ff' />
          <stop offset='1' stopColor='#7ea6f5' />
        </linearGradient>
        <clipPath id='av-clip'>
          <circle cx='60' cy='60' r='60' />
        </clipPath>
      </defs>
      <g clipPath='url(#av-clip)'>
        <rect width='120' height='120' fill='url(#av-bg)' />
        <path d='M10 130 C12 96 34 84 60 84 C86 84 108 96 110 130 Z' fill='#0a1a4d' />
        <path d='M48 84 L60 100 L72 84' fill='#fff' />
        <rect x='52' y='68' width='16' height='18' rx='6' fill='#0c1840' />
        <ellipse cx='60' cy='56' rx='19' ry='22' fill='#0c1840' />
        <path d='M60 10 L100 30 L60 48 L20 30 Z' fill='#0a1a4d' />
        <path d='M38 42 L38 54 C46 62 74 62 82 54 L82 42 L60 52 Z' fill='#16327e' />
        <path d='M96 31 L96 52' stroke='#14c8bf' strokeWidth='3' strokeLinecap='round' />
        <circle cx='96' cy='54' r='4' fill='#14c8bf' />
      </g>
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 48 48' aria-hidden='true'>
      <path fill='#EA4335' d='M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z' />
      <path fill='#4285F4' d='M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z' />
      <path fill='#FBBC05' d='M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z' />
      <path fill='#34A853' d='M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z' />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg width='22' height='22' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
      <path d='M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.100 2.800-2.200.9-1.300 1.300-2.500 1.300-2.600 0 0-2.500-1-2.500-3.900zM14.200 5.800c.6-.8 1.100-1.800.9-2.800-.9 0-2 .6-2.600 1.400-.6.700-1.100 1.700-.9 2.700 1 .1 2-.5 2.600-1.300z' />
    </svg>
  );
}
