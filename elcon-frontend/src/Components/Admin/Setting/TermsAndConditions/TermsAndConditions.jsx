import React, { useState, useEffect, useRef } from 'react';
import '../../Common/AdminLayout.css';
import { getTermsAndConditions, updateTermsAndConditions } from '../../../../api/managementService';

// We could use a rich text editor like JoditEditor or react-quill if installed, 
// but assuming a standard textarea or simple editor to be safe. We will use a standard textarea 
// that accepts HTML. Or if JoditEditor is available, we can use it.
// Let's check package.json or assume standard textarea with HTML support for now to avoid crashes.

export default function AdminTermsAndConditions() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const data = await getTermsAndConditions();
      if (data && data.success) {
        setContent(data.termsAndConditions?.content || '');
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      setMessage({ text: 'Failed to load terms and conditions.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await updateTermsAndConditions({ content });
      if (response && response.success) {
        setMessage({ text: 'Terms and Conditions updated successfully!', type: 'success' });
      } else {
        setMessage({ text: response?.message || 'Failed to update.', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving terms:', error);
      setMessage({ text: 'Error saving terms.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Manage Terms and Conditions</h2>
      <div className="admin-panel" style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
        
        {message.text && (
          <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '8px', background: message.type === 'success' ? '#e8f5e9' : '#ffebee', color: message.type === 'success' ? '#2e7d32' : '#c62828' }}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ fontWeight: '600', color: 'var(--dark)' }}>Content (HTML supported)</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-soft)',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                resize: 'vertical'
              }}
              placeholder="Enter terms and conditions here... You can use HTML tags like <h1>, <p>, <ul> etc."
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary" 
                style={{ padding: '12px 24px', fontSize: '16px' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
