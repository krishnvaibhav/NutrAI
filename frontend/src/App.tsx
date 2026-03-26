import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ChefHat, Activity, User, ScanLine, Sun, Moon } from 'lucide-react';
import HomePage from './pages/HomePage';
import PantryPage from './pages/PantryPage';
import RecipesPage from './pages/RecipesPage';
import NutritionPage from './pages/NutritionPage';
import VisionPage from './pages/VisionPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

function App() {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Theme management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('pantryai-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pantryai-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pantry', path: '/pantry', icon: Package },
    { name: 'Health', path: '/nutrition', icon: Activity },
    { name: 'Recipes', path: '/recipes', icon: ChefHat },
    { name: 'Vision', path: '/vision', icon: ScanLine },
    { name: 'Account', path: '/account', icon: User },
  ];

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showChrome = !isAuthPage && !!currentUser;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg-primary)' }}>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      {showChrome && !isMobile && (
        <aside style={{
          width: '220px', minWidth: '220px',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
        }}>
          {/* Logo + theme toggle */}
          <div style={{ padding: '1.5rem 1.25rem 1.1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ChefHat size={16} color="white" />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)', lineHeight: 1.1 }}>
                  PantryAI
                </div>
                <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>
                  Verdant Intelligence
                </div>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '7px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0, transition: 'all var(--transition-fast)' }}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0.85rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)', background: isActive ? 'rgba(91, 184, 138, 0.1)' : 'transparent', textDecoration: 'none', fontWeight: isActive ? 600 : 400, fontSize: '0.875rem', transition: 'all var(--transition-fast)' }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                  <Icon size={17} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <Navbar />
          </div>
        </aside>
      )}

      {/* ── Mobile top header ───────────────────────────────────────────── */}
      {showChrome && isMobile && (
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '52px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 200,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ChefHat size={15} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-primary)' }}>
              PantryAI
            </span>
          </div>
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '7px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </header>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        height: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: showChrome && isMobile ? '52px' : undefined,
        paddingBottom: showChrome && isMobile ? '60px' : undefined,
      }}>
        <div className="animate-fade-in" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/pantry" element={<ProtectedRoute><PantryPage /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
            <Route path="/vision" element={<ProtectedRoute><VisionPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>

      {/* ── Mobile bottom nav ───────────────────────────────────────────── */}
      {showChrome && isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '60px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'stretch',
          zIndex: 200,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '3px', flex: 1,
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  borderTop: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  transition: 'color var(--transition-fast)',
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: '0.62rem', fontWeight: isActive ? 600 : 400, lineHeight: 1 }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default App;
