import { useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { art } from '../art';
import { Wave } from '../components/Illustrations';

interface Props {
  onDone: () => void;
}

const SLIDES = [
  {
    art: <img className='art-img' src={art('welcome')} alt='' />,
    title: 'Welcome to OPTIQ!',
    text: 'Your all-in-one platform for Optometry education and examination preparation.',
  },
  {
    art: <img className='art-img' src={art('explore')} alt='' />,
    title: 'Explore & Learn',
    text: 'Dive into interactive lessons, 3D visuals and detailed notes on all Optometry courses.',
  },
  {
    art: <img className='art-img' src={art('exam')} alt='' />,
    title: 'Get Exam Ready',
    text: 'Take quizzes, practise past questions and track your progress effortlessly.',
  },
];

export default function Intro({ onDone }: Props) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const last = i === SLIDES.length - 1;

  const next = () => (last ? onDone() : setI(i + 1));

  const onTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (dx < -50 && i < SLIDES.length - 1) setI(i + 1);
    if (dx > 50 && i > 0) setI(i - 1);
  };

  return (
    <div className='intro screen-in'>
      <button className='skip' onClick={onDone}>
        Skip
      </button>
      <div className='slides' onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className='slides-track' style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s, n) => (
            <section className={'slide' + (n === i ? ' active' : '')} key={s.title} aria-hidden={n !== i}>
              <div className='slide-art'>{s.art}</div>
              <h1>{s.title}</h1>
              <p>{s.text}</p>
            </section>
          ))}
        </div>
      </div>
      <div className='dots' role='tablist' aria-label='Slides'>
        {SLIDES.map((s, n) => (
          <button key={s.title} className={'dot' + (n === i ? ' on' : '')} onClick={() => setI(n)} aria-label={'Slide ' + (n + 1)} />
        ))}
      </div>
      <div className='intro-cta'>
        <button className='btn btn-grad btn-lg' onClick={next}>
          {last ? "Let's Get Started" : 'Next'} <ArrowRight size={18} />
        </button>
      </div>
      <Wave />
    </div>
  );
}
