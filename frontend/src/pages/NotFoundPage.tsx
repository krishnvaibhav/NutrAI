import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
    <div style={{ fontSize: '5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--accent-primary)', lineHeight: 1 }}>404</div>
    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Page not found</h1>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '320px' }}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/" style={{ textDecoration: 'none' }}>
      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
        <LayoutDashboard size={16} />
        Back to Dashboard
      </button>
    </Link>
  </div>
);

export default NotFoundPage;
