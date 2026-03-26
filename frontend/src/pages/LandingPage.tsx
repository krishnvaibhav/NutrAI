import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
    ChefHat, Package, ScanLine, Activity, ArrowRight,
    Eye, Sparkles, TrendingUp, Leaf, CheckCircle, BarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── palette ─────────────────────────────────────────────────────────── */
const HERO_BG = '#2C3B2D';   // muted sage hero
const DARK = '#0C1912';   // deep dark (CTA / footer)
const DARK_CARD = 'rgba(255,255,255,0.07)';
const GREEN = '#2D4A3E';
const GREEN_MID = '#3D6B5A';
const GREEN_LIGHT = '#5BB88A';
const FEAT_BG = '#F2F2EF';   // very light warm grey (feature section)

const NAV_LINKS = ['Features', 'How It Works', 'Vision', 'Nutrition'];

const LandingPage: React.FC = () => {
    const { currentUser } = useAuth();
    if (currentUser) return <Navigate to="/home" replace />;

    return (
        <div style={{ minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#1C1C1E' }}>

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <header style={{ position: 'sticky', top: 0, zIndex: 200, background: HERO_BG, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="landing-header-inner">
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <ChefHat size={20} color={GREEN_LIGHT} />
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.01em' }}>PantryAI</span>
                    </div>

                    {/* Centre nav */}
                    <nav className="landing-nav">
                        {NAV_LINKS.map((item, i) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                style={{
                                    color: i === 0 ? GREEN_LIGHT : 'rgba(255,255,255,0.55)',
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                    borderBottom: i === 0 ? `2px solid ${GREEN_LIGHT}` : '2px solid transparent',
                                    paddingBottom: '2px',
                                    transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'white'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = i === 0 ? GREEN_LIGHT : 'rgba(255,255,255,0.55)'; }}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* Actions */}
                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                        <button style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.18)', padding: '0.5rem 1.4rem', borderRadius: '999px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                            Get Started
                        </button>
                    </Link>
                </div>
            </header>

            {/* ── HERO ───────────────────────────────────────────────────── */}
            <section style={{ background: HERO_BG, padding: '5.5rem 2rem 7rem', overflow: 'hidden' }}>
                <div className="landing-hero-grid" style={{ maxWidth: '1120px', margin: '0 auto' }}>

                    {/* Left — text */}
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '2rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN_LIGHT, flexShrink: 0 }} />
                            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Next-Gen Harvest AI</span>
                        </div>

                        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(3.2rem, 6vw, 5.5rem)', fontWeight: 800, color: 'white', lineHeight: 1.03, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                            Harvest<br />
                            <span style={{ color: GREEN_LIGHT }}>Intelligence.</span>
                        </h1>

                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '440px' }}>
                            The organic intersection of culinary arts and neural computation. Optimise your inventory and health with precision vision recognition.
                        </p>

                        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                            <Link to="/signup" style={{ textDecoration: 'none' }}>
                                <button style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.22)', padding: '0.8rem 1.75rem', borderRadius: '999px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.975rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Get Started <ArrowRight size={15} />
                                </button>
                            </Link>
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <button style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.8rem 1.75rem', borderRadius: '999px', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.975rem', cursor: 'pointer' }}>
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Right — scan card mockup */}
                    <div className="landing-hero-card-wrap">

                        {/* Accuracy badge — top right */}
                        <div style={{ position: 'absolute', top: '-16px', right: '-16px', zIndex: 3, background: 'rgba(60,80,60,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(91,184,138,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BarChart2 size={14} color={GREEN_LIGHT} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Accuracy</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>99.8%</div>
                            </div>
                        </div>

                        {/* Main scan card */}
                        <div style={{ background: 'rgba(50,70,52,0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.75rem', width: '300px', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', position: 'relative', zIndex: 2 }}>
                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ScanLine size={18} color="rgba(255,255,255,0.6)" />
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>Active Scan</span>
                            </div>

                            {/* Skeleton bars */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem' }}>
                                <div style={{ height: '5px', background: GREEN_LIGHT, borderRadius: '999px', width: '60%', opacity: 0.85 }} />
                                <div style={{ height: '5px', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', width: '88%' }} />
                                <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', width: '52%' }} />
                            </div>

                            {/* Macro boxes */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {[{ label: 'Protein', val: '24g' }, { label: 'Fiber', val: '8g' }].map(m => (
                                    <div key={m.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.9rem 1rem' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{m.label}</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{m.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Plant photo — bottom left */}
                        <div style={{ position: 'absolute', bottom: '-28px', left: '-20px', width: '130px', height: '130px', borderRadius: '18px', overflow: 'hidden', zIndex: 1, boxShadow: '0 12px 36px rgba(0,0,0,0.45)' }}>
                            <img
                                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80"
                                alt="Fresh produce"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ───────────────────────────────────────────────── */}
            <section id="features" style={{ background: FEAT_BG, padding: '5.5rem 2rem' }}>
                <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
                    {/* Heading row */}
                    <div className="landing-features-top-grid" style={{ marginBottom: '3rem' }}>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: GREEN_MID, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Precision Control</p>
                            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#1C1C1E', lineHeight: 1.1, letterSpacing: '-0.025em' }}>
                                Smart Inventory<br />Management
                            </h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.72 }}>
                                Reduce waste by 40% with predictive expiration tracking and automated procurement workflows.
                            </p>
                        </div>
                    </div>

                    {/* Two feature cards */}
                    <div className="landing-feature-cards-grid">

                        {/* Card 1: Split — text left, image bleeds into right */}
                        <div style={{ background: '#EDECEA', borderRadius: '20px', border: '1px solid #E0DED9', position: 'relative', overflow: 'hidden', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                            {/* Text area */}
                            <div style={{ padding: '2rem', width: '52%', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem' }}>
                                    <Package size={16} color="#5A6B5C" />
                                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#9CA3AF' }}>inventory_manager</span>
                                </div>
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#1C1C1E', marginBottom: '0.6rem' }}>Zero-Waste Ecosystem</h3>
                                <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 'auto', paddingBottom: '1.5rem' }}>
                                    Our AI monitors biochemical decay rates to ensure your ingredients are used at their nutritional peak.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {['Real-time Tracking', 'Predictive API'].map(tag => (
                                        <span key={tag} style={{ background: 'white', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: '999px', padding: '0.3rem 0.85rem', fontSize: '0.75rem', fontWeight: 500 }}>{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Image — absolute, covers right portion */}
                            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '58%', zIndex: 1 }}>
                                <img
                                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80"
                                    alt="Fresh ingredients"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {/* Left fade to blend */}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #EDECEA 0%, transparent 45%)' }} />
                            </div>
                        </div>

                        {/* Card 2: dark — Auto-Restock */}
                        <div style={{ background: GREEN, borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
                                <Sparkles size={17} color="rgba(255,255,255,0.7)" />
                                <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>auto_awesome</span>
                            </div>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.65rem' }}>Auto-Restock</h3>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 'auto', paddingBottom: '2rem' }}>
                                Seamlessly connected to organic suppliers for just-in-time delivery. Never run out of essentials again.
                            </p>

                            {/* Supply level */}
                            <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Supply Level</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>82%</span>
                                </div>
                                <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: '82%', background: 'rgba(255,255,255,0.4)', borderRadius: '999px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VISION ─────────────────────────────────────────────────── */}
            <section id="vision" style={{
                position: 'relative',
                padding: '0',
                overflow: 'hidden',
                minHeight: '580px',
                display: 'flex',
                alignItems: 'stretch',
            }}>
                {/* Full-width background photo */}
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80"
                    alt="Fresh produce harvest"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
                {/* Dark overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,20,12,0.52)' }} />

                {/* Content — right-aligned card */}
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '1120px', margin: '0 auto', width: '100%', padding: '5rem 2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(30,50,35,0.62)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '22px', padding: '2.25rem', maxWidth: '420px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>

                        {/* Icon row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(91,184,138,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Eye size={20} color={GREEN_LIGHT} />
                            </div>
                            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>vision_scan</span>
                        </div>

                        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.9rem', fontWeight: 800, color: 'white', marginBottom: '0.85rem', letterSpacing: '-0.025em' }}>
                            Vision Recognition
                        </h3>

                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem', lineHeight: 1.72, marginBottom: '1.5rem' }}>
                            Our proprietary neural engine identifies over 15,000 unique ingredients, analysing ripeness, volume, and nutrient density through any mobile lens.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Insta-Log', desc: 'Snap a photo to instantly log nutrients and update stock.' },
                                { label: 'Ripeness Analysis', desc: 'Predict peak flavour and nutrient windows using spectral AI.' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <CheckCircle size={16} color={GREEN_LIGHT} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link to="/signup" style={{ textDecoration: 'none' }}>
                            <button style={{ background: GREEN_MID, color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', width: '100%' }}>
                                Explore the Engine
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── NUTRITION ──────────────────────────────────────────────── */}
            <section id="nutrition" style={{ background: FEAT_BG, padding: '5rem 2rem' }}>
                <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
                            AI-Powered Nutrition
                        </h2>
                        <p style={{ color: '#6B7280', maxWidth: '500px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.65 }}>
                            Personalised health intelligence that learns from your consumption habits and pantry.
                        </p>
                    </div>

                    <div className="landing-features-grid">
                        {[
                            { icon: Activity, mono: 'biotech', label: 'Micro-Nutrient Fix', desc: 'Automated identification of vitamin gaps in your weekly nutrition logs.' },
                            { icon: ChefHat, mono: 'restaurant_menu', label: 'Neural Recipes', desc: 'Recipes generated based on what\'s currently in your fridge and your goals.' },
                            { icon: TrendingUp, mono: 'insights', label: 'Biological Sync', desc: 'Sync with wearables to adjust macro targets based on daily exertion.' },
                            { icon: Leaf, mono: 'eco', label: 'Ethical Sourcing', desc: 'Real-time reports on the carbon footprint of your pantry habits.' },
                        ].map(({ icon: Icon, mono, label, desc }) => (
                            <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Icon size={17} color={GREEN} />
                                    <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#9CA3AF' }}>{mono}</span>
                                </div>
                                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#1C1C1E', marginBottom: '0.5rem' }}>{label}</h4>
                                <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.62, margin: 0 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
            <section id="how-it-works" style={{ background: '#ffffff', padding: '5rem 2rem' }}>
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.025em' }}>
                            Up and running in three steps
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { n: '01', title: 'Build your pantry', body: 'Add ingredients manually or scan them with your camera. PantryAI tracks quantities, categories, and expiry dates automatically.' },
                            { n: '02', title: 'Get personalised recipes', body: 'Tell the AI what you\'re in the mood for. It checks your real pantry and generates complete recipes — no extra shopping needed.' },
                            { n: '03', title: 'Track your nutrition effortlessly', body: 'Describe a meal in plain English. PantryAI parses it instantly and logs your daily calories, protein, carbs, and fat.' },
                        ].map(({ n, title, body }) => (
                            <div key={n} style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start', background: FEAT_BG, borderRadius: '16px', padding: '1.75rem', border: '1px solid #E5E7EB' }}>
                                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.25rem', fontWeight: 800, color: '#D1D5DB', lineHeight: 1, flexShrink: 0, minWidth: '52px' }}>{n}</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#1C1C1E', marginBottom: '0.4rem' }}>{title}</h3>
                                    <p style={{ color: '#6B7280', fontSize: '0.925rem', lineHeight: 1.65, margin: 0 }}>{body}</p>
                                </div>
                                <CheckCircle size={20} color={GREEN_LIGHT} style={{ flexShrink: 0, marginTop: '2px' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BOTTOM CTA ─────────────────────────────────────────────── */}
            <section style={{ background: DARK, padding: '6rem 2rem', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: 'white', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                    Ready to take control<br />of your kitchen?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
                    Free to start. No credit card required.
                </p>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                    <button style={{ background: GREEN_LIGHT, color: 'white', border: 'none', padding: '0.95rem 2.5rem', borderRadius: '999px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        Create free account <ArrowRight size={18} />
                    </button>
                </Link>
            </section>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <footer style={{ background: DARK, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.75rem 2rem' }}>
                <div className="landing-footer-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ChefHat size={16} color={GREEN_LIGHT} />
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)' }}>PantryAI</span>
                        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.8rem' }}>· Cultivating Intelligence</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {['Privacy Policy', 'Terms of Service'].map(link => (
                            <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textDecoration: 'none' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.3)'; }}>
                                {link}
                            </a>
                        ))}
                        <Link to="/contact" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textDecoration: 'none' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.3)'; }}>
                            Contact
                        </Link>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>© 2025 PantryAI</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
