import { useState } from 'react';
import { art } from '../art';

interface Props {
  variant?: 'mark' | 'full';
  size?: number;
}

/** Real OPTIQ eye, cropped from the design (white on navy). Use on dark backgrounds only. */
export function EyeMark({ height = 34 }: { height?: number }) {
  return <img className='eye-mark' src={art('logo-eye')} alt='' style={{ height }} />;
}

export default function Logo({ variant = 'mark', size = 34 }: Props) {
  const [failed, setFailed] = useState(false);

  if (variant === 'full') {
    if (failed) {
      return (
        <span className='logo logo-lg'>
          <EyeMark height={64} />
          <span className='logo-word'>OPTIQ</span>
        </span>
      );
    }
    return <img className='logo-img' src='./resources/logo.png' alt='Optiq logo' onError={() => setFailed(true)} />;
  }

  return (
    <span className='logo'>
      <EyeMark height={size} />
      <span className='logo-word'>OPTIQ</span>
    </span>
  );
}
