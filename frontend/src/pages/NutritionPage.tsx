import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Sparkles, Trash2 } from 'lucide-react';
import AILoader from '../components/AILoader';
import { useGlobalContext } from '../GlobalContext';
import { apiCall } from '../api';

interface NutritionLog {
    id: string;
    date: string;
    meal_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

const NutritionPage: React.FC = () => {
    const { lastLogCount, setLastLogCount } = useGlobalContext();
    const [logs, setLogs] = useState<NutritionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [mealDescription, setMealDescription] = useState('');
    const [loggingMeal, setLoggingMeal] = useState(false);
    const [upgradeMsg, setUpgradeMsg] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const handleManualLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mealDescription.trim()) return;
        setUpgradeMsg('');
        setLoggingMeal(true);
        const desc = mealDescription;
        setMealDescription('');
        try {
            const newLog: NutritionLog = await apiCall('POST', '/agents/nutrition/analyze', { meal_description: desc });
            setLogs(prev => [...prev, newLog]);
            setLastLogCount(lastLogCount + 1);
        } catch (err: unknown) {
            setMealDescription(desc);
            const e = err as Error & { status?: number };
            if (e.status === 403) setUpgradeMsg(e.message);
            else console.error(e);
        } finally {
            setLoggingMeal(false);
        }
    };

    const handleDeleteLog = async (id: string) => {
        try {
            await apiCall('DELETE', `/nutrition/${id}`);
            setLogs(prev => prev.filter(l => l.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const fetchData = async () => {
        try {
            const fetchedLogs = await apiCall('GET', '/nutrition');
            setLogs(fetchedLogs);
            setLastLogCount(fetchedLogs.length);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayLogs = logs.filter(log => log.date === todayStr);
    const totalCalories = todayLogs.reduce((acc, log) => acc + log.calories, 0);
    const totalProtein = todayLogs.reduce((acc, log) => acc + log.protein, 0);
    const totalCarbs = todayLogs.reduce((acc, log) => acc + log.carbs, 0);
    const totalFat = todayLogs.reduce((acc, log) => acc + log.fat, 0);

    return (
        <div className="animate-fade-in page-content">
            <header style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={36} color="var(--accent-warning)" />
                    Health & Macros
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track your daily intake and get a breakdown of your macros.</p>
            </header>

            {upgradeMsg && (
                <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontWeight: 600, margin: 0 }}>Pro Feature</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>{upgradeMsg}</p>
                    </div>
                    <Link to="/account">
                        <button className="btn-primary">Upgrade to Pro</button>
                    </Link>
                </div>
            )}

            {/* Quick Add Meal Form */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="var(--accent-secondary)" /> Quick Add Meal
                </h2>
                {loggingMeal ? (
                    <AILoader message="Analyzing your meal" variant="nutrition" />
                ) : (
                    <form onSubmit={handleManualLog} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="What did you eat? (e.g. 2 boiled eggs and a coffee)"
                            value={mealDescription}
                            onChange={e => setMealDescription(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={!mealDescription.trim()}
                            style={{ minWidth: '120px' }}
                        >
                            Log Meal
                        </button>
                    </form>
                )}
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Today's Progress</h2>
            <div className="macro-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-panel text-center" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Calories</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{Math.round(totalCalories)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.5rem' }}>kcal</div>
                </div>
                <div className="glass-panel text-center" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Protein</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{Math.round(totalProtein)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', marginTop: '0.5rem' }}>grams</div>
                </div>
                <div className="glass-panel text-center" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Carbs</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{Math.round(totalCarbs)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', marginTop: '0.5rem' }}>grams</div>
                </div>
                <div className="glass-panel text-center" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Fat</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{Math.round(totalFat)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', marginTop: '0.5rem' }}>grams</div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Logs</h2>
            {loading ? (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <AILoader message="Loading your nutrition logs" variant="nutrition" />
                </div>
            ) : (
                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Date</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Meal</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Calories</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Macros (P/C/F)</th>
                                <th style={{ padding: '0.85rem 1rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No meals logged yet. Use the Quick Add form above!</td>
                                </tr>
                            ) : (
                                logs.slice().reverse().map((log, idx, arr) => (
                                    <tr key={log.id} style={{ borderBottom: idx !== arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{log.date}</td>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 500, fontSize: '0.9rem' }}>{log.meal_name}</td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>{Math.round(log.calories)} kcal</td>
                                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                            {Math.round(log.protein)}g / {Math.round(log.carbs)}g / {Math.round(log.fat)}g
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
                                                title="Delete log"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default NutritionPage;
