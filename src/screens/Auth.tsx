import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import type { Account } from '../types';
import { art } from '../art';
import { AppleIcon, CornerSwoosh, GoogleIcon, Wave } from '../components/Illustrations';
import { ThemePill } from '../components/ThemeToggle';

interface Props {
  mode: 'signup' | 'signin';
  account: Account | null;
  onBack: () => void;
  onSwitch: () => void;
  onSignup: (a: Account) => void;
  onSignin: () => void;
}

interface FieldProps {
  icon: ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  invalid?: boolean;
  password?: boolean;
}

function Field({ icon, type = 'text', placeholder, value, onChange, autoComplete, invalid, password }: FieldProps) {
  const [show, setShow] = useState(false);
  return (
    <label className={'field' + (invalid ? ' invalid' : '')}>
      <span className='field-ico'>{icon}</span>
      <input
        type={password ? (show ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      {password && (
        <button type='button' className='field-eye' onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
    </label>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Auth({ mode, account, onBack, onSwitch, onSignup, onSignin }: Props) {
  const signup = mode === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState(signup ? '' : account?.email ?? '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const demo = (msg: string) => {
    setToast(msg);
    later(() => setToast(''), 2200);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const cleanEmail = email.trim().toLowerCase();
    if (signup && name.trim().length < 2) return setError('Please enter your full name.');
    if (!EMAIL_RE.test(cleanEmail)) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (signup && password !== confirm) return setError('Passwords do not match.');
    if (!signup && (!account || account.email !== cleanEmail)) {
      return setError('No account with that email on this device. Please sign up first.');
    }
    setError('');
    setBusy(true);
    later(() => {
      if (signup) onSignup({ name: name.trim(), email: cleanEmail, phone: phone.trim() || undefined });
      else onSignin();
    }, 800);
  };

  return (
    <div className='auth screen-in'>
      <CornerSwoosh />
      <button className='icon-btn auth-back' onClick={onBack} aria-label='Back'>
        <ArrowLeft size={18} />
      </button>
      <div className='auth-theme'>
        <ThemePill />
      </div>

      <form className='auth-body' onSubmit={submit} noValidate>
        <div className='auth-logo'>
          <img className='auth-logo-img' src={art('logo-light')} alt='OPTIQ' />
        </div>
        <h1 className='auth-title'>{signup ? 'Create Your Account' : 'Welcome Back'}</h1>
        <p className='auth-sub'>{signup ? 'Join a growing community of Optometry students' : 'Sign in to continue your studies'}</p>

        <div className='fields stagger'>
          {signup && <Field icon={<User size={18} />} placeholder='Full Name' value={name} onChange={setName} autoComplete='name' />}
          <Field icon={<Mail size={18} />} type='email' placeholder='Email Address' value={email} onChange={setEmail} autoComplete='email' />
          {signup && <Field icon={<Phone size={18} />} type='tel' placeholder='Phone Number (Optional)' value={phone} onChange={setPhone} autoComplete='tel' />}
          <Field icon={<Lock size={18} />} password placeholder='Password' value={password} onChange={setPassword} autoComplete={signup ? 'new-password' : 'current-password'} />
          {signup && <Field icon={<Lock size={18} />} password placeholder='Confirm Password' value={confirm} onChange={setConfirm} autoComplete='new-password' />}
        </div>

        {!signup && (
          <button type='button' className='link-btn right' onClick={() => demo('Password reset is not available yet')}>
            Forgot password?
          </button>
        )}

        <p className={'form-error' + (error ? ' show' : '')} role='alert'>
          {error}
        </p>

        <button className={'btn btn-grad btn-lg' + (busy ? ' busy' : '')} type='submit' disabled={busy}>
          {busy ? <span className='spin' aria-label='Please wait' /> : (
            <>
              {signup ? 'Sign Up' : 'Sign In'} <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className='divider'>
          <span>or continue with</span>
        </div>
        <div className='socials'>
          <button type='button' className='social' onClick={() => demo('Google sign-in is a preview only')} aria-label='Continue with Google'>
            <GoogleIcon />
          </button>
          <button type='button' className='social' onClick={() => demo('Apple sign-in is a preview only')} aria-label='Continue with Apple'>
            <AppleIcon />
          </button>
          <button type='button' className='social' onClick={() => demo('Email link sign-in is a preview only')} aria-label='Continue with email link'>
            <Mail size={20} />
          </button>
        </div>

        <p className='auth-switch'>
          {signup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type='button' className='link-btn inline' onClick={onSwitch}>
            {signup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </form>

      <Wave />
      <div className={'toast' + (toast ? ' show' : '')} role='status'>
        {toast}
      </div>
    </div>
  );
}
