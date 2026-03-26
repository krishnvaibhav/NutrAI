import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Send, CheckCircle, Mail, MapPin, ArrowLeft } from 'lucide-react';
import emailjs from '@emailjs/browser';

const HERO_BG     = '#2C3B2D';
const GREEN       = '#2D4A3E';
const GREEN_MID   = '#3D6B5A';
const GREEN_LIGHT = '#5BB88A';

const ContactPage: React.FC = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await emailjs.sendForm(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                formRef.current!,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
            );
            setSent(true);
        } catch {
            setError('Something went wrong. Please try again or email us directly.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F2F2EF', fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── HEADER (same style as landing) ─────────────────────────── */}
            <header style={{ position: 'sticky', top: 0, zIndex: 200, background: HERO_BG, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
                        <ChefHat size={20} color={GREEN_LIGHT} />
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>PantryAI</span>
                    </Link>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', textDecoration: 'none' }}>
                        <ArrowLeft size={15} /> Back to Home
                    </Link>
                </div>
            </header>

            {/* ── HERO STRIP ─────────────────────────────────────────────── */}
            <div style={{ background: HERO_BG, padding: '3.5rem 2rem 4rem' }}>
                <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
                    <p style={{ fontSize: '0.72rem', color: GREEN_LIGHT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Get in touch</p>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
                        Contact Us
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.65 }}>
                        Have a question, idea, or just want to say hi? Fill in the form and we'll get back to you shortly.
                    </p>
                </div>
            </div>

            {/* ── CONTENT ────────────────────────────────────────────────── */}
            <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '4rem', alignItems: 'start' }} className="contact-grid">

                {/* Left — info */}
                <div>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#1C1C1E', marginBottom: '0.5rem' }}>
                        We'd love to hear from you
                    </h2>
                    <p style={{ color: '#6B7280', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                        Whether it's a bug report, feature request, partnership enquiry, or general feedback — drop us a message.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(45,74,62,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Mail size={17} color={GREEN} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1C1E', marginBottom: '0.15rem' }}>Email</div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Replies within 24 hours</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(45,74,62,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <MapPin size={17} color={GREEN} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1C1E', marginBottom: '0.15rem' }}>Location</div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Australia</div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative block */}
                    <div style={{ marginTop: '3rem', background: GREEN, borderRadius: '16px', padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Response time</div>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>&lt; 24h</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>We read every message personally.</div>
                    </div>
                </div>

                {/* Right — form card */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    {sent ? (
                        /* ── Success state ── */
                        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(91,184,138,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                <CheckCircle size={28} color={GREEN_LIGHT} />
                            </div>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#1C1C1E', marginBottom: '0.5rem' }}>Message sent!</h3>
                            <p style={{ color: '#6B7280', fontSize: '0.925rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
                                Thanks for reaching out. We'll get back to you within 24 hours.
                            </p>
                            <button
                                onClick={() => { setSent(false); formRef.current?.reset(); }}
                                style={{ background: GREEN, color: 'white', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '999px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        /* ── Form ── */
                        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#1C1C1E', marginBottom: '0.25rem' }}>
                                Send a message
                            </h3>

                            {error && (
                                <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '0.85rem 1rem', color: '#DC2626', fontSize: '0.875rem' }}>
                                    {error}
                                </div>
                            )}

                            {/* Name + Email row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="contact-name-email-grid">
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Name</label>
                                    <input
                                        name="from_name"
                                        type="text"
                                        required
                                        placeholder="Your name"
                                        style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#1C1C1E', padding: '0.75rem 1rem', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                                        onFocus={e => { e.currentTarget.style.borderColor = GREEN_MID; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(61,107,90,0.1)`; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Email</label>
                                    <input
                                        name="from_email"
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#1C1C1E', padding: '0.75rem 1rem', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                                        onFocus={e => { e.currentTarget.style.borderColor = GREEN_MID; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(61,107,90,0.1)`; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Subject</label>
                                <input
                                    name="subject"
                                    type="text"
                                    required
                                    placeholder="What's this about?"
                                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#1C1C1E', padding: '0.75rem 1rem', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                                    onFocus={e => { e.currentTarget.style.borderColor = GREEN_MID; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(61,107,90,0.1)`; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}>Message</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={6}
                                    placeholder="Tell us what's on your mind..."
                                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#1C1C1E', padding: '0.75rem 1rem', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color 0.15s' }}
                                    onFocus={e => { e.currentTarget.style.borderColor = GREEN_MID; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(61,107,90,0.1)`; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{ background: loading ? '#9CA3AF' : GREEN, color: 'white', border: 'none', padding: '0.85rem 1.75rem', borderRadius: '999px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.975rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s', alignSelf: 'flex-start' }}
                            >
                                <Send size={16} />
                                {loading ? 'Sending…' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <footer style={{ background: '#0C1912', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>© 2025 PantryAI · Verdant Intelligence</p>
            </footer>
        </div>
    );
};

export default ContactPage;
