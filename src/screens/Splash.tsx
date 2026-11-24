import { ArrowRight } from 'lucide-react';
import { art } from '../art';

interface Props {
  onStart: () => void;
  onSignIn: () => void;
}

export default function Splash({ onStart, onSignIn }: Props) {
  return (
    <div className='splash screen-in'>
      <div className='splash-glow' aria-hidden='true' />
      <div className='splash-streak' aria-hidden='true' />
      <div className='splash-top'>
        <img className='splash-logo' src={art('splash-logo')} alt='OPTIQ' />
        <p className='splash-tag'>
          Your Complete
          <br />
          Optometry Learning Hub
        </p>
        <p className='splash-sub'>Learn &bull; Practice &bull; Excel</p>
      </div>
      <div className='splash-photo'>
        <img src={art('splash-photo')} alt='' />
      </div>
      <div className='splash-actions'>
        <button className='btn btn-mint btn-lg' onClick={onStart}>
          Get Started <ArrowRight size={18} />
        </button>
        <button className='link-btn light' onClick={onSignIn}>
          I Already Have an Account
        </button>
      </div>
      <div className='splash-wave' aria-hidden='true' />
    </div>
  );
}
