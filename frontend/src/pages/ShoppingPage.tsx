import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Copy, Check, X, PackageOpen } from 'lucide-react';
import { useShoppingList } from '../hooks/useShoppingList';

export default function ShoppingPage() {
    const { items, addManual, toggle, remove, clearChecked, clearAll, uncheckedCount } = useShoppingList();
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        addManual(input.trim());
        setInput('');
    };

    const copyToClipboard = () => {
        const text = items.filter(i => !i.checked).map(i => `• ${i.name}`).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Group items by recipe
    const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
        (acc[item.recipe] = acc[item.recipe] || []).push(item);
        return acc;
    }, {});
    const checkedItems = items.filter(i => i.checked);

    return (
        <div className="animate-fade-in page-content" style={{ maxWidth: '680px' }}>
            {/* Header */}
            <header style={{ marginBottom: '2rem', marginTop: '1rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShoppingCart size={32} color="var(--accent-primary)" />
                    Shopping List
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {uncheckedCount > 0 ? `${uncheckedCount} item${uncheckedCount !== 1 ? 's' : ''} left to buy` : items.length > 0 ? 'All done! 🎉' : 'Add items from Recipes or manually below.'}
                </p>
            </header>

            {/* Add manual item */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Add an item manually..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem' }}>
                        <Plus size={16} /> Add
                    </button>
                </form>
            </div>

            {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                    <PackageOpen size={56} style={{ margin: '0 auto 1.25rem', opacity: 0.15 }} />
                    <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Your shopping list is empty</p>
                    <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Go to Recipes, expand a recipe, and click "Add to Shopping List"</p>
                </div>
            ) : (
                <>
                    {/* Action bar */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={copyToClipboard}
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                        >
                            {copied ? <Check size={14} color="var(--accent-secondary)" /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy list'}
                        </button>
                        {checkedItems.length > 0 && (
                            <button
                                onClick={clearChecked}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                            >
                                <Trash2 size={14} /> Clear checked ({checkedItems.length})
                            </button>
                        )}
                        <button
                            onClick={clearAll}
                            className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)', marginLeft: 'auto' }}
                        >
                            <X size={14} /> Clear all
                        </button>
                    </div>

                    {/* Grouped items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {Object.entries(groups).map(([recipe, groupItems]) => {
                            const unchecked = groupItems.filter(i => !i.checked);
                            const checked = groupItems.filter(i => i.checked);
                            return (
                                <div key={recipe} className="glass-panel" style={{ padding: '1.25rem 1.5rem', overflow: 'hidden' }}>
                                    {/* Recipe label */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', opacity: 0.8 }}>
                                            {recipe}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {unchecked.length}/{groupItems.length}
                                        </span>
                                    </div>

                                    {/* Unchecked */}
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                        {unchecked.map(item => (
                                            <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={false}
                                                    onChange={() => toggle(item.id)}
                                                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                                                />
                                                <span style={{ flex: 1, fontSize: '0.925rem' }}>{item.name}</span>
                                                <button onClick={() => remove(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.2rem', display: 'flex', opacity: 0.5 }}>
                                                    <X size={13} />
                                                </button>
                                            </li>
                                        ))}
                                        {checked.map(item => (
                                            <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', opacity: 0.35 }}>
                                                <input
                                                    type="checkbox"
                                                    checked
                                                    onChange={() => toggle(item.id)}
                                                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                                                />
                                                <span style={{ flex: 1, fontSize: '0.925rem', textDecoration: 'line-through' }}>{item.name}</span>
                                                <button onClick={() => remove(item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.2rem', display: 'flex' }}>
                                                    <X size={13} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
