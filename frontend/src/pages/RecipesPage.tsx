import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Sparkles, Flame, Activity, ChevronDown, ChevronUp, Users, DollarSign, ShoppingCart, CheckCircle, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import AILoader from '../components/AILoader';
import { useGlobalContext } from '../GlobalContext';
import { apiCall } from '../api';
import { useShoppingList } from '../hooks/useShoppingList';

interface Recipe {
    name: string;
    reasoning: string;
    missing_ingredients: string[];
    instructions: string[];
    estimated_calories: number;
    estimated_protein: number;
    servings?: number;
    cost_per_dish?: number;
}

interface SavedRecipe extends Recipe {
    id: string;
    saved_at: string;
}

const RecipesPage: React.FC = () => {
    const { recipes, setRecipes, recipePreferences, setRecipePreferences, recipeTimeOfDay, setRecipeTimeOfDay, expandedRecipeIdx, setExpandedRecipeIdx } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [upgradeMsg, setUpgradeMsg] = useState('');
    const [addedRecipe, setAddedRecipe] = useState<string | null>(null);
    const [tab, setTab] = useState<'suggest' | 'saved'>('suggest');
    const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [savingName, setSavingName] = useState<string | null>(null);
    const { addItems, uncheckedCount } = useShoppingList();

    useEffect(() => {
        apiCall('GET', '/recipes/saved').then((data: SavedRecipe[]) => {
            setSavedRecipes(data);
            setSavedIds(new Set(data.map((r: SavedRecipe) => r.name)));
        }).catch(() => {});
    }, []);

    const handleSave = async (e: React.MouseEvent, recipe: Recipe) => {
        e.stopPropagation();
        if (savedIds.has(recipe.name)) {
            const match = savedRecipes.find(r => r.name === recipe.name);
            if (!match) return;
            await apiCall('DELETE', `/recipes/saved/${match.id}`);
            setSavedRecipes(prev => prev.filter(r => r.id !== match.id));
            setSavedIds(prev => { const s = new Set(prev); s.delete(recipe.name); return s; });
        } else {
            setSavingName(recipe.name);
            try {
                const saved: SavedRecipe = await apiCall('POST', '/recipes/saved', recipe);
                setSavedRecipes(prev => [saved, ...prev]);
                setSavedIds(prev => new Set([...prev, recipe.name]));
            } finally {
                setSavingName(null);
            }
        }
    };

    const handleUnsaveFromList = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        await apiCall('DELETE', `/recipes/saved/${id}`);
        setSavedRecipes(prev => prev.filter(r => r.id !== id));
        setSavedIds(prev => { const s = new Set(prev); s.delete(name); return s; });
    };

    const handleAddToList = (recipeName: string, ingredients: string[]) => {
        addItems(recipeName, ingredients);
        setAddedRecipe(recipeName);
        setTimeout(() => setAddedRecipe(null), 2500);
    };

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
            <header style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ChefHat size={36} color="var(--accent-secondary)" />
                    AI Recipe Agent
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Get personalized meal suggestions based on your current pantry inventory.</p>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
                {(['suggest', 'saved'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.6rem 1.2rem', fontSize: '0.9rem', fontWeight: tab === t ? 600 : 400,
                        color: tab === t ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                        borderBottom: tab === t ? '2px solid var(--accent-secondary)' : '2px solid transparent',
                        marginBottom: '-1px', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                        {t === 'suggest' ? <Sparkles size={15} /> : <BookmarkCheck size={15} />}
                        {t === 'suggest' ? 'Suggest' : `Saved (${savedRecipes.length})`}
                    </button>
                ))}
            </div>

            {/* ── Suggest tab ─────────────────────────────────────────────── */}
            {tab === 'suggest' && (
                <>
                    {upgradeMsg && (
                        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontWeight: 600, margin: 0 }}>Pro Feature</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>{upgradeMsg}</p>
                            </div>
                            <Link to="/account"><button className="btn-primary">Upgrade to Pro</button></Link>
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
                        {loading && <div className="glass-panel"><AILoader message="Crafting recipes from your pantry" variant="recipe" /></div>}

                        {recipes.length === 0 && !loading && !error && !upgradeMsg && (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                                <ChefHat size={64} opacity={0.1} style={{ margin: '0 auto 1.5rem' }} />
                                <p style={{ fontSize: '1.1rem' }}>Ready to cook? Ask the AI for suggestions.</p>
                            </div>
                        )}

                        {recipes.map((recipe, idx) => {
                            const isExpanded = expandedRecipeIdx === idx;
                            const isSaved = savedIds.has(recipe.name);
                            return (
                                <div key={idx} className="glass-panel animate-slide-up" style={{ padding: '2rem', animationDelay: `${idx * 0.15}s`, cursor: 'pointer' }}
                                    onClick={() => toggleExpand(idx)}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>{recipe.name}</h2>
                                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '700px' }}>"{recipe.reasoning}"</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', marginTop: '0.25rem' }}>
                                            <button
                                                onClick={e => handleSave(e, recipe)}
                                                disabled={savingName === recipe.name}
                                                title={isSaved ? 'Remove from saved' : 'Save recipe'}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: isSaved ? 'var(--accent-secondary)' : 'var(--text-secondary)', transition: 'color 0.2s' }}
                                            >
                                                {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                                            </button>
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: isExpanded ? '1.5rem' : 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                            <Flame size={15} color="var(--accent-warning)" />{recipe.estimated_calories} kcal
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                            <Activity size={15} color="var(--accent-primary)" />{recipe.estimated_protein}g protein
                                        </div>
                                        {recipe.servings && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                                <Users size={15} color="var(--accent-secondary)" />Serves {recipe.servings}
                                            </div>
                                        )}
                                        {recipe.cost_per_dish != null && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                                <DollarSign size={15} color="#a3e635" />~${recipe.cost_per_dish.toFixed(2)} AUD
                                            </div>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className="recipe-detail-grid" onClick={e => e.stopPropagation()}>
                                            <div>
                                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Missing Ingredients</h3>
                                                {recipe.missing_ingredients.length === 0 ? (
                                                    <p style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Sparkles size={14} /> You have everything!
                                                    </p>
                                                ) : (
                                                    <>
                                                        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                                                            {recipe.missing_ingredients.map((item, i) => <li key={i}>{item}</li>)}
                                                        </ul>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-start' }}>
                                                            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem', background: addedRecipe === recipe.name ? '#166534' : undefined, transition: 'background 0.2s' }}
                                                                onClick={() => handleAddToList(recipe.name, recipe.missing_ingredients)}>
                                                                <CheckCircle size={15} />
                                                                {addedRecipe === recipe.name ? '✓ Added to list!' : 'Add to Shopping List'}
                                                            </button>
                                                            {addedRecipe === recipe.name && (
                                                                <Link to="/shopping" style={{ fontSize: '0.82rem', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'var(--accent-secondary)', padding: '0.35rem 0.8rem', borderRadius: '999px', fontWeight: 600 }}>
                                                                    <ShoppingCart size={13} /> View Shopping List
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Step-by-Step Instructions</h3>
                                                <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                                                    {recipe.instructions.map((step, i) => <li key={i} style={{ marginBottom: '0.75rem' }}>{step}</li>)}
                                                </ol>
                                            </div>
                                        </div>
                                    )}

                                    {!isExpanded && (
                                        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Click to see full cooking steps →</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── Saved tab ────────────────────────────────────────────────── */}
            {tab === 'saved' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {savedRecipes.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                            <BookmarkCheck size={64} opacity={0.1} style={{ margin: '0 auto 1.5rem' }} />
                            <p style={{ fontSize: '1.1rem' }}>No saved recipes yet. Bookmark one from the Suggest tab.</p>
                        </div>
                    )}
                    {savedRecipes.map((recipe, idx) => {
                        const isExpanded = expandedRecipeIdx === idx + 1000;
                        return (
                            <div key={recipe.id} className="glass-panel animate-slide-up" style={{ padding: '2rem', cursor: 'pointer' }}
                                onClick={() => setExpandedRecipeIdx(prev => prev === idx + 1000 ? null : idx + 1000)}>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>{recipe.name}</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '700px' }}>"{recipe.reasoning}"</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
                                        <button onClick={e => handleUnsaveFromList(e, recipe.id, recipe.name)}
                                            title="Remove from saved"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}>
                                            <Trash2 size={18} />
                                        </button>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: isExpanded ? '1.5rem' : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                        <Flame size={15} color="var(--accent-warning)" />{recipe.estimated_calories} kcal
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                        <Activity size={15} color="var(--accent-primary)" />{recipe.estimated_protein}g protein
                                    </div>
                                    {recipe.servings && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                            <Users size={15} color="var(--accent-secondary)" />Serves {recipe.servings}
                                        </div>
                                    )}
                                    {recipe.cost_per_dish != null && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}>
                                            <DollarSign size={15} color="#a3e635" />~${recipe.cost_per_dish.toFixed(2)} AUD
                                        </div>
                                    )}
                                </div>

                                {isExpanded && (
                                    <div className="recipe-detail-grid" onClick={e => e.stopPropagation()}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Missing Ingredients</h3>
                                            {recipe.missing_ingredients.length === 0 ? (
                                                <p style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Sparkles size={14} /> You have everything!
                                                </p>
                                            ) : (
                                                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                                    {recipe.missing_ingredients.map((item, i) => <li key={i}>{item}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Step-by-Step Instructions</h3>
                                            <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.75 }}>
                                                {recipe.instructions.map((step, i) => <li key={i} style={{ marginBottom: '0.75rem' }}>{step}</li>)}
                                            </ol>
                                        </div>
                                    </div>
                                )}
                                {!isExpanded && <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Click to see full cooking steps →</p>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Floating badge → Shopping page */}
            {uncheckedCount > 0 && (
                <Link to="/shopping" style={{ position: 'fixed', bottom: 'calc(60px + 1rem)', right: '1rem', zIndex: 1000, background: 'var(--accent-primary)', borderRadius: '999px', padding: '0.65rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', textDecoration: 'none' }}>
                    <ShoppingCart size={17} />
                    {uncheckedCount} item{uncheckedCount !== 1 ? 's' : ''} to buy
                </Link>
            )}
        </div>
    );
};

export default RecipesPage;
