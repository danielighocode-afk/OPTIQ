import { useCallback, useEffect, useState } from 'react';

function current(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/';
}

export function useHashRoute() {
  const [path, setPath] = useState<string>(current());

  useEffect(() => {
    const onChange = () => setPath(current());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const go = useCallback((to: string) => {
    window.location.hash = to;
    window.scrollTo(0, 0);
  }, []);

  return { path, go };
}
