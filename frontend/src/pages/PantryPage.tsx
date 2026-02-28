import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, AlertCircle, Pencil, Check, X } from 'lucide-react';

interface PantryItem {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    expiry_date: string | null;
    date_added: string;
}

const PantryPage: React.FC = () => {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemParams, setNewItemParams] = useState({ name: '', quantity: '', unit: 'count', expiry_date: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editParams, setEditParams] = useState({ name: '', quantity: '', unit: 'count', expiry_date: '' });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:8000/pantry');
            setItems(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            name: newItemParams.name,
            quantity: parseFloat(newItemParams.quantity) || 1,
            unit: newItemParams.unit,
        };
        if (newItemParams.expiry_date) {
            payload.expiry_date = newItemParams.expiry_date;
        }
        try {
            await axios.post('http://localhost:8000/pantry', payload);
            setNewItemParams({ name: '', quantity: '', unit: 'count', expiry_date: '' });
            fetchItems();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8000/pantry/${id}`);
            fetchItems();
        } catch (e) {
            console.error(e);
        }
    };

    const startEdit = (item: PantryItem) => {
        setEditingId(item.id);
        setEditParams({
            name: item.name,
            quantity: String(item.quantity),
            unit: item.unit,
            expiry_date: item.expiry_date || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (id: number) => {
        const payload: any = {
            name: editParams.name,
            quantity: parseFloat(editParams.quantity) || 1,
            unit: editParams.unit,
        };
        if (editParams.expiry_date) {
            payload.expiry_date = editParams.expiry_date;
        } else {
            payload.expiry_date = null;
        }
        try {
            await axios.put(`http://localhost:8000/pantry/${id}`, payload);
            setEditingId(null);
            fetchItems();
        } catch (e) {
            console.error(e);
        }
    };

    const unitOptions = ['count', 'kg', 'grams', 'liters', 'ml'];

    return (
        <div className="animate-fade-in" style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Package size={36} color="var(--accent-primary)" />
                        My Pantry
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your ingredients and track expirations.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

                {/* Inventory List */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                        Current Inventory ({items.length})
                    </h2>

                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Loading items...</p>
                    ) : items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                            <Package size={48} opacity={0.2} style={{ margin: '0 auto 1rem' }} />
                            <p>Your pantry is empty.</p>
                            <p style={{ fontSize: '0.85rem' }}>Add some items to get started, or use the Chat Agent to scan a photo.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {items.map(item => (
                                <div key={item.id} className="animate-slide-up" style={{
                                    padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)',
                                    transition: 'background var(--transition-fast)',
                                    border: editingId === item.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                }}>
                                    {editingId === item.id ? (
                                        /* Edit Mode */
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    className="input-glass"
                                                    value={editParams.name}
                                                    onChange={e => setEditParams({ ...editParams, name: e.target.value })}
                                                    style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                                                    placeholder="Name"
                                                />
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="input-glass"
                                                    value={editParams.quantity}
                                                    onChange={e => setEditParams({ ...editParams, quantity: e.target.value })}
                                                    style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                                                    placeholder="Qty"
                                                />
                                                <select
                                                    className="input-glass"
                                                    value={editParams.unit}
                                                    onChange={e => setEditParams({ ...editParams, unit: e.target.value })}
                                                    style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem', appearance: 'none' }}
                                                >
                                                    {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <input
                                                    type="date"
                                                    className="input-glass"
                                                    value={editParams.expiry_date}
                                                    onChange={e => setEditParams({ ...editParams, expiry_date: e.target.value })}
                                                    style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                                                    placeholder="Expiry Date"
                                                />
                                                <button
                                                    onClick={() => handleSaveEdit(item.id)}
                                                    style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                                                    title="Save changes"
                                                >
                                                    <Check size={16} /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                                                    title="Cancel edit"
                                                >
                                                    <X size={16} /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View Mode */
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontWeight: 600 }}>
                                                    {item.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 500, margin: 0 }}>{item.name}</h3>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                        {item.quantity} {item.unit} {item.expiry_date && <span style={{ color: 'var(--accent-warning)', marginLeft: '1rem' }}><AlertCircle size={12} style={{ display: 'inline', marginBottom: '-2px' }} /> Expires: {item.expiry_date}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '0.5rem' }}
                                                    title="Edit item"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                                                    title="Delete item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Item Form */}
                <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                    <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Quick Add Item</h2>
                    <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Item Name</label>
                            <input
                                type="text"
                                className="input-glass"
                                placeholder="e.g. Almond Milk"
                                required
                                value={newItemParams.name}
                                onChange={e => setNewItemParams({ ...newItemParams, name: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Quantity</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input-glass"
                                    required
                                    placeholder="e.g. 12"
                                    value={newItemParams.quantity}
                                    onChange={e => setNewItemParams({ ...newItemParams, quantity: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Unit</label>
                                <select
                                    className="input-glass"
                                    value={newItemParams.unit}
                                    onChange={e => setNewItemParams({ ...newItemParams, unit: e.target.value })}
                                    style={{ appearance: 'none' }}
                                >
                                    {unitOptions.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Expiry Date <span style={{ opacity: 0.5 }}>(optional)</span></label>
                            <input
                                type="date"
                                className="input-glass"
                                value={newItemParams.expiry_date}
                                onChange={e => setNewItemParams({ ...newItemParams, expiry_date: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                            <Plus size={18} /> Add to Pantry
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default PantryPage;
