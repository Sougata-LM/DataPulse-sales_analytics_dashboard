import React from 'react';

function fmt(val, type = 'currency') {
  if (val === undefined || val === null) return '—';
  if (type === 'currency') return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (type === 'number') return Number(val).toLocaleString();
  if (type === 'percent') return val + '%';
  return val;
}

function KPICard({ label, value, type, sub, trend }) {
  const trendColor = trend > 0 ? '#22c55e' : trend < 0 ? '#ef4444' : '#94a3b8';
  return (
    <div style={s.card}>
      <div style={s.label}>{label}</div>
      <div style={s.value}>{fmt(value, type)}</div>
      {sub && <div style={{ ...s.sub, color: trendColor }}>{sub}</div>}
    </div>
  );
}

export default function KPICards({ stats }) {
  if (!stats) return null;
  const growth = stats.mom_growth_pct;
  return (
    <div style={s.grid}>
      <KPICard label="Total Revenue" value={stats.total_revenue} type="currency" />
      <KPICard label="Total Orders" value={stats.total_rows} type="number" />
      <KPICard label="Avg Order Value" value={stats.avg_order_value} type="currency" />
      <KPICard label="Unique Customers" value={stats.unique_customers} type="number" />
      <KPICard label="Unique Products" value={stats.unique_products} type="number" />
      <KPICard
        label="MoM Growth"
        value={growth !== undefined ? growth : null}
        type="percent"
        sub={growth !== undefined ? (growth >= 0 ? `▲ vs last month` : `▼ vs last month`) : null}
        trend={growth}
      />
    </div>
  );
}

const s = {
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24,
  },
  card: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '18px 20px',
  },
  label: { color: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  value: { color: '#f1f5f9', fontSize: 22, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' },
  sub: { fontSize: 11, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" },
};
