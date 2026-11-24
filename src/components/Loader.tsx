import { art } from '../art';
import { EyeMark } from './Logo';

export type LoaderVariant = 'ring' | 'dots' | 'eye' | 'word';

interface Props {
  variant?: LoaderVariant;
  label?: string;
}

function Spinner({ variant }: { variant: LoaderVariant }) {
  if (variant === 'dots') {
    return (
      <div className='ld-dots' aria-hidden='true'>
        {Array.from({ length: 12 }).map((_, i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </div>
    );
  }
  if (variant === 'eye') {
    return <img className='ld-eye-img' src={art('loader-eye')} alt='' />;
  }
  if (variant === 'word') {
    return (
      <div className='ld-ring ld-word' aria-hidden='true'>
        <span>OPTIQ</span>
      </div>
    );
  }
  return (
    <div className='ld-ring' aria-hidden='true'>
      <EyeMark height={34} />
    </div>
  );
}

/** White start-up screen: the logo is painted in (eye opens, wordmark sweeps in) and repeats until the app is ready. */
export function BootLoader({ label = 'App Loading...' }: { label?: string }) {
  const src = art('logo-full');
  return (
    <div className='boot' role='status' aria-live='polite'>
      <div className='boot-logo' aria-hidden='true'>
        <div className='boot-eye'>
          <img src={src} alt='' />
        </div>
        <div className='boot-word'>
          <img src={src} alt='' />
        </div>
      </div>
      <p className='boot-label'>{label}</p>
    </div>
  );
}

export default function Loader({ variant = 'ring', label = 'Loading...' }: Props) {
  return (
    <div className='loader' role='status' aria-live='polite'>
      <Spinner variant={variant} />
      <p>{label}</p>
    </div>
  );
}
