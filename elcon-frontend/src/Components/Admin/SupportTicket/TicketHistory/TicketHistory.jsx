import './TicketHistory.css';
import { useEffect, useMemo, useState } from 'react';
import { getAdminSupportTickets } from '../../../../api/managementService';

function TicketHistory() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await getAdminSupportTickets();
        setTickets(response.data || []);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load support tickets.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return tickets;
    }

    return tickets.filter((ticket) =>
      [ticket.ticketNo, ticket.memberId, ticket.memberName, ticket.subject, ticket.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [search, tickets]);

  return (
    <div>
      <h1 className="page-title">Ticket History</h1>

      <div className="panel">
        <div className="btn-row">
          <button className="btn-outline">Excel</button>
        </div>

        <div className="table-tools">
          <div />
          <label className="search-box">
            Search:
            <input className="text-input" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </div>

        {error && <p style={{ color: '#c62828', padding: '0 16px 16px' }}>{error}</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Member ID</th>
                <th>Created Date</th>
                <th>Topic</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.ticketNo}>
                    <td>{ticket.ticketNo}</td>
                    <td>{ticket.memberId}</td>
                    <td>{ticket.createdDateLabel}</td>
                    <td>{ticket.subject}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.remark}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No support tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing {filteredTickets.length ? 1 : 0} to {filteredTickets.length} of {filteredTickets.length} entries</span>
          <div className="pagination">
            <button className="page-btn">Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketHistory;
