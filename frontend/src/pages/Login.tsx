import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { ChefHat } from 'lucide-react';
import { auth } from '../firebase';

const friendly = (err: unknown) => {
  const raw = err instanceof Error ? err.message : String(err);
  const codeMatch = raw.match(/\(auth\/([^)]+)\)/);
  const code = codeMatch?.[1];
  const messages: Record<string, string> = {
    'user-not-found': 'No account found with this email.',
    'wrong-password': 'Incorrect password.',
    'invalid-credential': 'Incorrect email or password.',
    'too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'network-request-failed': 'Network error. Check your connection.',
    'user-disabled': 'This account has been disabled.',
  };
  return code && messages[code] ? messages[code] : raw.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, '') || 'An error occurred. Please try again.';
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(friendly(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate('/');
    } catch (err) {
      setError(friendly(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <ChefHat size={40} color="var(--accent-primary)" style={{ marginBottom: '0.75rem' }} />
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', margin: 0 }}>PantryAI</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Sign in to your account</p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--accent-danger)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {/* Email / Password */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.4rem' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="glass-input" placeholder="you@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="glass-input" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '0.6rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
