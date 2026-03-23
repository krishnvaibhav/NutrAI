import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Camera, CheckCircle, Sparkles } from 'lucide-react';
import { apiCall } from '../api';

interface ScannedItem {
  name: string;
  quantity: number;
  unit: string;
}

const AVATAR_COLORS = ['#2D4A3E', '#4A7C6B', '#D97706', '#0891B2', '#6366F1', '#DC2626'];

const VisionPage: React.FC = () => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    setError(''); setSuccessMsg(''); setUpgradeMsg(''); setScannedItems([]);
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await apiCall('POST', '/agents/vision/scan', formData, true);
      setScannedItems(data);
    } catch (err: unknown) {
      const e = err as Error & { status?: number };
      if (e.status === 403) setUpgradeMsg(e.message);
      else setError('Could not process the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPantry = async () => {
    setLoading(true); setError('');
    let count = 0;
    try {
      for (const item of scannedItems) {
        await apiCall('POST', '/pantry', item);
        count++;
      }
      setScannedItems([]); setPreview(null);
      setSuccessMsg(`Added ${count} item${count !== 1 ? 's' : ''} to your pantry.`);
    } catch {
      setError('Failed to add some items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in page-content" style={{ maxWidth: '820px' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ScanLine size={30} color="var(--accent-primary)" />
          Vision Scan
          <span style={{ fontSize: '0.7rem', background: 'rgba(45,74,62,0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(45,74,62,0.2)', borderRadius: 'var(--radius-full)', padding: '0.2rem 0.6rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pro</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Upload a photo of your fridge or receipt and AI will detect the items automatically.
        </p>
      </header>

      {upgradeMsg && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 600, margin: 0 }}>Pro Feature Required</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>{upgradeMsg}</p>
          </div>
          <Link to="/account"><button className="btn-primary">Upgrade to Pro</button></Link>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--accent-danger)' }}>
          <p style={{ color: 'var(--accent-danger)', margin: 0, fontSize: '0.9rem' }}>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--accent-secondary)' }}>
          <p style={{ color: 'var(--accent-secondary)', margin: 0, fontSize: '0.9rem' }}>✓ {successMsg}</p>
        </div>
      )}

      {/* Viewfinder Upload Area */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          background: preview ? 'transparent' : '#1A1A1A',
          cursor: loading ? 'default' : 'pointer',
          marginBottom: '1.5rem',
          minHeight: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />

        {/* Corner bracket guides */}
        {!preview && !loading && (
          <>
            {[['top:16px;left:16px', 'top:0;left:0;borderTop', 'top:0;left:0;borderLeft'],
              ['top:16px;right:16px', 'top:0;right:0;borderTop', 'top:0;right:0;borderRight'],
              ['bottom:16px;left:16px', 'bottom:0;left:0;borderBottom', 'bottom:0;left:0;borderLeft'],
              ['bottom:16px;right:16px', 'bottom:0;right:0;borderBottom', 'bottom:0;right:0;borderRight'],
            ].map((_, idx) => {
              const positions = [
                { outer: { top: 16, left: 16 }, h: { top: 0, left: 0 }, v: { top: 0, left: 0 } },
                { outer: { top: 16, right: 16 }, h: { top: 0, right: 0 }, v: { top: 0, right: 0 } },
                { outer: { bottom: 16, left: 16 }, h: { bottom: 0, left: 0 }, v: { bottom: 0, left: 0 } },
                { outer: { bottom: 16, right: 16 }, h: { bottom: 0, right: 0 }, v: { bottom: 0, right: 0 } },
              ];
              const pos = positions[idx];
              const borderH = idx < 2 ? 'borderTop' : 'borderBottom';
              const borderV = idx === 0 || idx === 2 ? 'borderLeft' : 'borderRight';
              return (
                <div key={idx} style={{ position: 'absolute', width: '40px', height: '40px', ...pos.outer }}>
                  <div style={{ position: 'absolute', width: '100%', height: '3px', background: 'rgba(255,255,255,0.6)', ...pos.h, [borderH === 'borderTop' ? 'top' : 'bottom']: 0 }} />
                  <div style={{ position: 'absolute', width: '3px', height: '100%', background: 'rgba(255,255,255,0.6)', ...pos.v, [borderV === 'borderLeft' ? 'left' : 'right']: 0 }} />
                </div>
              );
            })}
          </>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <ScanLine size={48} color="white" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.8 }} className="lucide-spin" />
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Scanning with AI vision...</p>
          </div>
        ) : preview ? (
          <div style={{ width: '100%', position: 'relative' }}>
            <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block', borderRadius: '20px' }} />
            {/* Detected item overlay chips */}
            {scannedItems.length > 0 && scannedItems.slice(0, 3).map((item, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: `${20 + i * 60}px`,
                left: `${15 + (i % 2) * 45}%`,
                background: 'rgba(45,74,62,0.9)',
                color: 'white',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </div>
            ))}
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', backdropFilter: 'blur(4px)' }}>
              Click to re-scan
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <Camera size={56} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 1.25rem', display: 'block' }} />
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Drop image here or click to upload
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              Supports JPG, PNG, WEBP — fridge photos or grocery receipts
            </p>
          </div>
        )}
      </div>

      {/* Detected Items */}
      {scannedItems.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--accent-primary)" />
            Detected Items ({scannedItems.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {scannedItems.map((item, i) => {
              const color = AVATAR_COLORS[item.name.charCodeAt(0) % AVATAR_COLORS.length];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginLeft: '0.6rem' }}>{item.quantity} {item.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={handleAddToPantry} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
            <CheckCircle size={16} />
            {loading ? 'Adding...' : `Add All ${scannedItems.length} Items to Pantry`}
          </button>
        </div>
      )}
    </div>
  );
};

export default VisionPage;
