import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Building2, BookOpen, Camera, ChevronRight, GraduationCap, LogOut, Moon, Pencil, X } from 'lucide-react';
import { QUIZZES } from '../data/quizzes';
import { percent } from '../storage';
import type { Account, Profile as ProfileData, Results } from '../types';
import { StudentAvatar } from '../components/Illustrations';
import { useTheme } from '../components/ThemeToggle';

interface Props {
  account: Account;
  profile: ProfileData;
  results: Results;
  onSaveAccount: (a: Account) => void;
  onEditAcademic: () => void;
  onLogout: () => void;
}

function resizeImage(file: File, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function Profile({ account, profile, results, onSaveAccount, onEditAcademic, onLogout }: Props) {
  const [theme, setTheme] = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(account.name);
  const [phone, setPhone] = useState(account.phone ?? '');
  const fileRef = useRef<HTMLInputElement>(null);

  const taken = Object.values(results);
  const average = taken.length ? Math.round(taken.reduce((sum, r) => sum + percent(r), 0) / taken.length) : 0;
  const progress = QUIZZES.length ? Math.min(100, Math.round((taken.length / QUIZZES.length) * 100)) : 0;

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setEditing(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  const openEdit = () => {
    setName(account.name);
    setPhone(account.phone ?? '');
    setEditing(true);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    onSaveAccount({ ...account, name: name.trim(), phone: phone.trim() || undefined });
    setEditing(false);
  };

  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    try {
      onSaveAccount({ ...account, avatar: await resizeImage(file, 256) });
    } catch {
      // unreadable image: keep the current picture
    }
  };

  return (
    <div className='profile-page'>
      <section className='profile-hero'>
        <div className='avatar-wrap'>
          <div className='avatar'>
            {account.avatar ? <img src={account.avatar} alt='' /> : <StudentAvatar size={104} />}
          </div>
          <button className='avatar-cam' onClick={() => fileRef.current?.click()} aria-label='Change profile photo'>
            <Camera size={16} />
          </button>
          <input ref={fileRef} type='file' accept='image/*' hidden onChange={pickPhoto} />
        </div>
        <h1>{account.name}</h1>
        <p>Optometry Student · {profile.level} Level</p>
      </section>

      <div className='profile-stats'>
        <div>
          <strong>{progress}%</strong>
          <span>Overall Progress</span>
        </div>
        <div>
          <strong>{taken.length}</strong>
          <span>Quizzes Taken</span>
        </div>
        <div>
          <strong>{taken.length ? average + '%' : '-'}</strong>
          <span>Average Score</span>
        </div>
      </div>

      <div className='profile-body stagger'>
        <div className='block-head'>
          <h2>My Profile</h2>
          <button className='pill-btn' onClick={openEdit}>
            <Pencil size={14} /> Edit Profile
          </button>
        </div>
        <div className='card-list'>
          <button className='p-row' onClick={onEditAcademic}>
            <span className='p-ico'>
              <GraduationCap size={22} />
            </span>
            <span className='p-text'>
              <small>Academic Level</small>
              <b>
                {profile.level} Level · OPT {profile.set}
              </b>
            </span>
            <ChevronRight size={18} />
          </button>
          <div className='p-row static'>
            <span className='p-ico'>
              <BookOpen size={22} />
            </span>
            <span className='p-text'>
              <small>Course(s)</small>
              <b>Optometry</b>
            </span>
          </div>
          <div className='p-row static'>
            <span className='p-ico'>
              <Building2 size={22} />
            </span>
            <span className='p-text'>
              <small>University</small>
              <b>UNIBEN</b>
            </span>
          </div>
        </div>

        <div className='block-head'>
          <h2>Account</h2>
        </div>
        <div className='card-list'>
          <div className='p-row static'>
            <span className='p-text'>
              <small>Email</small>
              <b>{account.email}</b>
            </span>
          </div>
          <div className='p-row static'>
            <span className='p-text'>
              <small>Phone</small>
              <b>{account.phone || 'Not added'}</b>
            </span>
          </div>
        </div>

        <div className='block-head'>
          <h2>App Preferences</h2>
        </div>
        <div className='card-list'>
          <div className='p-row static'>
            <span className='p-ico'>
              <Moon size={22} />
            </span>
            <span className='p-text'>
              <b>Dark Mode</b>
            </span>
            <button
              className={'switch' + (theme === 'dark' ? ' on' : '')}
              role='switch'
              aria-checked={theme === 'dark'}
              aria-label='Dark mode'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <i />
            </button>
          </div>
        </div>

        <button className='btn btn-ghost logout' onClick={onLogout}>
          <LogOut size={18} /> Log out
        </button>
      </div>

      {editing && (
        <div className='sheet-wrap' onClick={() => setEditing(false)}>
          <form className='sheet' onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <div className='sheet-head'>
              <h2>Edit Profile</h2>
              <button type='button' className='icon-btn' onClick={() => setEditing(false)} aria-label='Close'>
                <X size={18} />
              </button>
            </div>
            <label className='plain-field'>
              <span>Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete='name' />
            </label>
            <label className='plain-field'>
              <span>Phone (optional)</span>
              <input type='tel' value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete='tel' />
            </label>
            <button className='btn btn-grad btn-lg' type='submit' disabled={name.trim().length < 2}>
              Save changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
