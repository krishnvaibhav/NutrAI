import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import AILoader from './AILoader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <AILoader message="Loading NutriAI" variant="default" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Only enforce for email/password accounts (Google OAuth is pre-verified)
  const isEmailProvider = currentUser.providerData.some(p => p.providerId === 'password');
  if (isEmailProvider && !currentUser.emailVerified) {
    const handleResend = async () => {
      setResending(true);
      try {
        await sendEmailVerification(auth.currentUser!);
        setResent(true);
      } finally {
        setResending(false);
      }
    };

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="glass-panel" style={{ maxWidth: '420px', width: '90%', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✉️</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verify your email</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            We sent a verification link to <strong>{currentUser.email}</strong>. Click the link in that email, then refresh this page.
          </p>
          {resent ? (
            <p style={{ color: 'var(--accent-secondary)', fontSize: '0.875rem' }}>Email resent — check your inbox.</p>
          ) : (
            <button className="btn-primary" onClick={handleResend} disabled={resending} style={{ width: '100%', justifyContent: 'center' }}>
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          )}
          <button
            onClick={() => { auth.signOut(); }}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
