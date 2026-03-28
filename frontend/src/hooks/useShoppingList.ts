import { useState, useEffect } from 'react';

export interface ShoppingItem {
    id: string;
    name: string;
    recipe: string;
    checked: boolean;
}

const STORAGE_KEY = 'pantryai-shopping-list';

function load(): ShoppingItem[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function useShoppingList() {
    const [items, setItems] = useState<ShoppingItem[]>(load);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItems = (recipeName: string, ingredients: string[]) => {
        setItems(prev => {
            const existing = new Set(prev.map(i => i.name.toLowerCase()));
            const newItems = ingredients
                .filter(ing => !existing.has(ing.toLowerCase()))
                .map(ing => ({ id: `${Date.now()}-${Math.random()}`, name: ing, recipe: recipeName, checked: false }));
            return newItems.length > 0 ? [...prev, ...newItems] : prev;
        });
    };

    const addManual = (name: string) => {
        if (!name.trim()) return;
        setItems(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, name: name.trim(), recipe: 'Manual', checked: false }]);
    };

    const toggle = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
    const clearChecked = () => setItems(prev => prev.filter(i => !i.checked));
    const clearAll = () => setItems([]);

    const uncheckedCount = items.filter(i => !i.checked).length;

    return { items, addItems, addManual, toggle, remove, clearChecked, clearAll, uncheckedCount };
}
