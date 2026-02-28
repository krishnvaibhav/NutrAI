import React from 'react';
import { Bot, ChefHat, Activity, Sparkles } from 'lucide-react';

interface AILoaderProps {
    message?: string;
    variant?: 'chat' | 'recipe' | 'nutrition' | 'default';
}

const icons = {
    chat: Bot,
    recipe: ChefHat,
    nutrition: Activity,
    default: Sparkles,
};

const colors = {
    chat: 'var(--accent-primary)',
    recipe: 'var(--accent-secondary)',
    nutrition: 'var(--accent-warning)',
    default: 'var(--accent-primary)',
};

const AILoader: React.FC<AILoaderProps> = ({ message = 'Thinking...', variant = 'default' }) => {
    const Icon = icons[variant];
    const color = colors[variant];

    return (
        <div className="ai-loader" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            padding: '3rem 2rem',
        }}>
            {/* Pulsing icon ring */}
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                <div className="ai-loader-ring" style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: `2px solid transparent`,
                    borderTopColor: color,
                    borderRightColor: color,
                }} />
                <div className="ai-loader-ring-inner" style={{
                    position: 'absolute',
                    inset: '6px',
                    borderRadius: '50%',
                    border: `2px solid transparent`,
                    borderBottomColor: color,
                    borderLeftColor: color,
                    opacity: 0.5,
                }} />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Icon size={24} color={color} className="ai-loader-icon" />
                </div>
            </div>

            {/* Message with animated dots */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
            }}>
                <span>{message}</span>
                <span className="ai-loader-dots">
                    <span className="ai-dot" style={{ animationDelay: '0s' }}>.</span>
                    <span className="ai-dot" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="ai-dot" style={{ animationDelay: '0.4s' }}>.</span>
                </span>
            </div>

            {/* Shimmer bar */}
            <div style={{
                width: '120px',
                height: '3px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.05)',
                overflow: 'hidden',
            }}>
                <div className="ai-loader-shimmer" style={{
                    width: '50%',
                    height: '100%',
                    borderRadius: '2px',
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                }} />
            </div>
        </div>
    );
};

export default AILoader;
