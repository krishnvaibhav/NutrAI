import React from 'react';
import { ChefHat, Package, Activity, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div className="animate-fade-in" style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem', marginTop: '2rem' }}>
                <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Welcome back to NutriAI
                </div>
                <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1rem' }}>
                    Smart Inventory <br />
                    <span className="text-gradient">Intelligent Health.</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6 }}>
                    Track your groceries, reduce food waste, and let AI agents suggest personalized meals based on what you already have.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>

                {/* Quick Scan Card */}
                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--accent-primary)', filter: 'blur(50px)', opacity: 0.2, borderRadius: '50%' }}></div>
                    <Package size={32} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Scan Receipt / Fridge</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Use the Vision Agent to auto-populate your pantry instantly.</p>
                    <Link to="/chat" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ width: '100%' }}>
                            <Zap size={18} /> Try Vision Agent
                        </button>
                    </Link>
                </div>

                {/* Recipe Suggestion Card */}
                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--accent-secondary)', filter: 'blur(50px)', opacity: 0.2, borderRadius: '50%' }}></div>
                    <ChefHat size={32} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>What's for Dinner?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Ask the Recipe Agent to suggest a meal using your expiring items.</p>
                    <Link to="/recipes" style={{ textDecoration: 'none' }}>
                        <button className="btn-secondary" style={{ width: '100%', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--accent-secondary)' }}>
                            Suggest Meals <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>

                {/* Nutrition Dashboard Card */}
                <div className="glass-panel" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--accent-warning)', filter: 'blur(50px)', opacity: 0.2, borderRadius: '50%' }}></div>
                    <Activity size={32} color="var(--accent-warning)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Macro Tracking</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Review your weekly health summary and track daily calories.</p>
                    <Link to="/nutrition" style={{ textDecoration: 'none' }}>
                        <button className="btn-secondary" style={{ width: '100%', borderColor: 'rgba(245, 158, 11, 0.3)', color: 'var(--accent-warning)' }}>
                            View Dashboard <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>

            </div>

            {/* Recent Activity Mock */}
            <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Recent Activity
                </h3>
                <div className="glass-panel" style={{ padding: '1rem' }}>
                    {[
                        { action: "Logged Meal", detail: "Avocado Toast with Eggs", time: "2 hours ago", color: "var(--accent-warning)" },
                        { action: "Pantry Updated", detail: "Added 12x Eggs via Receipt Scan", time: "Yesterday", color: "var(--accent-primary)" },
                        { action: "Recipe Cooked", detail: "Spicy Garlic Pasta", time: "2 days ago", color: "var(--accent-secondary)" }
                    ].map((log, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: i !== 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.color, boxShadow: `0 0 10px ${log.color}` }}></div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{log.action}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.detail}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.time}</div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default HomePage;
