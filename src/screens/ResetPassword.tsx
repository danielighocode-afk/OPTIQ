import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { art } from '../art';
import { CornerSwoosh, Wave } from '../components/Illustrations';

interface Props {
  onSubmit: (password: string) => Promise<string | undefined>;
  onCancel: () => void;
}

export default function ResetPassword({ onSubmit, onCancel }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setError('');
    setBusy(true);
    const problem = await onSubmit(password);
    setBusy(false);
    if (problem) setError(problem);
  };

  return (
    <div className='auth screen-in'>
      <CornerSwoosh />
      <form className='auth-body' onSubmit={submit} noValidate>
        <div className='auth-logo'>
          <img className='auth-logo-img' src={art('logo-light')} alt='OPTIQ' />
        </div>
        <h1 className='auth-title'>Set a New Password</h1>
        <p className='auth-sub'>Choose a password you will remember.</p>
        <div className='fields'>
          <label className='field'>
            <span className='field-ico'>
              <Lock size={18} />
            </span>
            <input type={show ? 'text' : 'password'} placeholder='New Password' value={password} autoComplete='new-password' onChange={(e) => setPassword(e.target.value)} />
            <button type='button' className='field-eye' onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </label>
          <label className='field'>
            <span className='field-ico'>
              <Lock size={18} />
            </span>
            <input type={show ? 'text' : 'password'} placeholder='Confirm New Password' value={confirm} autoComplete='new-password' onChange={(e) => setConfirm(e.target.value)} />
          </label>
        </div>
        <p className={'form-error' + (error ? ' show' : '')} role='alert'>
          {error}
        </p>
        <button className='btn btn-grad btn-lg' type='submit' disabled={busy}>
          {busy ? <span className='spin' aria-label='Please wait' /> : (
            <>
              Save Password <ArrowRight size={18} />
            </>
          )}
        </button>
        <button type='button' className='link-btn underline' onClick={onCancel}>
          Cancel
        </button>
      </form>
      <Wave />
    </div>
  );
}
