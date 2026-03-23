import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { LogOut, Crown, HelpCircle } from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

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
      {/* Upgrade banner for free users */}
      {userTier === 'free' && (
        <div style={{ background: 'rgba(45,74,62,0.06)', border: '1px solid rgba(45,74,62,0.15)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.2rem' }}>Free Plan</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', lineHeight: 1.4 }}>Unlock unlimited recipes & vision scan.</p>
          <Link to="/account" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem' }}>
              Upgrade to Pro
            </button>
          </Link>
        </div>
      )}

      {userTier === 'pro' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', padding: '0.4rem 0' }}>
          <Crown size={13} color="#D97706" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#D97706' }}>Pro Plan</span>
        </div>
      )}

      {/* Email */}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.5rem', padding: '0 0.1rem' }}>
        {currentUser.email}
      </div>

      {/* Help + Logout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', width: '100%', textAlign: 'left' }}
        >
          <HelpCircle size={16} /> Help
        </button>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', width: '100%', textAlign: 'left' }}
          title="Sign out"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
