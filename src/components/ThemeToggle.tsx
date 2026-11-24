import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { loadTheme, saveTheme } from '../storage';
import type { Theme } from '../types';

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#061033' : '#0a1a4d');
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());
  const set = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    saveTheme(t);
  };
  return [theme, set];
}

/** Small sun/moon pill used on the auth screens. */
export function ThemePill() {
  const [theme, setTheme] = useTheme();
  return (
    <button
      className={'theme-pill ' + theme}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className='theme-knob'>{theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}</span>
      <Sun size={13} className='theme-ico l' />
      <Moon size={13} className='theme-ico r' />
    </button>
  );
}
