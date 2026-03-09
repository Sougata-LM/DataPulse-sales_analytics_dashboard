import React, { useState } from 'react';

export default function DataPreview({ uploadInfo }) {
  const [open, setOpen] = useState(false);
  if (!uploadInfo) return null;

  return (
    <div style={s.wrap}>
      <div style={s.header} onClick={() => setOpen(!open)}>
        <div style={s.left}>
          <span style={s.icon}>📁</span>
          <div>
            <div style={s.filename}>{uploadInfo.filename}</div>
            <div style={s.meta}>
              {uploadInfo.rows.toLocaleString()} rows · {uploadInfo.columns.length} columns
              {uploadInfo.cleaning_issues?.length > 0 && ` · ${uploadInfo.cleaning_issues.length} cleaning step(s)`}
            </div>
          </div>
        </div>
        <span style={s.toggle}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={s.body}>
          {uploadInfo.cleaning_issues?.length > 0 && (
            <div style={s.issues}>
              <div style={s.issuesTitle}>🧹 Data Cleaning Log</div>
              {uploadInfo.cleaning_issues.map((issue, i) => (
                <div key={i} style={s.issue}>• {issue}</div>
              ))}
            </div>
          )}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {uploadInfo.columns.map(col => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uploadInfo.preview.map((row, i) => (
                  <tr key={i}>
                    {uploadInfo.columns.map(col => (
                      <td key={col} style={s.td}>{String(row[col] ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, marginBottom: 20, overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', cursor: 'pointer',
  },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  icon: { fontSize: 20 },
  filename: { color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 2 },
  meta: { color: '#475569', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" },
  toggle: { color: '#475569', fontSize: 11 },
  body: { padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  issues: { padding: '12px 0', marginBottom: 12 },
  issuesTitle: { color: '#94a3b8', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  issue: { color: '#64748b', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: {
    color: '#475569', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '8px 12px', textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap',
  },
  td: {
    color: '#94a3b8', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
    padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)',
    whiteSpace: 'nowrap', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis',
  },
};
