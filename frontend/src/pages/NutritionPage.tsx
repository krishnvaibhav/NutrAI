import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Target } from 'lucide-react';
import AILoader from '../components/AILoader';

interface NutritionLog {
    id: number;
    date: string;
    meal_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

import { useGlobalContext } from '../GlobalContext';

const NutritionPage: React.FC = () => {
    const { healthSummary, setHealthSummary, lastLogCount, setLastLogCount } = useGlobalContext();
    const [logs, setLogs] = useState<NutritionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const logsRes = await axios.get('http://localhost:8000/nutrition');
            const fetchedLogs = logsRes.data;
            setLogs(fetchedLogs);

            // Only fetch summary if log count changed OR never fetched
            if (fetchedLogs.length !== lastLogCount) {
                const summaryRes = await axios.get('http://localhost:8000/agents/nutrition/summary');
                setHealthSummary(summaryRes.data.summary);
                setLastLogCount(fetchedLogs.length);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const todayLogs = logs.filter(log => log.date === new Date().toISOString().split('T')[0]);
    const totalCalories = todayLogs.reduce((acc, log) => acc + log.calories, 0);
    const totalProtein = todayLogs.reduce((acc, log) => acc + log.protein, 0);
    const totalCarbs = todayLogs.reduce((acc, log) => acc + log.carbs, 0);
    const totalFat = todayLogs.reduce((acc, log) => acc + log.fat, 0);

    return (
        <div className="animate-fade-in" style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={36} color="var(--accent-warning)" />
                    Health & Macros
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track your daily intake and receive personalized health insights.</p>
            </header>

            {/* AI Summary Banner */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--accent-warning)', background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-warning)' }}>
                    <Target size={18} /> AI Health Insight
                </h2>
                {(!healthSummary && loading) ? (
                    <AILoader message="Analyzing your nutrition" variant="nutrition" />
                ) : (
                    <>
                        <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                            {healthSummary || "No health summary yet. Start logging your meals to get AI insights!"}
                        </p>
                        {(loading && healthSummary) && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.7 }}>
                                <span className="ai-dot" style={{ animationDelay: '0s' }}>.</span>
                                <span className="ai-dot" style={{ animationDelay: '0.2s' }}>.</span>
                                <span className="ai-dot" style={{ animationDelay: '0.4s' }}>.</span>
                                <span style={{ marginLeft: '0.25rem' }}>Syncing logs</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Today's Progress</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>

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
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Meal</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Calories</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Macros (P/C/F)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No meals logged yet. Use the Chat Agent to log your meals!</td>
                            </tr>
                        ) : (
                            logs.slice().reverse().map((log, idx) => (
                                <tr key={log.id} style={{ borderBottom: idx !== logs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>{log.date}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{log.meal_name}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--accent-primary)' }}>{Math.round(log.calories)} kcal</td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {Math.round(log.protein)}g / {Math.round(log.carbs)}g / {Math.round(log.fat)}g
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NutritionPage;
