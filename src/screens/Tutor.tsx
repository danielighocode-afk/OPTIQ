import { ArrowLeft, Bot } from 'lucide-react';
import Logo from '../components/Logo';

interface Props {
  go: (to: string) => void;
}

/** Preview only: the AI tutor is not built yet. */
export default function Tutor({ go }: Props) {
  return (
    <div className='screen'>
      <section className='app-hero page-hero short'>
        <div className='hero-row'>
          <Logo />
        </div>
        <div className='hero-copy'>
          <h1 className='hero-title'>AI Tutor</h1>
          <p className='hero-text'>Your study helper is on the way.</p>
        </div>
      </section>
      <div className='screen-body'>
        <div className='empty-card tutor'>
          <span className='qa-ico bot big'>
            <Bot size={40} />
          </span>
          <h3>Coming soon</h3>
          <p>Soon you will be able to ask questions about your courses and get clear explanations here.</p>
          <button className='btn btn-grad' style={{ marginTop: 16 }} onClick={() => go('/')}>
            <ArrowLeft size={18} /> Back home
          </button>
        </div>
      </div>
    </div>
  );
}
