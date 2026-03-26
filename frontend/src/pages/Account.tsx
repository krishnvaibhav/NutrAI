import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Crown, LogOut, Lock, Bell, CheckCircle } from 'lucide-react';
import { auth } from '../firebase';
import { apiCall } from '../api';
import { useAuth } from '../context/AuthContext';

const PRO_ENABLED = import.meta.env.VITE_PRO_ENABLED === 'true';

export default function Account() {
  const { currentUser, userTier } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const handleUpgrade = async () => {
    setUpgradeError('');
    setUpgradeLoading(true);
    try {
      const data = await apiCall('POST', '/payments/checkout');
      window.location.href = data.checkout_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not start checkout.';
      setUpgradeError(msg);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      await apiCall('POST', '/payments/waitlist');
      setWaitlistJoined(true);
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setPwSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setPwError(msg.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''));
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const isPro = userTier === 'pro';
  const isEmailUser = currentUser?.providerData?.[0]?.providerId === 'password';
  const identity = currentUser?.email ?? currentUser?.phoneNumber ?? 'User';

  return (
    <div className="page-content" style={{ maxWidth: '680px' }}>
      <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Account</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{identity}</p>

      {/* Subscription */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Crown size={20} color={isPro ? '#fbbf24' : 'var(--text-secondary)'} />
          Subscription
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: isPro ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.08)',
              color: isPro ? '#fbbf24' : 'var(--text-secondary)',
              border: isPro ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {isPro ? 'Pro' : 'Free'}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isPro ? 'Unlimited recipes, vision scan, and AI nutrition analysis.' : '3 recipe suggestions/day. Vision scan and AI logging are Pro features.'}
          </span>
        </div>

        {!isPro && (
          PRO_ENABLED ? (
            <>
              {upgradeError && (
                <p style={{ color: 'var(--accent-danger)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{upgradeError}</p>
              )}
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro'}
              </button>
            </>
          ) : (
            <div style={{ background: 'rgba(45,74,62,0.06)', border: '1px solid rgba(45,74,62,0.15)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>Pro is launching soon</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                Unlimited recipes, AI vision scan, and advanced nutrition insights. Be the first to know when it's live.
              </p>
              {waitlistJoined ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                  <CheckCircle size={16} />
                  You're on the list — we'll email you when Pro launches.
                </div>
              ) : (
                <button
                  onClick={handleJoinWaitlist}
                  disabled={waitlistLoading}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Bell size={15} />
                  {waitlistLoading ? 'Saving...' : 'Notify me when Pro launches'}
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Change Password — only for email/password accounts */}
      {isEmailUser && <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={20} color="var(--accent-primary)" />
          Change Password
        </h3>

        {pwError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {pwError}
          </div>
        )}
        {pwSuccess && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', color: '#4ade80', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {pwSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="glass-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="glass-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-secondary" disabled={pwLoading} style={{ alignSelf: 'flex-start' }}>
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>}

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="btn-secondary"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
