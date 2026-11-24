// Small inline bar-chart icon (kept local so it does not depend on a specific lucide icon name).
export function BarChart3Icon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' aria-hidden='true'>
      <path d='M5 20v-6M12 20V6M19 20v-10' />
    </svg>
  );
}
