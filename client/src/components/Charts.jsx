import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const AMBER = '#F59E0B';
const BLUE  = '#3B82F6';
const GREEN = '#10B981';
const PINK  = '#EC4899';
const PURPLE = '#8B5CF6';
const PALETTE = [AMBER, BLUE, GREEN, PINK, PURPLE, '#F97316', '#14B8A6', '#6366F1'];

const chartBg = {
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14, padding: '20px 16px',
};

const ChartTitle = ({ children }) => (
  <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1923', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: '#64748b', fontSize: 11, marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#f1f5f9', fontSize: 13, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? '$' + p.value.toLocaleString() : p.value?.toLocaleString?.() ?? p.value}
        </div>
      ))}
    </div>
  );
};

export function RevenueTrendChart({ data, period, onPeriodChange }) {
  return (
    <div style={{ ...chartBg, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <ChartTitle>Revenue Trend</ChartTitle>
        <div style={{ display: 'flex', gap: 6 }}>
          {['monthly', 'weekly'].map(p => (
            <button key={p} onClick={() => onPeriodChange(p)} style={{
              background: period === p ? 'rgba(245,158,11,0.15)' : 'transparent',
              border: `1px solid ${period === p ? AMBER : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6, padding: '4px 10px', color: period === p ? AMBER : '#64748b',
              fontSize: 11, cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'capitalize',
            }}>{p}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={AMBER} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={AMBER} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
          <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)}/>
          <Tooltip content={<CustomTooltip />}/>
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke={AMBER} strokeWidth={2} fill="url(#rev)" dot={false} activeDot={{ r: 5, fill: AMBER }}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsChart({ data }) {
  return (
    <div style={{ ...chartBg, marginBottom: 20 }}>
      <ChartTitle>Top Products by Revenue</ChartTitle>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false}/>
          <XAxis type="number" tick={{ fill: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)}/>
          <YAxis type="category" dataKey="product" width={130} tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false}/>
          <Tooltip content={<CustomTooltip />}/>
          <Bar dataKey="revenue" name="Revenue" radius={[0,6,6,0]}>
            {data?.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RegionalChart({ data }) {
  return (
    <div style={{ ...chartBg, marginBottom: 20 }}>
      <ChartTitle>Revenue by Region</ChartTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <ResponsiveContainer width="45%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="revenue" nameKey="region" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={3}>
              {data?.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]}/>)}
            </Pie>
            <Tooltip content={<CustomTooltip />}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          {data?.slice(0, 6).map((r, i) => (
            <div key={r.region} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length] }}/>
                <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>{r.region}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>${r.revenue.toLocaleString()}</div>
                <div style={{ color: '#475569', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>{r.share_pct}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SegmentsChart({ data }) {
  return (
    <div style={{ ...chartBg, marginBottom: 20 }}>
      <ChartTitle>Customer Segments</ChartTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
          <XAxis dataKey="segment" tick={{ fill: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)}/>
          <Tooltip content={<CustomTooltip />}/>
          <Bar dataKey="revenue" name="Revenue" radius={[6,6,0,0]}>
            {data?.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        {data?.map((s, i) => (
          <div key={s.segment} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px', borderTop: `2px solid ${PALETTE[i % PALETTE.length]}` }}>
            <div style={{ color: '#64748b', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>{s.segment}</div>
            <div style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>{s.customers}</div>
            <div style={{ color: '#475569', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>customers</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ForecastChart({ data }) {
  if (!data) return null;
  const combined = [...(data.historical || []), ...(data.forecast || [])];
  return (
    <div style={{ ...chartBg, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <ChartTitle>6-Month Revenue Forecast</ChartTitle>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: data?.trend === 'upward' ? GREEN : '#ef4444', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
            {data?.trend === 'upward' ? '▲' : '▼'} {data?.trend?.toUpperCase()} TREND
          </div>
          <div style={{ color: '#475569', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>R² = {data?.r_squared}</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={combined} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
          <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)}/>
          <Tooltip content={<CustomTooltip />}/>
          <Line type="monotone" dataKey="revenue" name="Revenue" dot={(props) => {
            const isForecast = combined[props.index]?.type === 'forecast';
            return <circle cx={props.cx} cy={props.cy} r={isForecast ? 5 : 3} fill={isForecast ? PURPLE : AMBER} stroke="none"/>;
          }}
            stroke={AMBER} strokeWidth={2}
            strokeDasharray={(d) => d?.type === 'forecast' ? '5 4' : '0'}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 20, height: 2, background: AMBER }}/><span style={{ color: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>Actual</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 20, height: 2, background: PURPLE, borderTop: '2px dashed ' + PURPLE }}/><span style={{ color: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>Forecast</span></div>
      </div>
    </div>
  );
}
