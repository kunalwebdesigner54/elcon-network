import '../../Common/UserLayout.css';
import './CreateTicket.css';
import { useState } from 'react';
import { createSupportTicket } from '../../../../api/managementService';

function CreateTicket() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await createSupportTicket({ subject, message });
      setSuccess('Ticket submitted successfully.');
      setSubject('');
      setMessage('');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="user-page-title">Create Ticket</h1>
      <div className="user-panel">
        {success && <p style={{ color: '#2e7d32', padding: '0 0 12px' }}>{success}</p>}
        {error && <p style={{ color: '#c62828', padding: '0 0 12px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid create-ticket-grid">
            <label htmlFor="ticket-subject">Topic :</label>
            <textarea id="ticket-subject" rows="5" value={subject} onChange={(event) => setSubject(event.target.value)} required />
            <label htmlFor="ticket-message">Message</label>
            <textarea id="ticket-message" rows="6" value={message} onChange={(event) => setMessage(event.target.value)} required />
          </div>
          <div className="btn-row">
            <button className="user-btn-muted" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;
