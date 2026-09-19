import React, { useEffect, useState } from 'react';
import { getEpinSummary } from '../../api/managementService';

export default function EpinSummaryCards() {
  const [summary, setSummary] = useState({
    total: 0,
    available: 0,
    used: 0,
    blocked: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getEpinSummary()
      .then(res => {
        if (mounted && res.success && res.summary) {
          setSummary(res.summary);
        }
      })
      .catch(err => {
        console.error('Failed to fetch E-Pin summary:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
      <div style={{ background: '#22c55e', color: '#fff', padding: '20px', borderRadius: '8px', flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600' }}>Total E-pins</h4>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', alignSelf: 'flex-end' }}>
          {loading ? '...' : summary.total}
        </div>
      </div>
      
      <div style={{ background: '#0ea5e9', color: '#fff', padding: '20px', borderRadius: '8px', flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600' }}>Total Unused E-pins</h4>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', alignSelf: 'flex-end' }}>
          {loading ? '...' : summary.available}
        </div>
      </div>

      <div style={{ background: '#f97316', color: '#fff', padding: '20px', borderRadius: '8px', flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600' }}>Total Used E-pins</h4>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', alignSelf: 'flex-end' }}>
          {loading ? '...' : summary.used}
        </div>
      </div>

      <div style={{ background: '#a855f7', color: '#fff', padding: '20px', borderRadius: '8px', flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600' }}>Transfer E-pins</h4>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', alignSelf: 'flex-end' }}>
          {loading ? '...' : summary.blocked}
        </div>
      </div>
    </div>
  );
}
