import React, { useState } from 'react';
import { useApi } from './hooks/useApi';
import FileUpload from './components/FileUpload';
import KPICards from './components/KPICards';
import DataPreview from './components/DataPreview';
import { RevenueTrendChart, TopProductsChart, RegionalChart, SegmentsChart, ForecastChart } from './components/Charts';

export default function App() {
  const api = useApi();
  const [uploaded, setUploaded] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState('monthly');
  const [products, setProducts] = useState([]);
  const [regional, setRegional] = useState([]);
  const [segments, setSegments] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleUpload = async (file) => {
    const info = await api.uploadFile(file);
    if (!info) return;
    setUploadInfo(info);
    setUploaded(true);
    loadAllData();
  };

  const loadAllData = async () => {
    const [s, t, p, r, seg, fc] = await Promise.all([
      api.getSummary(),
      api.getRevenueTrend('monthly'),
      api.getTopProducts(10),
      api.getRegional(),
      api.getSegments(),
      api.getForecast(),
    ]);
    if (s)   setStats(s);
    if (t)   setTrend(t);
    if (p)   setProducts(p);
    if (r)   setRegional(r);
    if (seg) setSegments(seg);
    if (fc)  setForecast(fc);
  };

  const handlePeriodChange = async (period) => {
    setTrendPeriod(period);
    const t = await api.getRevenueTrend(period);
    if (t) setTrend(t);
  };

  if (!uploaded) {
    return <FileUpload onUpload={handleUpload} loading={api.loading} />;
  }

  const TABS = ['overview', 'products', 'regional', 'segments', 'forecast'];

  return (
    <div style={s.app}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={s.topLeft}>
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#F59E0B" fillOpacity="0.15"/>
            <rect x="8" y="20" width="5" height="9" rx="1.5" fill="#F59E0B"/>
            <rect x="15.5" y="14" width="5" height="15" rx="1.5" fill="#F59E0B" fillOpacity="0.8"/>
            <rect x="23" y="9" width="5" height="20" rx="1.5" fill="#F59E0B" fillOpacity="0.5"/>
          </svg>
          <span style={s.brand}>DataPulse</span>
          <span style={s.divider}/>
          <span style={s.filename}>{uploadInfo?.filename}</span>
        </div>
        <div style={s.topRight}>
          <button style={s.reportBtn} onClick={api.downloadReport}>
            ↓ PDF Report
          </button>
          <button style={s.newBtn} onClick={() => {
            setUploaded(false);
            setUploadInfo(null);
            setStats(null);
            setTrend([]);
            setProducts([]);
            setRegional([]);
            setSegments([]);
            setForecast(null);
            setActiveTab('overview');
          }}>
            + New File
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={s.tabBar}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            ...s.tab,
            ...(activeTab === tab ? s.tabActive : {}),
          }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>
        {api.error && (
          <div style={s.error}>⚠ {api.error}</div>
        )}

        <DataPreview uploadInfo={uploadInfo} />
        <KPICards stats={stats} />

        {activeTab === 'overview' && (
          <>
            <RevenueTrendChart data={trend} period={trendPeriod} onPeriodChange={handlePeriodChange} />
            <div style={s.twoCol}>
              <div style={{ flex: 1 }}><TopProductsChart data={products.slice(0, 5)} /></div>
              <div style={{ flex: 1 }}><RegionalChart data={regional} /></div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <TopProductsChart data={products} />
        )}

        {activeTab === 'regional' && (
          <>
            <RegionalChart data={regional} />
            <div style={s.regionTable}>
              {regional.map((r, i) => (
                <div key={r.region} style={s.regionRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#475569', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>#{i+1}</span>
                    <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>{r.region}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#F59E0B', fontSize: 14, fontWeight: 700 }}>${r.revenue.toLocaleString()}</div>
                      <div style={{ color: '#475569', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>revenue</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{r.orders.toLocaleString()}</div>
                      <div style={{ color: '#475569', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>orders</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{r.share_pct}%</div>
                      <div style={{ color: '#475569', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>share</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'segments' && (
          <SegmentsChart data={segments} />
        )}

        {activeTab === 'forecast' && (
          <ForecastChart data={forecast} />
        )}
      </div>
    </div>
  );
}

const s = {
  app: { minHeight: '100vh', background: '#080c14', color: '#f1f5f9' },
  topbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 24px', height: 56, background: '#0a0f1a',
    borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 10,
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  brand: { fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: '#fff' },
  divider: { width: 1, height: 16, background: 'rgba(255,255,255,0.1)' },
  filename: { color: '#475569', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  topRight: { display: 'flex', gap: 10 },
  reportBtn: {
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: 8, padding: '7px 14px', color: '#F59E0B', fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer',
  },
  newBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '7px 14px', color: '#94a3b8', fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer',
  },
  tabBar: {
    display: 'flex', gap: 4, padding: '0 24px',
    background: '#0a0f1a', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tab: {
    background: 'none', border: 'none', padding: '12px 16px',
    color: '#475569', fontSize: 13, cursor: 'pointer',
    fontFamily: "'Syne', sans-serif", fontWeight: 600,
    borderBottom: '2px solid transparent', transition: 'all 0.15s',
  },
  tabActive: { color: '#F59E0B', borderBottom: '2px solid #F59E0B' },
  content: { padding: '24px', maxWidth: 1400, margin: '0 auto' },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace", marginBottom: 20,
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  regionTable: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, overflow: 'hidden',
  },
  regionRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
};
