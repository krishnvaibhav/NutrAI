import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Sparkles, Flame, Activity, ChevronDown, ChevronUp, Users, DollarSign } from 'lucide-react';
import AILoader from '../components/AILoader';
import { useGlobalContext } from '../GlobalContext';
import { apiCall } from '../api';

const RecipesPage: React.FC = () => {
    const { recipes, setRecipes, recipePreferences, setRecipePreferences, recipeTimeOfDay, setRecipeTimeOfDay, expandedRecipeIdx, setExpandedRecipeIdx } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [upgradeMsg, setUpgradeMsg] = useState('');

    const handleSuggest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setExpandedRecipeIdx(null);
        setError('');
        setUpgradeMsg('');
        try {
            const data = await apiCall('POST', '/agents/recipe/suggest', {
                preferences: recipePreferences,
                time_of_day: recipeTimeOfDay,
            });
            setRecipes(data);
        } catch (err: unknown) {
            const e = err as Error & { status?: number };
            if (e.status === 403) setUpgradeMsg(e.message);
            else setError(e.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (idx: number) => {
        setExpandedRecipeIdx(prev => (prev === idx ? null : idx));
    };

    return (
        <div className="animate-fade-in page-content">
            <header style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ChefHat size={36} color="var(--accent-secondary)" />
                    AI Recipe Agent
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Get personalized meal suggestions based on your current pantry inventory.</p>
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

            {error && (
                <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ color: '#f87171', margin: 0 }}>{error}</p>
                </div>
            )}

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                <form onSubmit={handleSuggest} className="recipe-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.5rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Dietary Preferences / Cravings</label>
                        <input type="text" className="input-glass" placeholder="e.g. High protein, vegetarian, spicy..." value={recipePreferences} onChange={e => setRecipePreferences(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Meal Type</label>
                        <select className="input-glass" value={recipeTimeOfDay} onChange={e => setRecipeTimeOfDay(e.target.value)}>
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ background: 'var(--accent-secondary)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>
                        <Sparkles size={18} />
                        Suggest Meals
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {loading && (
                    <div className="glass-panel">
                        <AILoader message="Crafting recipes from your pantry" variant="recipe" />
                    </div>
                )}

                {recipes.length === 0 && !loading && !error && !upgradeMsg && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                        <ChefHat size={64} opacity={0.1} style={{ margin: '0 auto 1.5rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>Ready to cook? Ask the AI for suggestions.</p>
                    </div>
                )}

                {recipes.map((recipe, idx) => {
                    const isExpanded = expandedRecipeIdx === idx;
                    return (
                        <div key={idx} className="glass-panel animate-slide-up" style={{ padding: '2rem', animationDelay: `${idx * 0.15}s`, cursor: 'pointer' }}
                            onClick={() => toggleExpand(idx)}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>{recipe.name}</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '700px' }}>"{recipe.reasoning}"</p>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', marginLeft: '1rem', marginTop: '0.25rem' }}>
                                    {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: isExpanded ? '1.5rem' : 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                    <Flame size={15} color="var(--accent-warning)" />
                                    {recipe.estimated_calories} kcal
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                    <Activity size={15} color="var(--accent-primary)" />
                                    {recipe.estimated_protein}g protein
                                </div>
                                {recipe.servings && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                        <Users size={15} color="var(--accent-secondary)" />
                                        Serves {recipe.servings}
                                    </div>
                                )}
                                {recipe.cost_per_dish != null && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                        <DollarSign size={15} color="#a3e635" />
                                        ~${recipe.cost_per_dish.toFixed(2)} AUD
                                    </div>
                                )}
                            </div>

                            {isExpanded && (
                                <div className="recipe-detail-grid"
                                    onClick={e => e.stopPropagation()}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Missing Ingredients</h3>
                                        {recipe.missing_ingredients.length === 0 ? (
                                            <p style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Sparkles size={14} /> You have everything!
                                            </p>
                                        ) : (
                                            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                                {recipe.missing_ingredients.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Step-by-Step Instructions</h3>
                                        <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                                            {recipe.instructions.map((step, i) => (
                                                <li key={i} style={{ marginBottom: '0.75rem' }}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            )}

                            {!isExpanded && (
                                <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                                    Click to see full cooking steps →
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecipesPage;
