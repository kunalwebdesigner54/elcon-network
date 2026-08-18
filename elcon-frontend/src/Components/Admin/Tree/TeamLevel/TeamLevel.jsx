import './TeamLevel.css';

function TeamLevel() {
  return (
    <div>
      <h1 className="page-title">My Team Level</h1>

      <div className="panel">
        <div className="form-grid" style={{ maxWidth: 700 }}>
          <label className="field-label">Member ID</label>
          <input className="text-input" />

          <label className="field-label">Level</label>
          <select className="select-input">
            <option>Select Level</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <option key={item}>Level {item}</option>
            ))}
          </select>
        </div>

        <div className="btn-row">
          <button className="btn-primary">Show Details</button>
        </div>
        <div className="btn-row">
          <button className="btn-outline">Excel</button>
        </div>

        <div className="table-tools">
          <div />
          <label className="search-box">
            Search:
            <input className="text-input" />
          </label>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MemberID</th>
                <th>Name</th>
                <th>Sponsor ID</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IHH192108</td>
                <td>ANAMIKA SAXENA</td>
                <td />
                <td>23-06-2021</td>
              </tr>
              <tr>
                <td><strong>MemberID</strong></td>
                <td><strong>Name</strong></td>
                <td><strong>Sponsor ID</strong></td>
                <td><strong>Join Date</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Showing 1 to 1 of 1 entries</span>
          <div className="pagination">
            <button className="page-btn">Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamLevel;
