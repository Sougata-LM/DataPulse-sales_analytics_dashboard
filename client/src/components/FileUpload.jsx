import React, { useState, useRef } from 'react';

export default function FileUpload({ onUpload, loading }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      alert('Please upload a CSV or Excel file.');
      return;
    }
    onUpload(file);
  };

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.logoRow}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#F59E0B" fillOpacity="0.15"/>
            <rect x="8" y="20" width="5" height="9" rx="1.5" fill="#F59E0B"/>
            <rect x="15.5" y="14" width="5" height="15" rx="1.5" fill="#F59E0B" fillOpacity="0.8"/>
            <rect x="23" y="9" width="5" height="20" rx="1.5" fill="#F59E0B" fillOpacity="0.5"/>
          </svg>
          <span style={s.brand}>DataPulse</span>
        </div>
        <h1 style={s.title}>Sales Analytics<br/><span style={s.accent}>Dashboard</span></h1>
        <p style={s.sub}>Upload your sales data and get instant insights — trends, forecasts, segments, and a PDF report.</p>

        <div
          style={{ ...s.dropzone, ...(drag ? s.dropActive : {}) }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current.click()}
        >
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          {loading ? (
            <div style={s.spinWrap}><div style={s.spinner} /><p style={s.uploadHint}>Analyzing data...</p></div>
          ) : (
            <>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 14 }}>
                <path d="M20 28V16M20 16L15 21M20 16L25 21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 28C5.2 26.6 4 22 6 18C7.6 14.8 11 13 14 13.4C15.2 10.2 18.4 8 22 8C27 8 31 12 31 17C31 17.3 31 17.7 30.9 18C33 19 34 21.6 33 24C32.2 26 30 28 28 28" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={s.uploadMain}>Drop your file here or <span style={s.browseLink}>browse</span></p>
              <p style={s.uploadHint}>Supports CSV, XLSX, XLS — auto-detects column names</p>
            </>
          )}
        </div>

        <div style={s.features}>
          {[
            ['📈', 'Revenue Trends', 'Monthly & weekly charts'],
            ['🏆', 'Top Products', 'Best sellers by revenue'],
            ['🌍', 'Regional Breakdown', 'Performance by area'],
            ['🔮', 'Forecast', '6-month ML prediction'],
            ['👥', 'Segments', 'Customer value groups'],
            ['📄', 'PDF Report', 'Auto-generated report'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={s.feature}>
              <span style={s.featureIcon}>{icon}</span>
              <div>
                <div style={s.featureTitle}>{title}</div>
                <div style={s.featureDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', background: '#080c14',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px',
  },
  hero: { maxWidth: 640, width: '100%', textAlign: 'center' },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 },
  brand: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
  title: {
    fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800,
    color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1px',
  },
  accent: { color: '#F59E0B' },
  sub: { color: '#64748b', fontSize: 16, lineHeight: 1.6, marginBottom: 36, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 },
  dropzone: {
    border: '1.5px dashed rgba(245,158,11,0.3)', borderRadius: 16,
    background: 'rgba(245,158,11,0.03)', padding: '48px 32px',
    cursor: 'pointer', transition: 'all 0.2s', marginBottom: 36,
  },
  dropActive: {
    border: '1.5px dashed #F59E0B',
    background: 'rgba(245,158,11,0.08)',
    transform: 'scale(1.01)',
  },
  uploadMain: { color: '#e2e8f0', fontSize: 16, fontWeight: 600, marginBottom: 8 },
  browseLink: { color: '#F59E0B', textDecoration: 'underline' },
  uploadHint: { color: '#475569', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" },
  spinWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  spinner: {
    width: 32, height: 32, borderRadius: '50%',
    border: '3px solid rgba(245,158,11,0.2)',
    borderTopColor: '#F59E0B',
    animation: 'spin 0.8s linear infinite',
  },
  features: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'left',
  },
  feature: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10,
  },
  featureIcon: { fontSize: 20, lineHeight: 1 },
  featureTitle: { color: '#cbd5e1', fontSize: 13, fontWeight: 600, marginBottom: 2 },
  featureDesc: { color: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" },
};
