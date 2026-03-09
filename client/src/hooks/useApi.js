import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE = '/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Unknown error';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading, error,
    uploadFile: (file) => call(() => {
      const fd = new FormData();
      fd.append('file', file);
      return axios.post(`${BASE}/upload`, fd).then(r => r.data);
    }),
    getSummary: () => call(() => axios.get(`${BASE}/summary`).then(r => r.data)),
    getRevenueTrend: (period) => call(() => axios.get(`${BASE}/revenue-trend`, { params: { period } }).then(r => r.data)),
    getTopProducts: (limit) => call(() => axios.get(`${BASE}/top-products`, { params: { limit } }).then(r => r.data)),
    getRegional: () => call(() => axios.get(`${BASE}/regional`).then(r => r.data)),
    getSegments: () => call(() => axios.get(`${BASE}/segments`).then(r => r.data)),
    getForecast: () => call(() => axios.get(`${BASE}/forecast`).then(r => r.data)),
    downloadReport: async () => {
      try {
        const response = await axios.get(`${BASE}/report`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sales_report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        alert('Failed to download report. Make sure the backend is running.');
      }
    },
  };
}
