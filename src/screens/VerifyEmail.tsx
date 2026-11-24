import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { art } from '../art';
import { CornerSwoosh, Wave } from '../components/Illustrations';

interface Props {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}

const WAIT = 58;

/** Mock screen: no email is sent. Tapping the button continues as if verified. */
export default function VerifyEmail({ email, onBack, onVerified }: Props) {
  const [left, setLeft] = useState(WAIT);
  const [sent, setSent] = useState(false);
  const sentTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);

  useEffect(() => () => window.clearTimeout(sentTimer.current), []);

  const resend = () => {
    if (left > 0) return;
    setLeft(WAIT);
    setSent(true);
    window.clearTimeout(sentTimer.current);
    sentTimer.current = window.setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className='auth verify screen-in'>
      <CornerSwoosh />
      <button className='icon-btn auth-back' onClick={onBack} aria-label='Back'>
        <ArrowLeft size={18} />
      </button>
      <div className='verify-body'>
        <div className='float'>
          <img className='art-img envelope' src={art('envelope')} alt='' />
        </div>
        <h1 className='auth-title'>Check Your Email</h1>
        <p className='auth-sub'>We've sent a verification link to</p>
        <p className='verify-email'>{email}</p>
        <p className='auth-sub dim'>
          Click the link to verify your account.
          <br />
          It may take a few minutes.
        </p>
        <button className='btn btn-grad btn-lg' onClick={onVerified}>
          <Mail size={18} /> Open Email App
        </button>
        <button className='link-btn underline' onClick={resend} disabled={left > 0}>
          {sent ? 'Email sent!' : left > 0 ? `Resend Email (${left}s)` : 'Resend Email'}
        </button>
        <p className='mock-note'>Preview only: no email is sent. Tap the button to continue.</p>
      </div>
      <Wave />
    </div>
  );
}
