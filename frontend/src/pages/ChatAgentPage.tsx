import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Image as ImageIcon, Loader2, Bot, User, CheckCircle } from 'lucide-react';

import { useGlobalContext } from '../GlobalContext';

const ChatAgentPage: React.FC = () => {
    const { chatMessages, setChatMessages } = useGlobalContext();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [visionItems, setVisionItems] = useState<any[]>([]);
    const [recipeSuggestions, setRecipeSuggestions] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, visionItems, recipeSuggestions]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setRecipeSuggestions([]);
        setVisionItems([]);
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:8000/agents/chat', { message: userMsg });
            const { intent, response, extracted_data } = res.data;

            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);

            // Auto-handle actions based on orchestrator intent
            if (intent === 'log_nutrition' && extracted_data) {
                await axios.post('http://localhost:8000/agents/nutrition/analyze', { meal_description: extracted_data });
                setChatMessages(prev => [...prev, { role: 'assistant', content: "✅ I've successfully logged that meal to your nutrition dashboard." }]);
            } else if (intent === 'suggest_recipe') {
                const recipeRes = await axios.post('http://localhost:8000/agents/recipe/suggest', { preferences: '', time_of_day: '' });
                setRecipeSuggestions(recipeRes.data);
                // The assistant response already acknowledged pulling up recipes, so we just set the data.
            }

        } catch (e) {
            console.error(e);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Sorry, I encountered an error communicating with the server." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setChatMessages(prev => [...prev, { role: 'user', content: `[Uploaded Image: ${file.name}]`, isImage: true }]);
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('http://localhost:8000/agents/vision/scan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setVisionItems(res.data);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "I've scanned the image. Here is what I found. Do you want to add these to your pantry?" }]);
        } catch (err) {
            console.error(err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Sorry, I couldn't process that image." }]);
        } finally {
            setLoading(false);
        }
    };

    const addVisionItemsToPantry = async () => {
        setLoading(true);
        let successCount = 0;
        try {
            for (const item of visionItems) {
                await axios.post('http://localhost:8000/pantry', item);
                successCount++;
            }
            setVisionItems([]);
            setChatMessages(prev => [...prev, { role: 'assistant', content: `✅ Added ${successCount} items to your pantry.` }]);
        } catch (e) {
            console.error(e);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error adding some items to the pantry." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', padding: '1rem', paddingBottom: 0 }}>
            <header style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Bot size={32} color="var(--accent-primary)" />
                    Orchestrator Agent
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>I can route your requests to the right AI agent. Ask me anything!</p>
            </header>

            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '1rem' }}>

                {/* Messages Layout */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className="animate-slide-up" style={{
                            display: 'flex', gap: '1rem',
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            maxWidth: '85%'
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: msg.role === 'user' ? 'var(--gradient-main)' : 'rgba(139, 92, 246, 0.15)',
                                color: msg.role === 'user' ? '#fff' : 'var(--accent-primary)'
                            }}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderRadius: 'var(--radius-lg)',
                                background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                                borderBottomRightRadius: msg.role === 'user' ? '4px' : 'var(--radius-lg)',
                                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : 'var(--radius-lg)',
                                boxShadow: msg.role === 'user' ? '0 4px 14px 0 rgba(139, 92, 246, 0.39)' : 'none',
                            }}>
                                <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>{msg.content}</p>

                                {/* Embedded Vision Results */}
                                {msg.role === 'assistant' && visionItems.length > 0 && idx === chatMessages.length - 1 && (
                                    <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--accent-secondary)' }}>Detected Items:</h4>
                                        <ul style={{ paddingLeft: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {visionItems.map((item, i) => (
                                                <li key={i}>{item.quantity} {item.unit} of {item.name}</li>
                                            ))}
                                        </ul>
                                        <button onClick={addVisionItemsToPantry} className="btn-secondary" style={{ width: '100%', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--accent-secondary)', fontSize: '0.85rem', padding: '0.5rem' }}>
                                            <CheckCircle size={16} /> Confirm & Add to Pantry
                                        </button>
                                    </div>
                                )}

                                {/* Embedded Recipe Suggestions */}
                                {msg.role === 'assistant' && recipeSuggestions.length > 0 && idx === chatMessages.length - 1 && (
                                    <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--accent-secondary)' }}>Suggested Recipes:</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {recipeSuggestions.map((recipe, i) => (
                                                <div key={i} style={{ borderBottom: i < recipeSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: '0.75rem' }}>
                                                    <div style={{ fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.25rem' }}>{recipe.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{recipe.reasoning}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', fontStyle: 'italic' }}>
                                                        Needs: {recipe.missing_ingredients.join(', ') || 'Nothing!'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                                <Bot size={18} />
                            </div>
                            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.05)' }}>
                                <Loader2 className="lucide-spin" size={20} color="var(--text-secondary)" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-secondary"
                            style={{ padding: '0.75rem', borderRadius: '50%', width: '48px', height: '48px' }}
                            title="Upload photo of fridge or receipt"
                        >
                            <ImageIcon size={20} />
                        </button>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="Type your message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            style={{ flex: 1, borderRadius: 'var(--radius-full)', paddingLeft: '1.5rem' }}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '0.75rem', borderRadius: '50%', width: '48px', height: '48px' }}
                            disabled={loading || !input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatAgentPage;
