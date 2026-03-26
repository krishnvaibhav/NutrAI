import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const PRO_ENABLED = import.meta.env.VITE_PRO_ENABLED === 'true';

export default function Navbar() {
  const { currentUser, userTier } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div style={{ padding: '1rem 0.75rem' }}>
      {/* Identity row with tier badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {currentUser.email ?? currentUser.phoneNumber ?? 'User'}
        </div>
        {/* Tier badge */}
        {userTier === 'pro' ? (
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
            background: 'rgba(45,74,62,0.1)', color: 'var(--accent-primary)',
            border: '1px solid rgba(45,74,62,0.2)',
            borderRadius: 'var(--radius-full)', padding: '0.15rem 0.5rem',
            textTransform: 'uppercase', flexShrink: 0,
          }}>Pro</span>
        ) : (
          <span style={{
            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.04em',
            background: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)', padding: '0.15rem 0.5rem',
            textTransform: 'uppercase', flexShrink: 0,
          }}>Free</span>
        )}
      </div>

      {/* Upgrade prompt for free users */}
      {userTier === 'free' && (
        <Link to="/account" style={{ textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 500, padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(45,74,62,0.05)', border: '1px solid rgba(45,74,62,0.1)' }}>
            {PRO_ENABLED ? 'Upgrade for unlimited recipes & vision →' : 'Pro coming soon — join the waitlist →'}
          </div>
        </Link>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', width: '100%', textAlign: 'left' }}
        title="Sign out"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
