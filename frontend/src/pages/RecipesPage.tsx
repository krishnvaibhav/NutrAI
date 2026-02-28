import React, { useState } from 'react';
import axios from 'axios';
import { ChefHat, Sparkles, Flame, Activity } from 'lucide-react';
import AILoader from '../components/AILoader';

interface Recipe {
    name: string;
    reasoning: string;
    missing_ingredients: string[];
    instructions: string[];
    estimated_calories: number;
    estimated_protein: number;
}

const RecipesPage: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState('');
    const [timeOfDay, setTimeOfDay] = useState('Dinner');

    const handleSuggest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/agents/recipe/suggest', {
                preferences,
                time_of_day: timeOfDay
            });
            setRecipes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ChefHat size={36} color="var(--accent-secondary)" />
                    AI Recipe Agent
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Get personalized meal suggestions based on your current pantry inventory.</p>
            </header>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                <form onSubmit={handleSuggest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.5rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Dietary Preferences / Cravings</label>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="e.g. High protein, vegetarian, spicy..."
                            value={preferences}
                            onChange={e => setPreferences(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Meal Type</label>
                        <select
                            className="input-glass"
                            value={timeOfDay}
                            onChange={e => setTimeOfDay(e.target.value)}
                        >
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

                {recipes.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                        <ChefHat size={64} opacity={0.1} style={{ margin: '0 auto 1.5rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>Ready to cook? Ask the AI for suggestions.</p>
                    </div>
                )}

                {recipes.map((recipe, idx) => (
                    <div key={idx} className="glass-panel animate-slide-up" style={{ padding: '2rem', animationDelay: `${idx * 0.15}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>{recipe.name}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '700px' }}>"{recipe.reasoning}"</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>
                                    <Flame size={16} color="var(--accent-warning)" />
                                    {recipe.estimated_calories} kcal
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>
                                    <Activity size={16} color="var(--accent-primary)" />
                                    {recipe.estimated_protein}g protein
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Missing Ingredients</h3>
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
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Instructions</h3>
                                <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                                    {recipe.instructions.map((step, i) => (
                                        <li key={i} style={{ marginBottom: '0.75rem' }}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecipesPage;
