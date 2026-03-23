import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Trash2, AlertCircle, Pencil, Check, X, Search, ChefHat } from 'lucide-react';
import { apiCall } from '../api';

interface PantryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiry_date: string | null;
    date_added: string;
}

type Category = 'All Items' | 'Produce' | 'Dairy' | 'Grains' | 'Protein' | 'Other';

const CATEGORIES: Category[] = ['All Items', 'Produce', 'Dairy', 'Grains', 'Protein', 'Other'];

function getCategory(name: string): Category {
    const n = name.toLowerCase();
    if (/milk|cheese|yogurt|butter|cream|egg/.test(n)) return 'Dairy';
    if (/rice|pasta|bread|flour|oat|grain|cereal|wheat/.test(n)) return 'Grains';
    if (/chicken|beef|pork|fish|tuna|salmon|meat|tofu|lentil/.test(n)) return 'Protein';
    if (/apple|banana|tomato|carrot|onion|potato|broccoli|spinach|lettuce|avocado|fruit|veggie|vegetable|pepper|cucumber/.test(n)) return 'Produce';
    return 'Other';
}

function getStatus(expiry: string | null): { label: string; cls: string; color: string } {
    if (!expiry) return { label: 'OPTIMAL', cls: 'status-optimal', color: 'var(--accent-primary)' };
    const diff = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: 'CRITICAL', cls: 'status-critical', color: 'var(--accent-danger)' };
    if (diff <= 2) return { label: 'CRITICAL', cls: 'status-critical', color: 'var(--accent-danger)' };
    if (diff <= 7) return { label: 'LOW STOCK', cls: 'status-low', color: 'var(--accent-warning)' };
    return { label: 'OPTIMAL', cls: 'status-optimal', color: 'var(--accent-primary)' };
}

function getFreshness(expiry: string | null): number {
    if (!expiry) return 100;
    const diff = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 0;
    return Math.min(100, Math.round((diff / 14) * 100));
}

function getFreshnessColor(pct: number): string {
    if (pct > 60) return 'var(--accent-primary)';
    if (pct > 25) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
}

const AVATAR_COLORS = ['#2D4A3E', '#4A7C6B', '#D97706', '#DC2626', '#6366F1', '#0891B2'];

const PantryPage: React.FC = () => {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<Category>('All Items');
    const [newItemParams, setNewItemParams] = useState({ name: '', quantity: '', unit: 'count', expiry_date: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editParams, setEditParams] = useState({ name: '', quantity: '', unit: 'count', expiry_date: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [upgradeMsg, setUpgradeMsg] = useState('');

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            const data = await apiCall('GET', '/pantry');
            setItems(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Record<string, unknown> = {
            name: newItemParams.name,
            quantity: parseFloat(newItemParams.quantity) || 1,
            unit: newItemParams.unit,
        };
        if (newItemParams.expiry_date) payload.expiry_date = newItemParams.expiry_date;
        try {
            await apiCall('POST', '/pantry', payload);
            setNewItemParams({ name: '', quantity: '', unit: 'count', expiry_date: '' });
            setShowAddForm(false);
            fetchItems();
        } catch (err: unknown) {
            const e = err as Error & { status?: number };
            if (e.status === 403) setUpgradeMsg(e.message);
            else console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiCall('DELETE', `/pantry/${id}`);
            fetchItems();
        } catch (e) { console.error(e); }
    };

    const startEdit = (item: PantryItem) => {
        setEditingId(item.id);
        setEditParams({ name: item.name, quantity: String(item.quantity), unit: item.unit, expiry_date: item.expiry_date || '' });
    };

    const handleSaveEdit = async (id: string) => {
        const payload: Record<string, unknown> = {
            name: editParams.name,
            quantity: parseFloat(editParams.quantity) || 1,
            unit: editParams.unit,
            expiry_date: editParams.expiry_date || null,
        };
        try {
            await apiCall('PUT', `/pantry/${id}`, payload);
            setEditingId(null);
            fetchItems();
        } catch (e) { console.error(e); }
    };

    const unitOptions = ['count', 'kg', 'grams', 'liters', 'ml'];

    const filtered = items.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = activeCategory === 'All Items' || getCategory(item.name) === activeCategory;
        return matchSearch && matchCat;
    });

    const optimalCount = items.filter(i => getStatus(i.expiry_date).label === 'OPTIMAL').length;
    const criticalCount = items.filter(i => getStatus(i.expiry_date).label === 'CRITICAL').length;

    return (
        <div className="animate-fade-in page-content">
            {/* Header */}
            <header style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.3rem' }}>Pantry Manager</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track freshness, monitor shelf-life, and reduce food waste.</p>
            </header>

            {upgradeMsg && (
                <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--accent-danger)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--accent-danger)' }}>{upgradeMsg}</p>
                    <Link to="/account"><button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Upgrade</button></Link>
                </div>
            )}

            {/* Search + Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        className="input-glass"
                        placeholder="Search ingredients..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.5rem', background: '#FFFFFF', border: '1px solid var(--border)' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowAddForm(v => !v)}
                    style={{ flexShrink: 0 }}
                >
                    <Plus size={16} /> Add Item
                </button>
            </div>

            {/* Add Item Form (collapsible) */}
            {showAddForm && (
                <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderTop: '3px solid var(--accent-primary)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Add New Item</h3>
                    <form onSubmit={handleAddItem}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Name</label>
                                <input type="text" className="input-glass" placeholder="e.g. Almond Milk" required value={newItemParams.name} onChange={e => setNewItemParams({ ...newItemParams, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Quantity</label>
                                <input type="number" step="0.1" className="input-glass" required placeholder="1" value={newItemParams.quantity} onChange={e => setNewItemParams({ ...newItemParams, quantity: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Unit</label>
                                <select className="input-glass" value={newItemParams.unit} onChange={e => setNewItemParams({ ...newItemParams, unit: e.target.value })}>
                                    {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Expiry (opt.)</label>
                                <input type="date" className="input-glass" value={newItemParams.expiry_date} onChange={e => setNewItemParams({ ...newItemParams, expiry_date: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 1.25rem' }}>Add</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Main layout: cards + right panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

                {/* Item Cards Grid */}
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                            <Package size={40} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                            Loading pantry...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Package size={40} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                            <p>{items.length === 0 ? 'Your pantry is empty. Click "Add Item" to get started.' : 'No items match your search.'}</p>
                        </div>
                    ) : (
                        <div className="pantry-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {filtered.map(item => {
                                const status = getStatus(item.expiry_date);
                                const freshPct = getFreshness(item.expiry_date);
                                const avatarColor = AVATAR_COLORS[item.name.charCodeAt(0) % AVATAR_COLORS.length];
                                const isEditing = editingId === item.id;
                                return (
                                    <div key={item.id} className="glass-panel animate-slide-up" style={{ padding: '1.25rem', position: 'relative' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                <input type="text" className="input-glass" value={editParams.name} onChange={e => setEditParams({ ...editParams, name: e.target.value })} style={{ fontSize: '0.85rem', padding: '0.5rem' }} />
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                                    <input type="number" step="0.1" className="input-glass" value={editParams.quantity} onChange={e => setEditParams({ ...editParams, quantity: e.target.value })} style={{ fontSize: '0.85rem', padding: '0.5rem' }} />
                                                    <select className="input-glass" value={editParams.unit} onChange={e => setEditParams({ ...editParams, unit: e.target.value })} style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                                                        {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                                                    </select>
                                                </div>
                                                <input type="date" className="input-glass" value={editParams.expiry_date} onChange={e => setEditParams({ ...editParams, expiry_date: e.target.value })} style={{ fontSize: '0.85rem', padding: '0.5rem' }} />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleSaveEdit(item.id)} style={{ flex: 1, background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.8rem' }}><Check size={14} /> Save</button>
                                                    <button onClick={() => setEditingId(null)} style={{ flex: 1, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.8rem' }}><X size={14} /> Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Status badge top right */}
                                                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                                    <span className={`status-badge ${status.cls}`}>
                                                        {status.label === 'CRITICAL' && <AlertCircle size={9} />}
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {/* Avatar */}
                                                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.85rem' }}>
                                                    {item.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Name + Category */}
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.15rem' }}>{item.name}</h3>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {getCategory(item.name)} · {item.quantity} {item.unit}
                                                    </div>
                                                </div>

                                                {/* Freshness bar */}
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        <span>Freshness</span>
                                                        <span>{freshPct}%</span>
                                                    </div>
                                                    <div className="progress-bar-track">
                                                        <div className="progress-bar-fill" style={{ width: `${freshPct}%`, background: getFreshnessColor(freshPct) }} />
                                                    </div>
                                                </div>

                                                {/* Expiry note */}
                                                {item.expiry_date && (
                                                    <div style={{ fontSize: '0.75rem', color: status.color, marginBottom: '0.75rem' }}>
                                                        {status.label === 'CRITICAL' ? 'Consume or use immediately' :
                                                         status.label === 'LOW STOCK' ? `Expiring ${item.expiry_date}` :
                                                         `Estimated expiry ${item.expiry_date}`}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                                                    <button onClick={() => startEdit(item)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title="Edit">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px', display: 'flex', alignItems: 'center', marginLeft: 'auto' }} title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Harvest Intelligence Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'var(--accent-primary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', color: 'white' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>✦ Harvest Intelligence</div>
                        <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '1rem' }}>
                            {criticalCount > 0
                                ? `${criticalCount} item${criticalCount > 1 ? 's' : ''} need immediate attention.`
                                : `Your pantry is ${optimalCount} items strong.`}
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                            {criticalCount > 0
                                ? 'Use expiring items in a recipe to reduce waste and save money.'
                                : `${items.length > 0 ? 'Great stock management! ' : ''}Generate a recipe based on what you have.`}
                        </p>
                        <Link to="/recipes" style={{ textDecoration: 'none' }}>
                            <button style={{ background: 'white', color: 'var(--accent-primary)', border: 'none', padding: '0.6rem 1.1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', justifyContent: 'center' }}>
                                <ChefHat size={15} /> Generate Recipe
                            </button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Pantry Stats</h4>
                        {[
                            { label: 'Total Items', value: items.length },
                            { label: 'Optimal', value: optimalCount, color: 'var(--accent-primary)' },
                            { label: 'Expiring Soon', value: items.filter(i => getStatus(i.expiry_date).label === 'LOW STOCK').length, color: 'var(--accent-warning)' },
                            { label: 'Critical', value: criticalCount, color: 'var(--accent-danger)' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: s.color || 'var(--text-primary)' }}>{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PantryPage;
