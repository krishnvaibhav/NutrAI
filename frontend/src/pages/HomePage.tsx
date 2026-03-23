import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, ChefHat, Activity, ScanLine, ArrowRight, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiCall } from '../api';

interface PantryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiry_date: string | null;
    date_added: string;
}

interface NutritionLog {
    id: string;
    date: string;
    meal_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

const CALORIE_GOAL = 2400;

const HomePage: React.FC = () => {
    const [pantry, setPantry] = useState<PantryItem[]>([]);
    const [logs, setLogs] = useState<NutritionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissedInsight, setDismissedInsight] = useState(false);

    useEffect(() => {
        Promise.all([
            apiCall('GET', '/pantry').catch(() => []),
            apiCall('GET', '/nutrition').catch(() => []),
        ]).then(([p, l]) => {
            setPantry(p);
            setLogs(l);
            setLoading(false);
        });
    }, []);

    const today = new Date().toLocaleDateString('en-CA');
    const expiringItems = pantry.filter(item => {
        if (!item.expiry_date) return false;
        const diff = (new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diff <= 7 && diff >= 0;
    });
    const todayLogs = logs.filter(l => l.date === today);
    const todayCalories = Math.round(todayLogs.reduce((s, l) => s + l.calories, 0));
    const caloriePercent = Math.min(100, Math.round((todayCalories / CALORIE_GOAL) * 100));

    // Activity feed: last 4 pantry items + nutrition logs mixed, sorted by date
    const activityItems = [
        ...pantry.slice(-3).map(p => ({ label: 'Pantry Update', detail: `Added ${p.quantity} ${p.unit} ${p.name}`, time: p.date_added, type: 'pantry' })),
        ...logs.slice(-3).map(l => ({ label: 'Meal Logged', detail: l.meal_name, time: l.date, type: 'nutrition' })),
    ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

    const expiringFirst = expiringItems[0];
    const insightText = expiringFirst
        ? `You have ${expiringFirst.name} expiring soon — try using it in a recipe today to reduce waste.`
        : pantry.length > 0
        ? `Your pantry has ${pantry.length} items. Let the Recipe AI suggest a meal based on what you have.`
        : `Add items to your pantry to get AI-powered meal suggestions and insights.`;

    return (
        <div className="animate-fade-in page-content">
            {/* Header */}
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.4rem' }}>
                    The Command Center
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    Welcome back. Your ecosystem is thriving today.
                </p>
            </header>

            {/* Stat Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {/* Total Items */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Package size={14} /> Total Items
                    </div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                        {loading ? '—' : pantry.length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                        items in pantry
                    </div>
                </div>

                {/* Expiring Soon */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: expiringItems.length > 0 ? '3px solid var(--accent-danger)' : '3px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: expiringItems.length > 0 ? 'var(--accent-danger)' : 'var(--text-secondary)' }}>
                        <AlertCircle size={14} /> Expiring Soon
                    </div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1, color: expiringItems.length > 0 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                        {loading ? '—' : expiringItems.length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                        {expiringItems.length > 0 ? 'require action this week' : 'all items fresh'}
                    </div>
                </div>

                {/* Daily Progress */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BarChart2 size={14} /> Daily Progress</span>
                        <span style={{ fontSize: '0.8rem' }}>{caloriePercent}%</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                        {loading ? '—' : `${todayCalories.toLocaleString()}`}
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}> / {CALORIE_GOAL.toLocaleString()} kcal</span>
                    </div>
                    <div className="progress-bar-track" style={{ marginTop: '1rem' }}>
                        <div className="progress-bar-fill" style={{ width: `${caloriePercent}%`, background: 'var(--accent-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                        {todayLogs.length > 0 && (
                            <>
                                <span>P: {Math.round(todayLogs.reduce((s, l) => s + l.protein, 0))}g</span>
                                <span>C: {Math.round(todayLogs.reduce((s, l) => s + l.carbs, 0))}g</span>
                                <span>F: {Math.round(todayLogs.reduce((s, l) => s + l.fat, 0))}g</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main 2-col layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

                {/* AI Insight Panel */}
                {!dismissedInsight && (
                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', background: 'var(--accent-primary)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                            {/* Food image placeholder */}
                            <div style={{ background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px' }}>
                                <ChefHat size={64} color="rgba(255,255,255,0.3)" />
                            </div>
                            {/* Insight text */}
                            <div style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    ✦ AI Insight
                                </div>
                                <p style={{ color: 'white', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500, marginBottom: '1.25rem' }}>
                                    "{insightText}"
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Link to="/recipes" style={{ textDecoration: 'none' }}>
                                        <button style={{ background: 'white', color: 'var(--accent-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                            View Recipes
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => setDismissedInsight(true)}
                                        style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Links (shown when insight dismissed) */}
                {dismissedInsight && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        {[
                            { label: 'Pantry', desc: 'Manage ingredients', path: '/pantry', icon: Package, color: 'var(--accent-primary)' },
                            { label: 'Recipes', desc: 'AI meal suggestions', path: '/recipes', icon: ChefHat, color: 'var(--accent-secondary)' },
                            { label: 'Health', desc: 'Track macros', path: '/nutrition', icon: Activity, color: 'var(--accent-warning)' },
                            { label: 'Vision Scan', desc: 'Scan food with AI', path: '/vision', icon: ScanLine, color: 'var(--accent-primary)' },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                                    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                        <Icon size={20} color={item.color} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                                        </div>
                                        <ArrowRight size={14} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Activity Feed */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Activity
                    </h3>
                    {activityItems.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No activity yet. Add some pantry items or log a meal to get started.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {activityItems.map((a, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
                                        background: a.type === 'pantry' ? 'var(--accent-primary)' : 'var(--accent-warning)'
                                    }} />
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{a.label}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '1px' }}>{a.detail}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', opacity: 0.7 }}>{a.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick nav links */}
                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        {[
                            { label: 'My Pantry', path: '/pantry' },
                            { label: 'Recipes', path: '/recipes' },
                            { label: 'Vision Scan', path: '/vision', icon: ScanLine },
                        ].map(item => (
                            <Link key={item.path} to={item.path} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', borderBottom: '1px solid var(--border)' }}>
                                <span>{item.label}</span>
                                <ArrowRight size={13} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
