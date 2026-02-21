import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Package, ChefHat, Activity, MessageSquare } from 'lucide-react';
import HomePage from './pages/HomePage';
import PantryPage from './pages/PantryPage';
import RecipesPage from './pages/RecipesPage';
import NutritionPage from './pages/NutritionPage';
import ChatAgentPage from './pages/ChatAgentPage';

function App() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Pantry', path: '/pantry', icon: Package },
    { name: 'Recipes', path: '/recipes', icon: ChefHat },
    { name: 'Health', path: '/nutrition', icon: Activity },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar Navigation */}
      <aside
        className="glass-panel"
        style={{
          width: '260px',
          margin: '1rem',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          position: 'sticky',
          top: '1rem',
          height: 'calc(100vh - 2rem)'
        }}
      >
        <div style={{ paddingBottom: '2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChefHat size={28} color="var(--accent-primary)" />
            NutriAI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Smart Inventory & Health</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 500,
                  border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
          <div className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem' }}>
            Upgrade to Pro
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '1rem 2rem 1rem 1rem', width: '100%', overflowY: 'auto' }}>
        <div className="animate-fade-in" style={{ height: '100%' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pantry" element={<PantryPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/chat" element={<ChatAgentPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
