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

export default function Loader({ variant = 'ring', label = 'Loading...' }: Props) {
  return (
    <div className='loader' role='status' aria-live='polite'>
      <Spinner variant={variant} />
      <p>{label}</p>
    </div>
  );
}
